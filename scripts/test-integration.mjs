// Runs against an isolated database and upload directory; never edits the real site.
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const testRoot = path.resolve('storage', `acceptance-${Date.now()}`)
await mkdir(testRoot, { recursive: true })
const port = 3100,
  base = `http://localhost:${port}`,
  demos = `http://127.0.0.1:${port}`
const password = randomBytes(24).toString('hex')
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PAYLOAD_SECRET: randomBytes(48).toString('hex'),
  DATABASE_URL: `file:${path.join(testRoot, 'test.db').replaceAll('\\', '/')}`,
  STORAGE_DIR: testRoot,
  SERVER_URL: base,
  DEMO_ORIGIN: demos,
  SEED_ADMIN_EMAIL: 'acceptance@example.test',
  SEED_ADMIN_PASSWORD: password,
  NEXT_TELEMETRY_DISABLED: '1',
}
function run(args) {
  const p = spawnSync(process.execPath, args, {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    timeout: 120000,
  })
  if (p.status !== 0) throw new Error(`Setup failed: ${p.stdout}\n${p.stderr}`)
}
run(['--import', 'tsx', 'node_modules/payload/bin.js', 'migrate'])
run(['--import', 'tsx', 'node_modules/payload/bin.js', 'run', 'scripts/seed.ts'])
// Re-running the import must not duplicate or overwrite existing content.
run(['--import', 'tsx', 'node_modules/payload/bin.js', 'run', 'scripts/seed.ts'])
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
  { env, stdio: ['ignore', 'pipe', 'pipe'] },
)
let logs = ''
server.stdout.on('data', (b) => {
  logs += b.toString()
})
server.stderr.on('data', (b) => {
  logs += b.toString()
})
const checks = []
function passed(name) {
  checks.push(name)
  console.log(`PASS ${name}`)
}
let token
async function api(url, options = {}, auth = true) {
  const headers = {
    ...(auth && token ? { Authorization: `JWT ${token}` } : {}),
    ...options.headers,
  }
  if (options.json) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.json)
    delete options.json
  }
  return fetch(url.startsWith('http') ? url : base + url, {
    ...options,
    headers,
    redirect: 'manual',
  })
}
async function jsonOK(response) {
  const text = await response.text()
  assert(response.ok, `${response.status}: ${text.slice(0, 800)}`)
  return JSON.parse(text)
}
// Minimal stored ZIP writer: avoids trusting external test fixtures.
function zip(entries) {
  let offset = 0
  const locals = [],
    central = []
  for (const [name, text] of entries) {
    const filename = Buffer.from(name),
      data = Buffer.from(text)
    let crc = -1
    for (const byte of data) {
      crc ^= byte
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    crc = (crc ^ -1) >>> 0
    const l = Buffer.alloc(30)
    l.writeUInt32LE(0x04034b50)
    l.writeUInt16LE(20, 4)
    l.writeUInt32LE(crc, 14)
    l.writeUInt32LE(data.length, 18)
    l.writeUInt32LE(data.length, 22)
    l.writeUInt16LE(filename.length, 26)
    const c = Buffer.alloc(46)
    c.writeUInt32LE(0x02014b50)
    c.writeUInt16LE(20, 4)
    c.writeUInt16LE(20, 6)
    c.writeUInt32LE(crc, 16)
    c.writeUInt32LE(data.length, 20)
    c.writeUInt32LE(data.length, 24)
    c.writeUInt16LE(filename.length, 28)
    c.writeUInt32LE(offset, 42)
    locals.push(l, filename, data)
    central.push(c, filename)
    offset += l.length + filename.length + data.length
  }
  const cd = Buffer.concat(central),
    end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}
async function upload(collection, name, bytes, mime, data) {
  const form = new FormData()
  form.set('_payload', JSON.stringify(data))
  form.set('file', new Blob([bytes], { type: mime }), name)
  return jsonOK(await api(`/api/${collection}`, { method: 'POST', body: form }))
}
try {
  let ready = false
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  assert(ready, 'Production server did not become ready')
  for (const route of [
    '/',
    '/works',
    '/about',
    '/plans',
    '/works/hermes-app',
    '/sitemap.xml',
    '/robots.txt',
    '/admin/login',
  ])
    assert.equal((await api(route, {}, false)).status, 200, route)
  passed('production pages, admin login, SEO routes respond')
  const projects = await jsonOK(await api('/api/projects?limit=100', {}, false))
  assert.equal(projects.totalDocs, 25)
  passed('25 legacy projects imported; repeated import is idempotent')
  assert.equal(
    (await api('/api/projects', { method: 'POST', json: { title: 'unauthorized' } }, false)).status,
    403,
  )
  assert.equal(
    (
      await api(
        '/api/globals/site-settings',
        { method: 'POST', json: { name: 'unauthorized' } },
        false,
      )
    ).status,
    403,
  )
  passed('anonymous writes rejected')
  const login = await jsonOK(
    await api(
      '/api/users/login',
      { method: 'POST', json: { email: env.SEED_ADMIN_EMAIL, password } },
      false,
    ),
  )
  token = login.token
  assert(token)
  passed('administrator authentication succeeds')
  const project = (
    await jsonOK(
      await api('/api/projects', {
        method: 'POST',
        json: {
          title: '验收作品',
          slug: 'acceptance-project',
          summary: '只有发布后才能公开',
          category: '验收',
          _status: 'draft',
          visibility: 'public',
        },
      }),
    )
  ).doc
  assert.equal((await api(`/api/projects/${project.id}`, {}, false)).status, 404)
  assert.equal((await api('/works/acceptance-project', {}, false)).status, 404)
  passed('draft is absent from public detail and REST API')
  // HTTP-only test cookie simulates the browser session returned by login.
  const preview = await api('/preview/acceptance-project', {
    headers: { Cookie: `payload-token=${token}` },
  })
  assert.equal(preview.status, 200)
  assert((await preview.text()).includes('草稿预览'))
  assert.equal((await api('/preview/acceptance-project', {}, false)).status, 307)
  passed('draft preview requires authenticated administrator')
  const textFile = (
    await upload('media', 'acceptance.txt', 'download verified', 'text/plain', {
      alt: '验收附件',
      public: false,
    })
  ).doc
  assert.equal((await api(`/api/media/file/${textFile.filename}`, {}, false)).status, 403)
  await jsonOK(await api(`/api/media/${textFile.id}`, { method: 'PATCH', json: { public: true } }))
  const published = (
    await jsonOK(
      await api(`/api/projects/${project.id}`, {
        method: 'PATCH',
        json: { _status: 'published', downloads: [{ label: '验收下载', file: textFile.id }] },
      }),
    )
  ).doc
  assert.equal((await api('/works/acceptance-project', {}, false)).status, 200)
  const attachment = published.downloads[0].id
  const download = await api(`/downloads/acceptance-project/${attachment}`, {}, false)
  assert.equal(download.status, 200)
  assert.equal(await download.text(), 'download verified')
  assert(download.headers.get('content-disposition').includes('attachment'))
  passed('file upload, media privacy, publication and real attachment bytes')
  await jsonOK(
    await api(`/api/projects/${project.id}?draft=true`, {
      method: 'PATCH',
      json: { summary: '尚未发布的新草稿', _status: 'draft' },
    }),
  )
  const stillPublic = await jsonOK(await api(`/api/projects/${project.id}`, {}, false))
  assert.equal(stillPublic.summary, '只有发布后才能公开')
  const latestDraft = await jsonOK(await api(`/api/projects/${project.id}?draft=true`))
  assert.equal(latestDraft.summary, '尚未发布的新草稿')
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { _status: 'published' } }),
  )
  passed('editing a published project as draft preserves its public version')
  const { default: sharp } = await import('sharp')
  const png = await sharp({ create: { width: 32, height: 24, channels: 3, background: '#d5ef79' } })
    .png()
    .toBuffer()
  const picture = (
    await upload('media', 'cover.png', png, 'image/png', { alt: '验收封面', public: true })
  ).doc
  assert(picture.width === 32 && picture.height === 24)
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { cover: picture.id } }),
  )
  const pictureResponse = await api(`/api/media/file/${picture.filename}`, {}, false)
  assert.equal(pictureResponse.status, 200)
  assert(pictureResponse.headers.get('content-type').includes('image/png'))
  assert((await (await api('/works/acceptance-project', {}, false)).text()).includes('验收封面'))
  passed('real image processing, media serving and cover rendering')
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { visibility: 'private' } }),
  )
  assert.equal((await api('/works/acceptance-project', {}, false)).status, 404)
  assert.equal((await api(`/downloads/acceptance-project/${attachment}`, {}, false)).status, 404)
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { visibility: 'public' } }),
  )
  passed('private project is blocked on detail and related download route')
  const demo = (
    await upload(
      'demos',
      'demo.zip',
      zip([
        ['site/index.html', '<h1>Demo version one</h1><script src="app.js"></script>'],
        ['site/app.js', 'document.body.dataset.ready="yes"'],
      ]),
      'application/zip',
      { title: '验收 Demo 1' },
    )
  ).doc
  assert.equal(demo.validation, 'ready', JSON.stringify(demo))
  assert.equal((await api(`${demos}/demo/${demo.id}/index.html`, {}, false)).status, 404)
  const previewRedirect = await api(`/preview-demo/${demo.id}`, {
    headers: { Cookie: `payload-token=${token}` },
  })
  assert.equal(previewRedirect.status, 302)
  const previewSetCookie = await api(previewRedirect.headers.get('location'), {}, false)
  assert.equal(previewSetCookie.status, 307)
  const signedPreview = previewSetCookie.headers.get('location')
  assert.equal((await api(signedPreview, {}, false)).status, 200)
  const previewScript = await api(signedPreview.replace(/index.html$/, 'app.js'), {}, false)
  assert.equal(previewScript.status, 200)
  assert.equal(previewScript.headers.get('access-control-allow-origin'), '*')
  passed('ZIP validation, nested root detection and private demo preview')
  await jsonOK(
    await api(`/api/projects/${project.id}`, {
      method: 'PATCH',
      json: { activeDemo: demo.id, _status: 'published' },
    }),
  )
  const demoPage = await api(`${demos}/demo/${demo.id}/index.html`, {}, false)
  assert.equal(demoPage.status, 200)
  assert((await demoPage.text()).includes('Demo version one'))
  assert.equal((await api(`${demos}/demo/${demo.id}/app.js`, {}, false)).status, 200)
  const publicDetail = await (await api('/works/acceptance-project', {}, false)).text()
  assert(
    publicDetail.includes(`/demo/${demo.id}/index.html`),
    'Demo link missing from public detail',
  )
  for (const route of ['/admin', '/api/projects', '/api/users/me'])
    assert.equal((await api(demos + route, {}, false)).status, 404)
  assert.equal((await api(`/demo/${demo.id}/index.html`, {}, false)).status, 404)
  passed('published demo serves real HTML/assets exclusively on isolated hostname')
  const invalid = (
    await upload(
      'demos',
      'invalid.zip',
      zip([['readme.txt', 'missing entry']]),
      'application/zip',
      { title: '无效 Demo' },
    )
  ).doc
  assert.equal(invalid.validation, 'failed')
  assert(
    !(
      await api(`/api/projects/${project.id}`, {
        method: 'PATCH',
        json: { activeDemo: invalid.id },
      })
    ).ok,
  )
  assert.equal((await api(`${demos}/demo/${demo.id}/index.html`, {}, false)).status, 200)
  const traversal = (
    await upload('demos', 'traversal.zip', zip([['../escape.html', 'bad']]), 'application/zip', {
      title: '路径测试',
    })
  ).doc
  assert.equal(traversal.validation, 'failed')
  passed('invalid/traversal ZIP cannot replace the published demo')
  const v2 = (
    await upload(
      'demos',
      'v2.zip',
      zip([['index.html', '<h1>Demo version two</h1>']]),
      'application/zip',
      { title: '验收 Demo 2' },
    )
  ).doc
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { activeDemo: v2.id } }),
  )
  assert.equal((await api(`${demos}/demo/${demo.id}/index.html`, {}, false)).status, 404)
  assert(
    (await (await api(`${demos}/demo/${v2.id}/index.html`, {}, false)).text()).includes(
      'version two',
    ),
  )
  await jsonOK(
    await api(`/api/projects/${project.id}`, { method: 'PATCH', json: { activeDemo: demo.id } }),
  )
  assert(
    (await (await api(`${demos}/demo/${demo.id}/index.html`, {}, false)).text()).includes(
      'version one',
    ),
  )
  passed('demo replacement and rollback preserve working versions')
  const plan = (
    await jsonOK(
      await api('/api/plans', {
        method: 'POST',
        json: { title: '验收计划', status: 'doing', project: project.id, _status: 'published' },
      }),
    )
  ).doc
  assert((await (await api('/plans', {}, false)).text()).includes('验收计划'))
  await jsonOK(
    await api(`/api/plans/${plan.id}`, { method: 'PATCH', json: { visibility: 'private' } }),
  )
  assert(!(await (await api('/plans', {}, false)).text()).includes('验收计划'))
  await jsonOK(
    await api('/api/globals/site-settings', { method: 'POST', json: { showPlans: false } }),
  )
  assert.equal((await api('/plans', {}, false)).status, 404)
  passed('plans CRUD, visibility and optional navigation setting')
  const filtered = await (await api('/works?q=Hermes', {}, false)).text()
  assert(filtered.includes('Hermes App'))
  assert(!filtered.includes('Novelist Web'))
  passed('search returns matching projects only')
  await writeFile(
    path.join(testRoot, 'report.json'),
    JSON.stringify({ passed: checks, time: new Date().toISOString() }, null, 2),
  )
  console.log(`ALL ${checks.length} INTEGRATION CHECKS PASSED`)
  if (process.env.KEEP_ACCEPTANCE_SERVER === '1') {
    await writeFile(
      path.join(testRoot, 'browser-session.json'),
      JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password, base }),
      { mode: 0o600 },
    )
    console.log(`Isolated browser verification server ready. Session file: ${testRoot}`)
    await new Promise((resolve) => {
      process.once('SIGINT', resolve)
      process.once('SIGTERM', resolve)
    })
  }
} catch (error) {
  // Logs are kept only in ignored local test storage and never contain generated credentials intentionally.
  await writeFile(path.join(testRoot, 'server.log'), logs)
  throw error
} finally {
  server.kill('SIGTERM')
  await rm(path.join(testRoot, 'browser-session.json'), { force: true })
}

import { getPayload } from 'payload'
import config from '../src/payload.config'
import snapshot from '../data.json'

export function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: text
        .split('\n')
        .filter(Boolean)
        .map((t) => ({
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
          children: [
            { type: 'text', text: t, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
          ],
        })),
    },
  }
}
const statusMap: Record<
  string,
  'developing' | 'released' | 'maintaining' | 'completed' | 'paused' | 'archived'
> = {
  运行中: 'released',
  日常使用: 'released',
  已发布: 'released',
  维护中: 'maintaining',
  已完成: 'completed',
  已归档: 'archived',
  已废弃: 'archived',
  暂停中: 'paused',
}
const payload = await getPayload({ config })
try {
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0 && process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    if (process.env.SEED_ADMIN_PASSWORD.length < 16) throw new Error('管理员密码至少需要 16 个字符')
    await payload.create({
      collection: 'users',
      data: {
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
        name: snapshot.name,
      },
    })
    console.log('Administrator created from environment (credentials omitted).')
  }
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  if (!settings.about)
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        name: snapshot.name,
        intro: snapshot.intro.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, ''),
        about: richText(
          '热爱创造，从代码到文字，从像素到世界。\n这里记录我的工具、游戏和实验，也记录它们从想法逐渐变成作品的过程。',
        ),
        skills: ['全栈开发', '游戏制作', '工具开发', '写作'].map((label) => ({ label })),
        contacts: [
          { label: 'GitHub', url: 'https://github.com/FennecMomo' },
          { label: 'Gitee', url: 'https://gitee.com/fennecmomo' },
        ],
        showPlans: true,
      },
    })
  let imported = 0
  for (const [index, old] of snapshot.projects.entries()) {
    const exists = await payload.count({
      collection: 'projects',
      where: { slug: { equals: old.id } },
    })
    if (exists.totalDocs) continue
    await payload.create({
      collection: 'projects',
      data: {
        title: old.name,
        slug: old.id,
        summary: old.summary,
        body: richText(old.detail),
        category: old.type || '其他',
        tags: old.tag
          .split(/[·,，]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((label) => ({ label })),
        projectStatus: statusMap[old.status] || 'developing',
        legacyStatus: old.status,
        completion: old.completion,
        showProgress: false,
        projectUpdatedAt: old.updated
          ? new Date(`${old.updated}T12:00:00+08:00`).toISOString()
          : null,
        sortOrder: 100 + index,
        featured: false,
        visibility: 'public',
        _status: 'published',
        links: old.link
          ? [
              {
                kind: /github\.com|gitee\.com/.test(old.link) ? 'source' : 'website',
                url: old.link,
              },
            ]
          : [],
      },
    })
    imported++
  }
  console.log(
    `Imported ${imported} projects. Existing records preserved. Source snapshot contains ${snapshot.projects.length} projects.`,
  )
} finally {
  await payload.destroy()
}

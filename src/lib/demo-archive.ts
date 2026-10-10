import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, rm, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import yauzl from 'yauzl'
import { archiveRoot, demoRoot } from './paths'

const MAX_FILES = 2500
const MAX_BYTES = 250 * 1024 * 1024
export function safeArchivePath(name: string) {
  if (
    !name ||
    name.includes('\\') ||
    name.includes('\0') ||
    name.startsWith('/') ||
    /[<>:"|?*]/.test(name)
  )
    return false
  return name
    .replace(/\/$/, '')
    .split('/')
    .every(
      (p) =>
        p &&
        p !== '.' &&
        p !== '..' &&
        !/[. ]$/.test(p) &&
        !/^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(p),
    )
}
export async function prepareDemo(id: string | number, filename: string) {
  if (!filename || path.basename(filename) !== filename) throw new Error('无效上传文件名')
  const staging = path.join(demoRoot, `.pending-${randomUUID()}`)
  const destination = path.join(demoRoot, String(id))
  await mkdir(staging, { recursive: true })
  let files = 0,
    bytes = 0
  const names: string[] = [],
    seen = new Set<string>()
  try {
    await new Promise<void>((resolve, reject) => {
      yauzl.open(
        path.join(archiveRoot, filename),
        { lazyEntries: true, validateEntrySizes: true },
        (error, zip) => {
          if (error || !zip) return reject(new Error('无法读取 ZIP 压缩包'))
          const fail = (err: unknown) => {
            zip.close()
            reject(err)
          }
          zip.on('error', fail)
          zip.on('end', resolve)
          zip.on('entry', async (entry: yauzl.Entry) => {
            try {
              if (++files > MAX_FILES) throw new Error('文件数超过 2500 个')
              if (!safeArchivePath(entry.fileName)) throw new Error('ZIP 含有不安全的路径')
              if ((entry.generalPurposeBitFlag & 1) !== 0) throw new Error('不支持加密 ZIP')
              const fileType = (entry.externalFileAttributes >>> 16) & 0xf000
              if (fileType && fileType !== 0x8000 && fileType !== 0x4000)
                throw new Error('不支持符号链接或特殊文件')
              const key = entry.fileName.replace(/\/$/, '').toLowerCase()
              if (seen.has(key)) throw new Error('ZIP 中存在重复路径')
              seen.add(key)
              const target = path.join(staging, entry.fileName)
              if (entry.fileName.endsWith('/')) {
                await mkdir(target, { recursive: true })
                zip.readEntry()
                return
              }
              if (entry.uncompressedSize > MAX_BYTES || bytes + entry.uncompressedSize > MAX_BYTES)
                throw new Error('解压总大小超过 250MB')
              names.push(entry.fileName)
              await mkdir(path.dirname(target), { recursive: true })
              const stream = await new Promise<import('node:stream').Readable>((res, rej) =>
                zip.openReadStream(entry, (err, s) => (err || !s ? rej(err) : res(s))),
              )
              const limiter = new Transform({
                transform(chunk, _, cb) {
                  bytes += chunk.length
                  cb(bytes > MAX_BYTES ? new Error('解压总大小超过 250MB') : null, chunk)
                },
              })
              await pipeline(stream, limiter, createWriteStream(target, { flags: 'wx' }))
              zip.readEntry()
            } catch (err) {
              fail(err)
            }
          })
          zip.readEntry()
        },
      )
    })
    let root = ''
    if (!names.includes('index.html')) {
      const top = names[0]?.split('/')[0]
      if (
        !top ||
        !names.every((n) => n.startsWith(`${top}/`)) ||
        !names.includes(`${top}/index.html`)
      )
        throw new Error('根目录或唯一顶层目录中需要 index.html')
      root = top
    }
    await stat(path.join(staging, root, 'index.html'))
    await rename(staging, destination)
    return root
  } catch (err) {
    // Only delete the unique extraction directory created by this invocation.
    await rm(staging, { recursive: true, force: true })
    throw err
  }
}

import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { demoRoot } from '@/lib/paths'
import { safeArchivePath } from '@/lib/demo-archive'
import { verifyDemoToken } from '@/lib/demo-token'
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; file?: string[] }> },
) {
  const { id, file } = await params
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 })
  const previewPath = file?.[0]?.startsWith('preview-')
  const preview = previewPath && verifyDemoToken(file![0].slice('preview-'.length), id)
  if (previewPath && !preview) return new Response('预览已过期', { status: 403 })
  const parts = previewPath ? file!.slice(1) : file
  const filename = parts?.length ? parts.join('/') : 'index.html'
  if (!safeArchivePath(filename)) return new Response('Not found', { status: 404 })
  const payload = await getPayload({ config })
  if (!preview) {
    const published = await payload.find({
      collection: 'projects',
      where: { activeDemo: { equals: Number(id) } },
      overrideAccess: false,
      depth: 0,
      limit: 1,
    })
    if (!published.docs.length) return new Response('Not found', { status: 404 })
  }
  const demo = await payload
    .findByID({ collection: 'demos', id, overrideAccess: true })
    .catch(() => null)
  if (!demo || demo.validation !== 'ready') return new Response('Not found', { status: 404 })
  try {
    const bytes = await readFile(path.join(demoRoot, id, demo.entryRoot || '', filename))
    return new Response(bytes, {
      headers: {
        'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy':
          "sandbox allow-scripts allow-forms allow-pointer-lock allow-downloads; frame-ancestors 'none'",
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

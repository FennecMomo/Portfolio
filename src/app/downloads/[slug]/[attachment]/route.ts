import { cms, media } from '@/lib/content'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { mediaRoot } from '@/lib/paths'
export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string; attachment: string }> },
) {
  const { slug, attachment } = await params
  const { docs } = await (
    await cms()
  ).find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    overrideAccess: false,
    depth: 1,
    limit: 1,
  })
  const file = media(docs[0]?.downloads?.find((d) => d.id === attachment)?.file)
  if (!file?.filename) return new Response('文件不存在或未公开', { status: 404 })
  try {
    return new Response(await readFile(path.join(mediaRoot, path.basename(file.filename))), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('文件不存在', { status: 404 })
  }
}

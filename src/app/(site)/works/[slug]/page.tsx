import { notFound } from 'next/navigation'
import { cache } from 'react'
import { cms } from '@/lib/content'
import { ProjectDetail } from '@/components/project-detail'
const getProject = cache(async (slug: string) =>
  (await cms())
    .find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      overrideAccess: false,
      limit: 1,
      depth: 1,
    })
    .then((r) => r.docs[0]),
)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug)
  return { title: p?.title || '作品未找到', description: p?.summary }
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug)
  if (!p) notFound()
  return <ProjectDetail project={p} />
}

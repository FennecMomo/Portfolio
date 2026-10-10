import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { cms } from '@/lib/content'
import { ProjectDetail } from '@/components/project-detail'
export const metadata = { title: '草稿预览', robots: { index: false, follow: false } }
export default async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  const payload = await cms()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  const { slug } = await params
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    draft: true,
    user,
    overrideAccess: false,
    depth: 1,
    limit: 1,
  })
  if (!docs[0]) notFound()
  return <ProjectDetail project={docs[0]} preview />
}

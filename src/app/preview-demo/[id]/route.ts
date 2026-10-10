import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { demoOrigin } from '@/lib/paths'
import { signDemoToken } from '@/lib/demo-token'
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('请先登录后台', { status: 401 })
  const { id } = await params
  const demo = await payload
    .findByID({ collection: 'demos', id, user, overrideAccess: false })
    .catch(() => null)
  if (!demo || demo.validation !== 'ready')
    return new Response('Demo 尚未通过验证', { status: 404 })
  return Response.redirect(`${demoOrigin()}/demo-preview/${id}?token=${signDemoToken(id)}`)
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyDemoToken } from '@/lib/demo-token'
import { demoOrigin } from '@/lib/paths'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!verifyDemoToken(token, id)) return new Response('预览已过期', { status: 403 })
  const res = NextResponse.redirect(`${demoOrigin()}/demo/${id}/preview-${token}/index.html`)
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('Referrer-Policy', 'no-referrer')
  return res
}

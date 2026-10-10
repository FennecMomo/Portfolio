import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const main = new URL(
    process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  )
  const demos = new URL(process.env.DEMO_ORIGIN || 'http://127.0.0.1:3000')
  const host = req.headers.get('host')
  const path = req.nextUrl.pathname
  const isDemo = path.startsWith('/demo/') || path.startsWith('/demo-preview/')
  if (main.hostname === demos.hostname)
    return new NextResponse('DEMO_ORIGIN must use a separate hostname', { status: 503 })
  // The demo hostname never serves the CMS, APIs, or main-site pages.
  if (host === demos.host && !isDemo) return new NextResponse('Not found', { status: 404 })
  if (isDemo && host !== demos.host) return new NextResponse('Not found', { status: 404 })
  if (host !== main.host && host !== demos.host)
    return new NextResponse('Unknown host', { status: 400 })
  return NextResponse.next()
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }

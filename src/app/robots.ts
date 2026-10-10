import { siteURL } from '@/lib/paths'
export const dynamic = 'force-dynamic'
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/preview', '/demo', '/downloads'],
    },
    sitemap: `${siteURL()}/sitemap.xml`,
  }
}

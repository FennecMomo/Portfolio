import { getProjects, getSettings } from '@/lib/content'
import { siteURL } from '@/lib/paths'
export const dynamic = 'force-dynamic'
export default async function sitemap() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()])
  return [
    ...['', '/works', '/about', ...(settings.showPlans ? ['/plans'] : [])].map((p) => ({
      url: siteURL() + p,
    })),
    ...projects.map((p) => ({ url: `${siteURL()}/works/${p.slug}`, lastModified: p.updatedAt })),
  ]
}

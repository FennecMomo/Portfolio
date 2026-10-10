import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Project, Media } from '@/payload-types'
export const cms = () => getPayload({ config })
export const getSettings = cache(async () =>
  (await cms()).findGlobal({ slug: 'site-settings', overrideAccess: false, depth: 1 }),
)
export const getProjects = cache(async () =>
  (await cms())
    .find({
      collection: 'projects',
      overrideAccess: false,
      depth: 1,
      limit: 500,
      sort: ['sortOrder', '-projectUpdatedAt'],
    })
    .then((r) => r.docs),
)
export const statusLabels: Record<string, string> = {
  developing: '开发中',
  released: '已发布',
  maintaining: '维护中',
  completed: '已完成',
  paused: '已暂停',
  archived: '已归档',
}
export const linkLabels: Record<string, string> = {
  live: '在线体验',
  source: '源代码',
  release: '发布版本',
  video: '演示视频',
  website: '访问网站',
}
export function media(value: number | Media | null | undefined) {
  return value && typeof value === 'object' && value.public ? value : null
}
export function dateLabel(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Shanghai',
      }).format(new Date(value))
    : ''
}
export function projectTags(project: Project) {
  return project.tags?.map((t) => t.label) || []
}

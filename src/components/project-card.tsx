import Link from 'next/link'
import type { Project } from '@/payload-types'
import { dateLabel, media, statusLabels } from '@/lib/content'

export function ProjectArt({ project, large = false }: { project: Project; large?: boolean }) {
  const cover = media(project.cover)
  const index = [...project.slug].reduce((a, b) => a + b.charCodeAt(0), 0) % 5
  return (
    <div className={`project-art art-${index} ${large ? 'art-large' : ''}`}>
      {cover?.url ? (
        <img src={cover.sizes?.card?.url || cover.url} alt={cover.alt} loading="lazy" />
      ) : (
        <>
          <div className="art-grid" />
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <span className="art-category">{project.category}</span>
          <span className="art-monogram" aria-hidden="true">
            {project.title.slice(0, 2)}
          </span>
          <span className="art-code">{project.slug.toUpperCase()}</span>
        </>
      )}
    </div>
  )
}
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="project-card" href={`/works/${project.slug}`}>
      <ProjectArt project={project} />
      <div className="card-content">
        <div className="card-meta">
          <span>{project.category}</span>
          <span className={`status status-${project.projectStatus}`}>
            {statusLabels[project.projectStatus || 'developing']}
          </span>
        </div>
        <h3>
          {project.title}
          <span aria-hidden="true">↗</span>
        </h3>
        <p>{project.summary}</p>
        <div className="card-bottom">
          <span>{dateLabel(project.projectUpdatedAt) || '持续探索'}</span>
          <span>查看作品 →</span>
        </div>
        {project.showProgress && project.completion != null && (
          <div className="progress" aria-label={`完成度 ${project.completion}%`}>
            <span style={{ width: `${project.completion}%` }} />
          </div>
        )}
      </div>
    </Link>
  )
}

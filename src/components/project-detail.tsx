import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Project } from '@/payload-types'
import { ProjectArt } from './project-card'
import { dateLabel, linkLabels, media, projectTags, statusLabels } from '@/lib/content'
import { demoOrigin } from '@/lib/paths'
export function ProjectDetail({
  project,
  preview = false,
}: {
  project: Project
  preview?: boolean
}) {
  const demoID =
    typeof project.activeDemo === 'object' ? project.activeDemo?.id : project.activeDemo
  return (
    <article className="detail wrap">
      {preview && (
        <div className="preview-banner">
          草稿预览 · 仅登录管理员可见{' '}
          <Link href={`/admin/collections/projects/${project.id}`}>返回编辑 ↗</Link>
        </div>
      )}
      <Link href="/works" className="back-link">
        ← 所有作品
      </Link>
      <div className="detail-heading">
        <div>
          <div className="eyebrow">{project.category} / PROJECT</div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        <span className={`status status-${project.projectStatus}`}>
          {statusLabels[project.projectStatus || 'developing']}
        </span>
      </div>
      <ProjectArt project={project} large />
      <div className="detail-body">
        <aside>
          <div className="eyebrow">PROJECT NOTES</div>
          <dl>
            <dt>项目状态</dt>
            <dd>{statusLabels[project.projectStatus || 'developing']}</dd>
            <dt>项目更新</dt>
            <dd>{dateLabel(project.projectUpdatedAt) || '未标注'}</dd>
            {project.showProgress && project.completion != null && (
              <>
                <dt>阶段进度</dt>
                <dd>{project.completion}%</dd>
              </>
            )}
          </dl>
          <div className="tag-list">
            {projectTags(project).map((t) => (
              <Link key={t} href={`/works?tag=${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        </aside>
        <div className="detail-main">
          <h2>关于这个作品</h2>
          {project.body ? (
            <div className="prose">
              <RichText data={project.body} />
            </div>
          ) : (
            <p>{project.summary}</p>
          )}
          {project.links?.length || demoID ? (
            <section className="detail-section">
              <h2>去体验，去探索。</h2>
              <div className="action-list">
                {demoID && (
                  <a
                    className="button"
                    href={
                      preview
                        ? `/preview-demo/${demoID}`
                        : `${demoOrigin()}/demo/${demoID}/index.html`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    在线 Demo ↗
                  </a>
                )}
                {project.links?.map((l) => (
                  <a
                    key={l.id}
                    className="button button-light"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l.label || linkLabels[l.kind]} ↗
                  </a>
                ))}
              </div>
            </section>
          ) : null}
          {project.gallery?.some((g) => media(g.image)) && (
            <section className="detail-section">
              <h2>作品画面</h2>
              <div className="gallery">
                {project.gallery.map((g) => {
                  const img = media(g.image)
                  return img?.url ? (
                    <figure key={g.id}>
                      <img src={img.url} alt={img.alt} loading="lazy" />
                      {img.caption && <figcaption>{img.caption}</figcaption>}
                    </figure>
                  ) : null
                })}
              </div>
            </section>
          )}
          {project.downloads?.some((d) => media(d.file)) && (
            <section className="detail-section">
              <h2>下载与附件</h2>
              {project.downloads.map((d) =>
                media(d.file) ? (
                  <a
                    className="download-row"
                    key={d.id}
                    href={`/downloads/${project.slug}/${d.id}`}
                  >
                    <span>↓ &nbsp; {d.label}</span>
                    <span>下载文件 ↗</span>
                  </a>
                ) : null,
              )}
            </section>
          )}
        </div>
      </div>
    </article>
  )
}

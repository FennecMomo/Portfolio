import Link from 'next/link'
import { getProjects, projectTags, statusLabels } from '@/lib/content'
import { ProjectCard } from '@/components/project-card'
export const metadata = { title: '全部作品' }
type Query = { q?: string; category?: string; tag?: string; status?: string; sort?: string }
export default async function Works({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams
  const all = await getProjects()
  const categories = [...new Set(all.map((p) => p.category))]
  const tags = [...new Set(all.flatMap(projectTags))].sort()
  const term = (query.q || '').trim().toLowerCase()
  const filtered = all.filter(
    (p) =>
      (!term ||
        `${p.title} ${p.summary} ${projectTags(p).join(' ')}`.toLowerCase().includes(term)) &&
      (!query.category || p.category === query.category) &&
      (!query.tag || projectTags(p).includes(query.tag)) &&
      (!query.status || p.projectStatus === query.status),
  )
  if (query.sort === 'updated')
    filtered.sort((a, b) => (b.projectUpdatedAt || '').localeCompare(a.projectUpdatedAt || ''))
  if (query.sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  return (
    <div className="wrap listing">
      <div className="eyebrow">THE COLLECTION / 作品集</div>
      <div className="page-heading">
        <h1>
          每一个想法，
          <br />
          <span>都值得一次尝试。</span>
        </h1>
        <p>
          从日常使用的小工具，
          <br />
          到不断生长的创意实验。
        </p>
      </div>
      <form className="filters" method="get">
        <label className="search-field">
          <span>搜索作品</span>
          <input
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="搜索名称、介绍或技术…"
          />
        </label>
        <label>
          <span>类型</span>
          <select name="category" defaultValue={query.category || ''}>
            <option value="">全部类型</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span>技术</span>
          <select name="tag" defaultValue={query.tag || ''}>
            <option value="">全部技术</option>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span>状态</span>
          <select name="status" defaultValue={query.status || ''}>
            <option value="">全部状态</option>
            {Object.entries(statusLabels).map(([v, label]) => (
              <option value={v} key={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>排序</span>
          <select name="sort" defaultValue={query.sort || 'recommended'}>
            <option value="recommended">推荐顺序</option>
            <option value="updated">最近更新</option>
            <option value="name">名称排序</option>
          </select>
        </label>
        <button className="button" type="submit">
          筛选 →
        </button>
      </form>
      <div className="results-meta">
        <span>{filtered.length} 件作品</span>
        {Object.values(query).some(Boolean) && <Link href="/works">清除筛选 ×</Link>}
      </div>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>暂时没有匹配的作品</h2>
          <p>试试其他关键词，或查看所有作品。</p>
          <Link href="/works" className="text-link">
            清除筛选 →
          </Link>
        </div>
      )}
    </div>
  )
}

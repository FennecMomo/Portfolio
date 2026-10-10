import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cms, getSettings, dateLabel } from '@/lib/content'
export const metadata = { title: '开发计划' }
export default async function Plans() {
  if (!(await getSettings()).showPlans) notFound()
  const { docs } = await (
    await cms()
  ).find({ collection: 'plans', overrideAccess: false, depth: 1, limit: 200, sort: '-targetDate' })
  const labels = { todo: '计划中', doing: '进行中', done: '已完成' }
  return (
    <div className="wrap plans-page">
      <div className="eyebrow">WORK IN PROGRESS / 持续生长</div>
      <div className="page-heading">
        <h1>
          下一步，
          <br />
          <span>继续探索。</span>
        </h1>
        <p>
          记录正在推进的事情，
          <br />
          也为尚未实现的想法留一个位置。
        </p>
      </div>
      {docs.length ? (
        <div className="timeline">
          {docs.map((p) => (
            <article key={p.id} className="plan">
              <div>
                <span className={`status plan-${p.status}`}>{labels[p.status]}</span>
                <p>{p.targetDate ? `目标日期 ${dateLabel(p.targetDate)}` : '时间待定'}</p>
              </div>
              <div>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                {typeof p.project === 'object' && p.project && (
                  <Link className="text-link" href={`/works/${p.project.slug}`}>
                    相关作品：{p.project.title} ↗
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-symbol">↗</span>
          <h2>新计划正在酝酿</h2>
          <p>确定要做的事情，会陆续记录在这里。</p>
          <Link className="text-link" href="/works">
            先看看已经做出的作品 →
          </Link>
        </div>
      )}
    </div>
  )
}

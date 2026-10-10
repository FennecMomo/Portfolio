import Link from 'next/link'
import { getProjects, getSettings } from '@/lib/content'
import { ProjectCard } from '@/components/project-card'
export default async function Home() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()])
  const featured = projects.filter((p) => p.featured)
  const selected = (featured.length ? featured : projects).slice(0, 6)
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> FENNEC MOMO / DIGITAL WORKSHOP
          </div>
          <h1>
            把想法，做成
            <br />
            <span>可以体验的作品。</span>
            <i aria-hidden="true">✳</i>
          </h1>
          <p>{settings.intro}</p>
          <div className="hero-actions">
            <Link className="button" href="/works">
              探索作品 <span>↗</span>
            </Link>
            <Link className="text-link" href="/about">
              认识一下我 →
            </Link>
          </div>
          <div className="hero-note">
            <span>代码 / 游戏 / 工具 / 文字</span>
            <span>不断尝试，持续迭代。</span>
          </div>
        </div>
        <div className="hero-object" aria-hidden="true">
          <div className="object-grid" />
          <span className="object-label">IDEAS INTO REALITY</span>
          <div className="sculpture">
            <div />
            <div />
            <div />
          </div>
          <span className="object-bottom">
            CREATE SOMETHING
            <br />
            <strong>THAT MATTERS.</strong>
          </span>
          <span className="object-symbol">↗</span>
        </div>
      </section>
      <div className="discipline-band">
        <div className="wrap">
          <span>全栈开发</span>
          <b>✳</b>
          <span>游戏制作</span>
          <b>✳</b>
          <span>实用工具</span>
          <b>✳</b>
          <span>创意实验</span>
        </div>
      </div>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / SELECTED WORK</div>
            <h2>
              {featured.length ? '精选作品' : '作品一览'}
              <span className="heading-dot">.</span>
            </h2>
          </div>
          <Link className="text-link" href="/works">
            全部 {projects.length} 件作品 ↗
          </Link>
        </div>
        {selected.length ? (
          <div className="project-grid">
            {selected.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">作品正在整理中，欢迎稍后回来看看。</div>
        )}
      </section>
      <section className="about-strip wrap">
        <div className="eyebrow">02 / THE PERSON BEHIND</div>
        <div>
          <h2>
            热爱创造。
            <br />
            从代码到文字，<span>从像素到世界。</span>
          </h2>
          <Link className="text-link" href="/about">
            更多关于我 ↗
          </Link>
        </div>
        <div className="strip-symbol" aria-hidden="true">
          ✳
        </div>
      </section>
    </>
  )
}

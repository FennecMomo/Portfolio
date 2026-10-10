import { RichText } from '@payloadcms/richtext-lexical/react'
import { getSettings, media } from '@/lib/content'
export const metadata = { title: '关于我' }
export default async function About() {
  const s = await getSettings()
  const avatar = media(s.avatar)
  return (
    <div className="wrap about-page">
      <div className="eyebrow">HELLO / 很高兴认识你</div>
      <div className="about-intro">
        <div>
          <h1>
            我是{s.name}
            <span className="heading-dot">.</span>
          </h1>
          <p className="lead">{s.intro}</p>
        </div>
        {avatar?.url ? (
          <img className="avatar" src={avatar.url} alt={avatar.alt} />
        ) : (
          <div className="about-emblem" aria-hidden="true">
            ✳
          </div>
        )}
      </div>
      <div className="about-columns">
        <h2>
          在不同的世界里，
          <br />
          做一点有趣的东西。
        </h2>
        <div>
          {s.about && (
            <div className="prose">
              <RichText data={s.about} />
            </div>
          )}
          <div className="tag-list">
            {s.skills?.map((t) => (
              <span key={t.id}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>
      <section id="contact" className="contact-panel">
        <div>
          <div className="eyebrow">LET’S CONNECT</div>
          <h2>一起聊聊新想法。</h2>
          <p>关于作品、技术，或者一个有趣的点子。</p>
        </div>
        <div className="contact-links">
          {s.contacts?.length ? (
            s.contacts.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer">
                {c.label}
                <span>↗</span>
              </a>
            ))
          ) : (
            <p>联系方式整理中。</p>
          )}
        </div>
      </section>
    </div>
  )
}

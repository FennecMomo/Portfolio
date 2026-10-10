import Link from 'next/link'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/content'
import { siteURL } from '@/lib/paths'
import './styles.css'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL(siteURL()),
  title: { default: '狐漠漠 — 作品与探索', template: '%s · 狐漠漠' },
  description: '全栈开发者、游戏制作人、业余写手。记录从想法到作品的每一步。',
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main">
          跳到主要内容
        </a>
        <header className="site-header">
          <div className="wrap nav">
            <Link className="brand" href="/">
              <span className="brand-mark">
                f<span>.</span>
              </span>
              <span>
                {settings.name}
                <small>BUILD / PLAY / EXPLORE</small>
              </span>
            </Link>
            <nav aria-label="主导航">
              <Link href="/works">作品</Link>
              <Link href="/about">关于我</Link>
              {settings.showPlans && <Link href="/plans">开发计划</Link>}
              <Link className="nav-contact" href="/about#contact">
                联系我 <span>↗</span>
              </Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer wrap">
          <div className="footer-top">
            <p>
              保持好奇，
              <br />
              <strong>继续创造。</strong>
            </p>
            <Link href="/about#contact" className="footer-arrow" aria-label="联系我">
              ↗
            </Link>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {settings.name}
            </span>
            <span>想法落地，作品说话。</span>
            <Link href="/admin">内容管理 ↗</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}

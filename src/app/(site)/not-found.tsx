import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="wrap empty-state">
      <div className="eyebrow">404 / NOT FOUND</div>
      <h1>这个作品暂时不在这里。</h1>
      <p>它可能尚未发布，或地址已经改变。</p>
      <Link className="button" href="/works">
        返回作品集 →
      </Link>
    </div>
  )
}

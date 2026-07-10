'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PawPrint, Search } from 'lucide-react'
import { useLocale } from '@/lib/i18n'

export default function NotFound() {
  const router = useRouter()
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const [q, setQ] = useState('')

  const links = [
    { href: '/', label: zh ? '首页' : 'Home' },
    { href: '/shop', label: zh ? '全部商品' : 'Shop All' },
    { href: '/new-arrivals', label: zh ? '新品' : 'New Arrivals' },
    { href: '/best-sellers', label: zh ? '热销' : 'Best Sellers' },
    { href: '/pet-quiz', label: zh ? '宠物问卷 🎁' : 'Pet Quiz 🎁' },
  ]

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <main className="container page-stack">
      <div className="nf">
        <div className="nf-decor nf-decor--1" aria-hidden="true"><PawPrint size={42} /></div>
        <div className="nf-decor nf-decor--2" aria-hidden="true"><PawPrint size={28} /></div>
        <div className="nf-decor nf-decor--3" aria-hidden="true"><PawPrint size={34} /></div>

        <div className="nf-code">404</div>
        <h1 className="nf-title">{zh ? '这只小家伙走丢啦' : 'This pup wandered off'}</h1>
        <p className="nf-desc">
          {zh
            ? '你要找的页面好像追着松鼠跑丢了。我们帮你回到正轨吧。'
            : "The page you're looking for chased a squirrel and got lost. Let's get you back on track."}
        </p>

        <form className="nf-search" onSubmit={onSubmit} role="search">
          <Search size={18} className="nf-search-icon" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={zh ? '搜索玩具、窝、牵引绳…' : 'Search for toys, beds, leashes…'}
            aria-label={zh ? '搜索商品' : 'Search products'}
          />
          <button type="submit">{zh ? '搜索' : 'Search'}</button>
        </form>

        <div className="nf-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nf-link-chip">{l.label}</Link>
          ))}
        </div>
      </div>
    </main>
  )
}

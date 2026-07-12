'use client'

import Link from 'next/link'
import { Truck, RotateCcw, ShieldCheck, MapPin, PawPrint, Heart } from 'lucide-react'
import { useLocale } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'

/**
 * Static, factual trust + value sections for the homepage. Copy is intentionally
 * safe (no fabricated stats or reviews). Refine wording anytime.
 */

export function TrustBar() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const items = [
    { icon: Truck, en: 'Free shipping over $80', zh: '满 $80 免运费' },
    { icon: RotateCcw, en: '30-day easy returns', zh: '30 天轻松退货' },
    { icon: ShieldCheck, en: 'Secure checkout', zh: '安全结账' },
    { icon: MapPin, en: 'Ships from the USA', zh: '美国本土发货' },
  ]
  return (
    <Reveal>
      <div className="trust-bar">
        {items.map(({ icon: Icon, en, zh: cn }) => (
          <span className="trust-item" key={en}>
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
            {zh ? cn : en}
          </span>
        ))}
      </div>
    </Reveal>
  )
}

export function ValueMarquee() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const phrases = zh
    ? ['满 $80 免运费', '30 天轻松退货', '美国本土发货', '安全结账', '专为猫狗打造', '支持流浪动物']
    : ['Free shipping over $80', '30-day easy returns', 'Ships from the USA', 'Secure checkout', 'Made for dogs & cats', 'Supporting shelter pets']
  // Render twice for a seamless -50% loop.
  const loop = [...phrases, ...phrases]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((p, i) => (
          <span className="marquee-item" key={i}>
            {p}
            <span className="marquee-dot">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function ShopByPet() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const tiles = [
    { href: '/shop?pet=dog', emoji: '🐕', label: zh ? '狗狗专区' : 'For Dogs', cls: 'cat-tile--dogs' },
    { href: '/shop?pet=cat', emoji: '🐈', label: zh ? '猫咪专区' : 'For Cats', cls: 'cat-tile--cats' },
    { href: '/new-arrivals', emoji: '✨', label: zh ? '新品上架' : 'New Arrivals', cls: 'cat-tile--new' },
    { href: '/best-sellers', emoji: '⭐', label: zh ? '人气热销' : 'Best Sellers', cls: 'cat-tile--best' },
  ]
  return (
    <Reveal>
      <div className="cat-tiles">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`cat-tile ${t.cls}`}>
            <span className="cat-tile-emoji" aria-hidden="true">{t.emoji}</span>
            <span className="cat-tile-label">{t.label}</span>
            <span className="cat-tile-sub">{zh ? '去逛逛' : 'Shop now'} →</span>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}

export function WhyPawll() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const features = [
    { icon: PawPrint, en: ['Curated for happy pets', 'Toys, apparel & leashes chosen for real pets — not shelves.'], zh: ['为快乐宠物精选', '玩具、服饰与牵引绳，为真实的宠物挑选。'] },
    { icon: Truck, en: ['Fast US shipping', 'Ships quickly from our Virginia warehouse.'], zh: ['美国快速发货', '从弗吉尼亚仓库快速发出。'] },
    { icon: RotateCcw, en: ['30-day happiness guarantee', 'Not the right fit? Send it back within 30 days.'], zh: ['30 天满意保证', '不合适？30 天内可退。'] },
    { icon: Heart, en: ['We love shelter pets', 'We partner with local rescues to help pets find homes.'], zh: ['关爱流浪宠物', '我们与本地救助站合作，帮助宠物找到家。'] },
  ]
  return (
    <Reveal>
      <section className="section-oval section-oval--collections">
        <span className="home-eyebrow">{zh ? '为什么选择 PawLL' : 'Why PawLL'}</span>
        <h2 style={{ marginTop: 0 }}>{zh ? '给宠物更好的选择' : 'A better choice for your best friend'}</h2>
        <div className="info-cards" style={{ marginBottom: 0 }}>
          {features.map(({ icon: Icon, en, zh: cn }) => {
            const [title, desc] = zh ? cn : en
            return (
              <div className="info-card info-card--interactive" key={title}>
                <Icon size={28} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            )
          })}
        </div>
      </section>
    </Reveal>
  )
}

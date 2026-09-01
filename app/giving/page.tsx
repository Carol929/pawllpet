'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HandHeart, ShoppingBag, Percent, PawPrint, ExternalLink } from 'lucide-react'
import { useLocale } from '@/lib/i18n'

interface DonationRecord {
  id: string
  organization: string
  amount: number
  donatedAt: string
  note: string | null
  link: string | null
  imageUrl: string | null
}

interface GivingStats {
  rate: number
  pledged: number
  donated: number
  orderCount: number
  donations: DonationRecord[]
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function GivingPage() {
  const { locale } = useLocale()
  const en = locale !== 'zh'
  const [stats, setStats] = useState<GivingStats | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('/api/giving')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setStats)
      .catch(() => setFailed(true))
  }, [])

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(en ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <main className="container page-stack">
      {/* Hero */}
      <section className="about-hero giving-hero">
        <span className="giving-hero-badge">
          <HandHeart size={18} /> PawLL Gives Back
        </span>
        <h1 className="about-hero-title">
          {en ? '1% of every order helps shelter pets.' : '每笔订单的 1%，帮助收容所的毛孩子。'}
        </h1>
        <p className="about-hero-slogan">
          {en
            ? "Every time you shop at PawLL, we automatically set aside 1% of your order for animal shelters and rescues. No donation buttons, no extra cost — it's built into every purchase."
            : '每次在 PawLL 购物，我们都会自动把订单金额的 1% 拨入捐款池，捐给动物收容所和救助组织。无需额外操作，也不多花一分钱 —— 公益内置于每一笔订单。'}
        </p>
      </section>

      {/* Live counters */}
      <section className="giving-stats" aria-live="polite">
        <div className="giving-stat-card giving-stat-card--primary">
          <span className="giving-stat-label">{en ? 'Pledged to date' : '累计承诺捐款'}</span>
          <span className="giving-stat-value">
            {stats ? usd(stats.pledged) : failed ? '—' : '…'}
          </span>
          <span className="giving-stat-hint">
            {en
              ? '1% of all paid orders, tallied automatically'
              : '所有已支付订单的 1%，系统自动累计'}
          </span>
        </div>
        <div className="giving-stat-card">
          <span className="giving-stat-label">{en ? 'Donated so far' : '已捐出'}</span>
          <span className="giving-stat-value">
            {stats ? usd(stats.donated) : failed ? '—' : '…'}
          </span>
          <span className="giving-stat-hint">
            {en ? 'Delivered to shelters & rescues' : '已送达收容所与救助组织'}
          </span>
        </div>
        <div className="giving-stat-card">
          <span className="giving-stat-label">{en ? 'Orders contributing' : '参与订单数'}</span>
          <span className="giving-stat-value">
            {stats ? stats.orderCount.toLocaleString() : failed ? '—' : '…'}
          </span>
          <span className="giving-stat-hint">
            {en ? 'Every single order counts' : '每一笔订单都在贡献'}
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="about-section">
        <h2>{en ? 'How It Works' : '它是如何运作的'}</h2>
        <div className="info-cards">
          <div className="info-card">
            <ShoppingBag size={28} />
            <h3>{en ? '1. You shop' : '1. 你购物'}</h3>
            <p>
              {en
                ? 'Pick out toys, beds, and treats your pet will love — just like always.'
                : '像往常一样，为你的宠物挑选喜欢的玩具、窝和零食。'}
            </p>
          </div>
          <div className="info-card">
            <Percent size={28} />
            <h3>{en ? '2. We set aside 1%' : '2. 我们拨出 1%'}</h3>
            <p>
              {en
                ? "The moment your payment clears, 1% of your order's merchandise value is added to our giving pledge."
                : '你的付款确认后，订单商品金额的 1% 会立即计入捐款池。'}
            </p>
          </div>
          <div className="info-card">
            <PawPrint size={28} />
            <h3>{en ? '3. Shelters get it' : '3. 收容所收到它'}</h3>
            <p>
              {en
                ? 'We regularly donate the pledged funds to local animal shelters and rescues — and log every donation right here.'
                : '我们定期把累计的款项捐给本地动物收容所和救助组织，每一笔都公示在这个页面上。'}
            </p>
          </div>
        </div>
      </section>

      {/* Shelter photos */}
      <section className="about-section">
        <h2>{en ? "Who You're Helping" : '你在帮助谁'}</h2>
        <p>
          {en
            ? "These are some of the shelter friends we've met along the way. Your orders help provide food, toys, and care for animals still waiting for their forever homes."
            : '这些是我们在走访中遇到的收容所朋友。你的订单会为仍在等待领养的动物们提供食物、玩具和照护。'}
        </p>
        <div className="about-photo-gallery">
          <div className="about-photo-item">
            <Image
              src="/shelter/shelter-cats-1.jpg"
              alt={en ? 'Two shelter cats with feather toys' : '两只玩羽毛玩具的收容所猫咪'}
              width={600}
              height={450}
              className="about-photo-img"
            />
            <p className="about-photo-caption">
              {en ? 'Playtime funded by orders like yours' : '这些玩耍时光，来自像你一样的订单'}
            </p>
          </div>
          <div className="about-photo-item">
            <Image
              src="/shelter/shelter-cats-2.jpg"
              alt={en ? 'A shelter cat with a felt ball' : '玩毛毡球的收容所猫咪'}
              width={600}
              height={450}
              className="about-photo-img"
            />
            <p className="about-photo-caption">
              {en ? 'Every visit reminds us why we do this' : '每次探访都提醒我们为什么坚持'}
            </p>
          </div>
        </div>
      </section>

      {/* Donation log */}
      <section className="about-section">
        <h2>{en ? 'Donation Log' : '捐款记录'}</h2>
        <p>
          {en
            ? 'Full transparency: every donation we make is recorded below, newest first.'
            : '完全透明：我们捐出的每一笔款项都记录在下方，最新的在最前。'}
        </p>
        {!stats && !failed && <p className="giving-log-empty">{en ? 'Loading…' : '加载中…'}</p>}
        {failed && (
          <p className="giving-log-empty">
            {en
              ? "Couldn't load the donation log right now — please check back soon."
              : '暂时无法加载捐款记录，请稍后再来看看。'}
          </p>
        )}
        {stats && stats.donations.length === 0 && (
          <div className="giving-log-empty">
            <HandHeart size={28} />
            <p>
              {en
                ? 'Our first donation is being prepared — the pledge above is already accumulating with every order. Check back soon!'
                : '第一笔捐款正在准备中 —— 上面的捐款池已经在随每笔订单增长。敬请期待！'}
            </p>
          </div>
        )}
        {stats && stats.donations.length > 0 && (
          <ul className="giving-log">
            {stats.donations.map((d) => (
              <li key={d.id} className="giving-log-row">
                {d.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element -- admin-hosted proof photo, unknown remote domain */
                  <img
                    src={d.imageUrl}
                    alt={d.organization}
                    className="giving-log-img"
                    loading="lazy"
                  />
                )}
                <div className="giving-log-body">
                  <span className="giving-log-date">{fmtDate(d.donatedAt)}</span>
                  <h3 className="giving-log-org">
                    {d.organization}
                    {d.link && (
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={en ? `Visit ${d.organization}` : `访问 ${d.organization}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </h3>
                  {d.note && <p className="giving-log-note">{d.note}</p>}
                </div>
                <span className="giving-log-amount">{usd(d.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fine print */}
      <section className="giving-fineprint">
        <h3>{en ? 'The math, in plain words' : '计算方式说明'}</h3>
        <p>
          {en
            ? 'The pledge is 1% of the merchandise subtotal of every paid order (after discounts, excluding shipping and tax). Cancelled and refunded orders are removed automatically. The counters on this page are calculated live from our order records.'
            : '捐款池按每笔已支付订单的商品小计（扣除折扣后，不含运费和税费）的 1% 计算。已取消和已退款的订单会自动剔除。本页数字由订单记录实时计算得出。'}
        </p>
        <p>
          {en
            ? 'Donations go to local animal shelters and rescues. Want to suggest a shelter? Reach out at support@pawllpet.com.'
            : '款项将捐给本地动物收容所和救助组织。想推荐一家收容所？欢迎联系 support@pawllpet.com。'}
        </p>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>{en ? 'Shop with a purpose' : '带着善意购物'}</h2>
        <p>
          {en
            ? 'Your pet gets something great. A shelter pet gets a little help. Everybody wins.'
            : '你的宠物收获好物，收容所的毛孩子获得帮助 —— 双赢。'}
        </p>
        <Link href="/shop" className="btn-primary">
          {en ? 'Shop Now' : '立即购物'} →
        </Link>
      </section>
    </main>
  )
}

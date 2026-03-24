'use client'

import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { Star, Gift, ShoppingBag, Users } from 'lucide-react'
import Link from 'next/link'

export default function RewardsPage() {
  const { locale } = useLocale()
  const { user } = useAuth()

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '爪印积分奖励' : 'Paw Points Rewards'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '购物赚积分，兑换专属奖励' : 'Earn points with every purchase, redeem for exclusive rewards'}</p>

      {user && (
        <div className="rewards-balance">
          <Star size={32} />
          <div className="rewards-points-big">0</div>
          <div>{locale === 'zh' ? '当前积分' : 'Current Points'}</div>
        </div>
      )}

      <div className="info-cards">
        <div className="info-card">
          <ShoppingBag size={28} />
          <h3>{locale === 'zh' ? '购物赚积分' : 'Earn Points'}</h3>
          <p>{locale === 'zh' ? '每消费 $1 获得 1 爪印积分' : 'Earn 1 Paw Point for every $1 spent'}</p>
        </div>
        <div className="info-card">
          <Gift size={28} />
          <h3>{locale === 'zh' ? '兑换奖励' : 'Redeem Rewards'}</h3>
          <p>{locale === 'zh' ? '100 积分 = $5 折扣券' : '100 points = $5 discount'}</p>
        </div>
        <div className="info-card">
          <Users size={28} />
          <h3>{locale === 'zh' ? '推荐好友' : 'Refer Friends'}</h3>
          <p>{locale === 'zh' ? '推荐好友注册额外获得 50 积分' : 'Get 50 bonus points for each friend referral'}</p>
        </div>
      </div>

      <div className="rewards-tiers">
        <h2>{locale === 'zh' ? '会员等级' : 'Membership Tiers'}</h2>
        <div className="rewards-tier-grid">
          <div className="rewards-tier">
            <h3>🐾 {locale === 'zh' ? '新手' : 'Newcomer'}</h3>
            <p>0 - 199 {locale === 'zh' ? '积分' : 'pts'}</p>
            <p className="rewards-tier-perk">{locale === 'zh' ? '基础积分倍率 1x' : '1x point multiplier'}</p>
          </div>
          <div className="rewards-tier">
            <h3>⭐ {locale === 'zh' ? '忠实伙伴' : 'Loyal Pal'}</h3>
            <p>200 - 499 {locale === 'zh' ? '积分' : 'pts'}</p>
            <p className="rewards-tier-perk">{locale === 'zh' ? '1.5x 积分倍率 + 免费配送' : '1.5x multiplier + free shipping'}</p>
          </div>
          <div className="rewards-tier">
            <h3>👑 {locale === 'zh' ? 'VIP' : 'VIP'}</h3>
            <p>500+ {locale === 'zh' ? '积分' : 'pts'}</p>
            <p className="rewards-tier-perk">{locale === 'zh' ? '2x 积分 + 优先发货 + 专属折扣' : '2x points + priority shipping + exclusive discounts'}</p>
          </div>
        </div>
      </div>

      {!user && (
        <div className="rewards-cta">
          <Link href="/auth?tab=signup" className="btn-primary">{locale === 'zh' ? '注册开始赚积分' : 'Sign Up to Start Earning'}</Link>
        </div>
      )}
    </main>
  )
}

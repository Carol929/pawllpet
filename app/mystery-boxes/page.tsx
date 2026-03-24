'use client'

import { ProductGrid } from '@/components/ProductGrid'
import { useLocale } from '@/lib/i18n'
import { useProducts } from '@/lib/use-products'
import { Gift, Sparkles, Star } from 'lucide-react'

export default function MysteryBoxes() {
  const { t } = useLocale()
  const { products, loading } = useProducts({ isBundle: 'true', limit: '12' })

  return (
    <main className="container page-stack">
      <h1 className="page-title">{t('pages', 'mysteryBoxes')}</h1>
      <p className="page-subtitle">{t('pages', 'mysteryBoxesDesc')}</p>

      <div className="info-cards">
        <div className="info-card">
          <Gift size={28} />
          <h3>{t('pages', 'mbSurprise')}</h3>
          <p>{t('pages', 'mbSurpriseDesc')}</p>
        </div>
        <div className="info-card">
          <Sparkles size={28} />
          <h3>{t('pages', 'mbThemed')}</h3>
          <p>{t('pages', 'mbThemedDesc')}</p>
        </div>
        <div className="info-card">
          <Star size={28} />
          <h3>{t('pages', 'mbRewards')}</h3>
          <p>{t('pages', 'mbRewardsDesc')}</p>
        </div>
      </div>

      {loading ? (
        <p className="page-loading">{t('account', 'loading')}</p>
      ) : products.length > 0 ? (
        <ProductGrid items={products} />
      ) : (
        <p className="page-empty">{t('pages', 'mysteryBoxesSoon')}</p>
      )}
    </main>
  )
}

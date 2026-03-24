'use client'

import { useState } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { useLocale } from '@/lib/i18n'
import { useProducts } from '@/lib/use-products'
import { Gamepad2, Bed, Scissors, Utensils, Luggage, Shirt, Cookie, Gem } from 'lucide-react'

const categories = [
  { slug: 'toys', icon: Gamepad2 },
  { slug: 'beds', icon: Bed },
  { slug: 'grooming', icon: Scissors },
  { slug: 'feeders', icon: Utensils },
  { slug: 'travel', icon: Luggage },
  { slug: 'apparel', icon: Shirt },
  { slug: 'treats', icon: Cookie },
  { slug: 'accessories', icon: Gem },
]

export default function ShopByNeed() {
  const { t } = useLocale()
  const [selected, setSelected] = useState<string | null>(null)
  const { products, loading } = useProducts(selected ? { category: selected, limit: '20' } : { limit: '20' })

  return (
    <main className="container page-stack">
      <h1 className="page-title">{t('pages', 'shopByNeed')}</h1>
      <p className="page-subtitle">{t('pages', 'shopByNeedDesc')}</p>

      <div className="filter-cards filter-cards--wrap">
        {categories.map(({ slug, icon: Icon }) => (
          <button
            key={slug}
            className={`filter-card filter-card--sm ${selected === slug ? 'filter-card--active' : ''}`}
            onClick={() => setSelected(selected === slug ? null : slug)}
          >
            <Icon size={24} />
            <span>{t('nav', slug as 'toys')}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="page-loading">{t('account', 'loading')}</p>
      ) : products.length > 0 ? (
        <ProductGrid items={products} />
      ) : (
        <p className="page-empty">{t('pages', 'noProductsFound')}</p>
      )}
    </main>
  )
}

'use client'

import { useState } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { useLocale } from '@/lib/i18n'
import { useProducts } from '@/lib/use-products'
import { Dog, Cat, Heart } from 'lucide-react'

const petTypes = [
  { key: 'Dog' as const, icon: Dog },
  { key: 'Cat' as const, icon: Cat },
  { key: 'Both' as const, icon: Heart },
]

export default function ShopByPet() {
  const { t } = useLocale()
  const [selected, setSelected] = useState<string | null>(null)
  const { products, loading } = useProducts(selected ? { petType: selected, limit: '20' } : { limit: '20' })

  return (
    <main className="container page-stack">
      <h1 className="page-title">{t('pages', 'shopByPet')}</h1>
      <p className="page-subtitle">{t('pages', 'shopByPetDesc')}</p>

      <div className="filter-cards">
        {petTypes.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className={`filter-card ${selected === key ? 'filter-card--active' : ''}`}
            onClick={() => setSelected(selected === key ? null : key)}
          >
            <Icon size={32} />
            <span>{t('pages', key === 'Dog' ? 'dogs' : key === 'Cat' ? 'cats' : 'allPets')}</span>
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

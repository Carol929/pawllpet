'use client'

import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { collections } from '@/lib/products'
import { HeroCarousel } from '@/components/HeroCarousel'
import { useLocale } from '@/lib/i18n'
import { useProducts } from '@/lib/use-products'

export default function HomePage() {
  const { t } = useLocale()
  const { products: newArrivals } = useProducts({ isNew: 'true', limit: '4' })
  const { products: best } = useProducts({ isBestSeller: 'true', limit: '4' })

  return (
    <main className="container page-stack">
      <HeroCarousel />

      <section className="section-oval section-oval--collections">
        <h2>{t('home', 'featuredCollections')}</h2>
        <div className="collections-grid">
          {collections.map((c) => (
            <article key={c.slug} className="collection-card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <Link href={`/collections/${c.slug}`}>{t('home', 'explore')}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-oval section-oval--arrivals">
        <h2>{t('home', 'newArrivals')}</h2>
        <ProductGrid items={newArrivals} />
      </section>

      <section className="section-oval section-oval--best">
        <h2>{t('home', 'bestSellers')}</h2>
        <ProductGrid items={best} />
      </section>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { collections } from '@/lib/static-data'
import { HeroCarousel } from '@/components/HeroCarousel'
import { useLocale } from '@/lib/i18n'
import { Product } from '@/lib/product-types'

export default function HomePage() {
  const { t } = useLocale()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [best, setBest] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/homepage')
      .then(r => r.json())
      .then(data => {
        setAllProducts(data.allProducts || [])
        setNewArrivals(data.newArrivals || [])
        setBest(data.bestSellers || [])
      })
      .catch(() => {})
  }, [])

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

      <section className="section-oval">
        <h2>{t('home', 'allProducts')}</h2>
        <ProductGrid items={allProducts} />
      </section>

      {newArrivals.length > 0 && (
        <section className="section-oval section-oval--arrivals">
          <h2>{t('home', 'newArrivals')}</h2>
          <ProductGrid items={newArrivals} />
        </section>
      )}

      {best.length > 0 && (
        <section className="section-oval section-oval--best">
          <h2>{t('home', 'bestSellers')}</h2>
          <ProductGrid items={best} />
        </section>
      )}
    </main>
  )
}

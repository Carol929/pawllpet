'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { collections } from '@/lib/static-data'
import { HeroCarousel } from '@/components/HeroCarousel'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/product-types'
import { PawPrint } from 'lucide-react'

interface PetData { id: string; name: string; type: string }

export default function HomePage() {
  const { t, locale } = useLocale()
  const { user } = useAuth()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [best, setBest] = useState<Product[]>([])
  const [pets, setPets] = useState<PetData[]>([])
  const [petRecs, setPetRecs] = useState<Product[]>([])

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

  // Fetch pets and personalized recommendations
  useEffect(() => {
    if (!user) { setPets([]); setPetRecs([]); return }
    fetch('/api/pets')
      .then(r => r.json())
      .then((petList: PetData[]) => {
        setPets(petList)
        if (petList.length > 0) {
          const petType = petList[0].type // Use first pet's type
          fetch(`/api/products?petType=${petType}&limit=4`)
            .then(r => r.json())
            .then(data => setPetRecs(data.products || []))
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [user])

  const petNames = pets.map(p => p.name).join(' & ')

  return (
    <main className="container page-stack">
      <HeroCarousel />

      {/* Personalized Recommendations */}
      {pets.length > 0 && petRecs.length > 0 && (
        <section className="section-oval section-oval--personalized">
          <h2>
            <PawPrint size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {locale === 'zh' ? `为 ${petNames} 推荐` : `Picks for ${petNames}`}
          </h2>
          <ProductGrid items={petRecs} />
        </section>
      )}

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

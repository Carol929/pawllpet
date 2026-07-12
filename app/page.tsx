'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { HeroCarousel } from '@/components/HeroCarousel'
import { TrustBar, ValueMarquee, WhyPawll, ShopByPet } from '@/components/HomeSections'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { CustomerLove } from '@/components/CustomerLove'
import { Reveal } from '@/components/Reveal'
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
      <TrustBar />
      <ShopByPet />

      {/* Personalized Recommendations */}
      {pets.length > 0 && petRecs.length > 0 && (
        <Reveal>
          <section className="section-oval section-oval--personalized">
            <h2>
              <PawPrint size={22} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {locale === 'zh' ? `为 ${petNames} 推荐` : `Picks for ${petNames}`}
            </h2>
            <ProductGrid items={petRecs} />
          </section>
        </Reveal>
      )}

      {/* Pet Quiz CTA */}
      <Reveal>
        <section className="quiz-cta">
          <PawPrint size={32} />
          <div>
            <h2>{locale === 'zh' ? '不知道买什么？试试宠物问卷！' : "Not sure what to get? Take the Pet Quiz!"}</h2>
            <p>{locale === 'zh' ? '回答几个问题，获得个性化推荐 + 免费赠品' : 'Answer a few questions for personalized picks + a free gift'}</p>
          </div>
          <Link href="/pet-quiz" className="btn-primary">{locale === 'zh' ? '开始问卷' : 'Take the Quiz'} →</Link>
        </section>
      </Reveal>

      {newArrivals.length > 0 && (
        <section className="section-oval section-oval--arrivals">
          <span className="home-eyebrow">{locale === 'zh' ? '新品上架' : 'Just landed'}</span>
          <h2 style={{ marginTop: 0 }}>{t('home', 'newArrivals')}</h2>
          <ProductGrid items={newArrivals} />
        </section>
      )}

      <ValueMarquee />

      {best.length > 0 && (
        <section className="section-oval section-oval--best">
          <span className="home-eyebrow">{locale === 'zh' ? '人气之选' : 'Crowd favorites'}</span>
          <h2 style={{ marginTop: 0 }}>{t('home', 'bestSellers')}</h2>
          <ProductGrid items={best} />
        </section>
      )}

      <WhyPawll />

      <CustomerLove />

      <section className="section-oval">
        <h2>{t('home', 'allProducts')}</h2>
        <ProductGrid items={allProducts} />
      </section>

      <RecentlyViewed />
    </main>
  )
}

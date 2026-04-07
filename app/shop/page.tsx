'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { Product } from '@/lib/products'

const CATEGORY_SECTIONS = [
  { slug: 'toys', en: 'Toys', zh: '玩具' },
  { slug: 'accessories', en: 'Accessories', zh: '配饰' },
  { slug: 'beds', en: 'Beds', zh: '宠物床' },
  { slug: 'bowls', en: 'Bowls', zh: '食盆' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const pet = searchParams.get('pet') || ''

  // Sectioned mode: pet is set but no search query
  const sectionedMode = !!pet && !q

  // For sectioned mode
  const [sectionData, setSectionData] = useState<Record<string, Product[]>>({})
  const [sectionLoading, setSectionLoading] = useState(false)

  // For flat mode (search or no pet filter)
  const [products, setProducts] = useState<Product[]>([])
  const [flatLoading, setFlatLoading] = useState(true)

  // Fetch sectioned data
  useEffect(() => {
    if (!sectionedMode) return
    setSectionLoading(true)
    Promise.all(
      CATEGORY_SECTIONS.map(sec =>
        fetch(`/api/products?petType=${pet}&category=${sec.slug}&limit=50`)
          .then(r => r.json())
          .then(data => ({ slug: sec.slug, products: Array.isArray(data) ? data : [] }))
          .catch(() => ({ slug: sec.slug, products: [] }))
      )
    ).then(results => {
      const data: Record<string, Product[]> = {}
      results.forEach(r => { data[r.slug] = r.products })
      setSectionData(data)
      setSectionLoading(false)
    })
  }, [pet, sectionedMode])

  // Fetch flat products
  useEffect(() => {
    if (sectionedMode) { setFlatLoading(false); return }
    setFlatLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (pet) params.set('petType', pet)
    params.set('limit', '200')
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setFlatLoading(false) })
      .catch(() => setFlatLoading(false))
  }, [q, pet, sectionedMode])

  // Scroll to hash anchor after sections load
  useEffect(() => {
    if (!sectionedMode || sectionLoading) return
    const hash = window.location.hash.slice(1)
    if (hash) {
      const el = document.getElementById(hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [sectionedMode, sectionLoading])

  const title = pet === 'cat' ? 'Shop Cats' : pet === 'dog' ? 'Shop Dogs' : q ? `Search: "${q}"` : 'Shop All'

  if (sectionedMode) {
    return (
      <main className="container page-stack">
        <h1>{title}</h1>
        {sectionLoading ? <p>Loading...</p> : (
          <>
            {CATEGORY_SECTIONS.map(sec => {
              const items = sectionData[sec.slug] || []
              if (items.length === 0) return null
              return (
                <section key={sec.slug}>
                  <h2 id={sec.slug} className="shop-section-title">{sec.en}</h2>
                  <ProductGrid items={items} />
                </section>
              )
            })}
          </>
        )}
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1>{title}</h1>
      {flatLoading ? <p>Loading...</p> : <ProductGrid items={products} />}
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="container page-stack"><h1>Shop</h1><p>Loading...</p></main>}>
      <ShopContent />
    </Suspense>
  )
}

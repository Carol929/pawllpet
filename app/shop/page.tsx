'use client'

import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ShopContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const pet = searchParams.get('pet') || ''

  const params: Record<string, string> = {}
  if (q) params.search = q
  if (pet) params.petType = pet

  const { products, loading } = useProducts(params)

  return (
    <main className="container page-stack">
      <h1>Shop all</h1>
      {loading ? <p>Loading...</p> : <ProductGrid items={products} />}
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="container page-stack"><h1>Shop all</h1><p>Loading...</p></main>}>
      <ShopContent />
    </Suspense>
  )
}

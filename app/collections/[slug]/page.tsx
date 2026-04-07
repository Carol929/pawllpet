'use client'

import { use } from 'react'
import { collections } from '@/lib/products'
import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'

export default function CollectionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { products, loading } = useProducts({ pageSize: '50' })

  const c = collections.find((c) => c.slug === slug)

  if (!c) {
    return <main className="container page-stack"><h1>Collection not found</h1></main>
  }

  return (
    <main className="container page-stack">
      <h1>{c.title}</h1>
      <p>{c.description}</p>
      {loading ? <p>Loading...</p> : <ProductGrid items={products} />}
    </main>
  )
}

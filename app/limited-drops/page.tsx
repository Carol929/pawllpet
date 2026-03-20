'use client'
import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'

export default function Page() {
  const { products, loading } = useProducts({ isDrop: 'true' })
  return (
    <main className="container page-stack">
      <h1>Limited drops</h1>
      {loading ? <p>Loading...</p> : <ProductGrid items={products} />}
    </main>
  )
}

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { products, loading } = useProducts(query ? { search: query } : {})

  // If no query, show nothing
  const results = query ? products : []

  return (
    <main className="container page-stack">
      <h1>{query ? `Results for "${query}"` : 'Search'}</h1>
      {loading && query && <p>Searching...</p>}
      {!loading && query && results.length === 0 && (
        <p>No products found for &ldquo;{query}&rdquo;. Try a different search term.</p>
      )}
      {results.length > 0 && <ProductGrid items={results} />}
      {!query && <p>Use the search bar above to find products.</p>}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="container page-stack"><h1>Search</h1><p>Loading...</p></main>}>
      <SearchContent />
    </Suspense>
  )
}

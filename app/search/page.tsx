'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'
import { useLocale } from '@/lib/i18n'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { products, loading } = useProducts(query ? { search: query } : {})
  const { locale } = useLocale()
  const en = locale === 'en'

  // If no query, show nothing
  const results = query ? products : []

  return (
    <main className="container page-stack">
      <h1>{query ? (en ? `Results for "${query}"` : `"${query}" 的搜索结果`) : (en ? 'Search' : '搜索')}</h1>
      {loading && query && <p>{en ? 'Searching...' : '搜索中...'}</p>}
      {!loading && query && results.length === 0 && (
        <p>{en ? `No products found for "${query}". Try a different search term.` : `未找到"${query}"相关商品，请尝试其他搜索词。`}</p>
      )}
      {results.length > 0 && <ProductGrid items={results} />}
      {!query && <p>{en ? 'Use the search bar above to find products.' : '使用上方搜索栏查找商品。'}</p>}
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

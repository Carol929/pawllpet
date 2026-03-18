import { products } from '@/lib/catalog'
import { ProductGrid } from '@/components/ProductGrid'

export default function Page({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? ''
  const results = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <main className="container page-stack">
      <h1>{query ? `Results for "${query}"` : 'Search'}</h1>
      {query && results.length === 0 && (
        <p>No products found for &ldquo;{query}&rdquo;. Try a different search term.</p>
      )}
      {results.length > 0 && <ProductGrid items={results} />}
      {!query && <p>Use the search bar above to find products.</p>}
    </main>
  )
}

import { ProductGrid } from '@/components/ProductGrid'
import { products } from '@/lib/catalog'

export default function ShopPage({ searchParams }: { searchParams?: { q?: string; pet?: string } }) {
  const q = searchParams?.q?.toLowerCase() || ''
  const pet = searchParams?.pet
  const filtered = products.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!pet || p.petType === pet))

  return <main className="container page-stack"><h1>Shop all</h1><ProductGrid items={filtered} /></main>
}

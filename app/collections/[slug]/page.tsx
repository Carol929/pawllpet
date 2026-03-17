import { notFound } from 'next/navigation'
import { collections, products } from '@/lib/catalog'
import { ProductGrid } from '@/components/ProductGrid'

export default function CollectionDetail({ params }: { params: { slug: string } }) {
  const c = collections.find((c) => c.slug === params.slug)
  if (!c) return notFound()
  return <main className="container page-stack"><h1>{c.title}</h1><p>{c.description}</p><ProductGrid items={products.slice(0,8)} /></main>
}

import { notFound } from 'next/navigation'
import { products } from '@/lib/catalog'

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const item = products.find((p) => p.slug === params.slug)
  if (!item) return notFound()
  return (
    <main className="container page-stack">
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p>Category: {item.category} • Pet type: {item.petType}</p>
      <p>Price: ${item.price.toFixed(2)} • Rating: {item.rating}</p>
      <div className="hero-buttons"><button className="btn-primary">Add to cart</button><button className="btn-secondary">Add to wishlist</button></div>
    </main>
  )
}

import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { products, collections } from '@/lib/catalog'

export default function HomePage() {
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)
  const best = products.filter((p) => p.isBestSeller).slice(0, 4)

  return (
    <main className="container page-stack">
      <section className="hero-panel">
        <p className="eyebrow">PawLL Pet • Premium Pet Commerce</p>
        <h1>Curated pet essentials with drop-day excitement.</h1>
        <p>Shop toys, treats, grooming, beds, apparel, travel picks, and mystery boxes with loyalty rewards.</p>
        <div className="hero-buttons">
          <Link href="/shop" className="btn-primary">Shop all</Link>
          <Link href="/pet-quiz" className="btn-secondary">Take pet quiz</Link>
        </div>
      </section>

      <section>
        <h2>Featured collections</h2>
        <div className="collections-grid">
          {collections.map((c) => (
            <article key={c.slug} className="collection-card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <Link href={`/collections/${c.slug}`}>Explore</Link>
            </article>
          ))}
        </div>
      </section>

      <section><h2>New arrivals</h2><ProductGrid items={newArrivals} /></section>
      <section><h2>Best sellers</h2><ProductGrid items={best} /></section>
    </main>
  )
}

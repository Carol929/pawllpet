import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Journal — Pet Care Tips & Guides',
  description: 'The PawLL Journal: practical pet care guides, product safety notes, and enrichment ideas for dogs and cats.',
  alternates: { canonical: '/blog' },
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export default function Page() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <main className="container page-stack">
      <h1>Journal</h1>
      <p className="blog-tagline">Practical guides for living well with dogs and cats — from the PawLL team.</p>
      {posts.map(p => (
        <article key={p.slug} className="blog-card">
          <p className="blog-meta">{formatDate(p.date)}</p>
          <h3><Link href={`/blog/${p.slug}`}>{p.title}</Link></h3>
          <p>{p.excerpt}</p>
          <Link href={`/blog/${p.slug}`} className="blog-readmore">Read the guide →</Link>
        </article>
      ))}
    </main>
  )
}

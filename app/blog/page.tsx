import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/static-data'

export const metadata: Metadata = {
  title: 'Journal — Pet Care Tips & Guides',
  description: 'The PawLL Journal: practical pet care guides, product safety notes, and enrichment ideas for dogs and cats.',
  alternates: { canonical: '/blog' },
}

export default function Page() {
  return (
    <main className="container page-stack">
      <h1>Journal</h1>
      {blogPosts.map(p => (
        <article key={p.slug}>
          <h3><Link href={`/blog/${p.slug}`}>{p.title}</Link></h3>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </main>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/static-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pawllpet.com'

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const post = blogPosts.find(p => p.slug === params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const post = blogPosts.find(p => p.slug === params.slug)
  if (!post) return notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${siteUrl}/blog/${post.slug}`,
    publisher: { '@id': `${siteUrl}/#organization` },
  }

  return (
    <main className="container page-stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      <p>PawLL editorial content module is CMS-ready via BlogPost data model.</p>
    </main>
  )
}

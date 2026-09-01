import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/static-data'
import { getArticle } from '@/lib/blog-content'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pawllpet.com'

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

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
    openGraph: { title: post.title, description: post.excerpt, type: 'article', publishedTime: post.date },
  }
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const post = blogPosts.find(p => p.slug === params.slug)
  const article = getArticle(params.slug)
  if (!post || !article) return notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'PawLL' },
    publisher: { '@id': `${siteUrl}/#organization` },
  }

  return (
    <main className="container page-stack blog-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="blog-meta">{formatDate(article.date)} · {article.readMinutes} min read</p>
      <h1>{post.title}</h1>
      {article.intro.map((p, i) => (
        <p key={i} className="blog-intro">{p}</p>
      ))}
      {article.sections.map(section => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {section.list && (
            <ul>
              {section.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="blog-cta">
        <Link href={article.cta.href}>{article.cta.text}</Link>
      </p>
      <p className="blog-meta">
        <Link href="/blog">← Back to the Journal</Link>
      </p>
    </main>
  )
}

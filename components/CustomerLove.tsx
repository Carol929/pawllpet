'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useLocale } from '@/lib/i18n'
import { Reveal } from '@/components/Reveal'

interface RecentReview {
  id: string
  rating: number
  title: string | null
  body: string | null
  author: string
  product: { name: string; slug: string }
}

// Only show the section when there's enough REAL feedback to feel credible.
const MIN_REVIEWS = 3

/**
 * Homepage "what pet parents say" — real customer reviews only. Renders nothing
 * until there are at least MIN_REVIEWS with written feedback, so it never shows
 * placeholder or fabricated content.
 */
export function CustomerLove() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const [reviews, setReviews] = useState<RecentReview[]>([])

  useEffect(() => {
    fetch('/api/reviews/recent')
      .then((r) => r.json())
      .then((data: RecentReview[]) => setReviews(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {})
  }, [])

  if (reviews.length < MIN_REVIEWS) return null

  return (
    <Reveal>
      <section className="section-oval section-oval--collections">
        <span className="home-eyebrow">{zh ? '真实评价' : 'Real reviews'}</span>
        <h2 style={{ marginTop: 0 }}>{zh ? '养宠人怎么说' : 'What pet parents are saying'}</h2>
        <div className="review-wall">
          {reviews.map((r) => (
            <figure className="review-card" key={r.id}>
              <div className="review-stars" aria-label={`${r.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} fill={n <= r.rating ? '#D4B28C' : 'none'} color="#D4B28C" aria-hidden="true" />
                ))}
              </div>
              {r.title && <figcaption className="review-title">{r.title}</figcaption>}
              {r.body && <blockquote className="review-body">“{r.body}”</blockquote>}
              <div className="review-meta">
                <span className="review-author">{r.author}</span>
                <Link href={`/products/${r.product.slug}`} className="review-product">{r.product.name}</Link>
              </div>
            </figure>
          ))}
        </div>
      </section>
    </Reveal>
  )
}

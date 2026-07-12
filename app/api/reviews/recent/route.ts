export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Public-name form: first name + last initial (e.g. "Sarah M."). The per-product
// reviews already show the full name; the homepage wall is a touch more discreet.
function displayName(full: string | null): string {
  if (!full) return 'Verified buyer'
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

/**
 * GET /api/reviews/recent
 *
 * Recent, positive (>=4★) REAL customer reviews that have written feedback,
 * across all products — for the homepage social-proof section. Returns real
 * data only; the section hides itself when there aren't enough.
 */
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 }, body: { not: null } },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    })

    // Keep at most ONE review per person, so the wall reflects genuinely diverse
    // customers — not a single account (e.g. a tester) reviewing many products.
    // The homepage section requires several distinct authors before it shows, so
    // demo/seed data authored by one account never surfaces as "social proof".
    const seenUsers = new Set<string>()
    const cleaned: Array<{ id: string; rating: number; title: string | null; body: string | null; author: string; product: { name: string; slug: string } }> = []
    for (const r of reviews) {
      if ((r.body ?? '').trim().length === 0) continue
      if (seenUsers.has(r.userId)) continue
      seenUsers.add(r.userId)
      cleaned.push({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        author: displayName(r.user.fullName),
        product: { name: r.product.name, slug: r.product.slug },
      })
      if (cleaned.length >= 9) break
    }

    return NextResponse.json(cleaned)
  } catch (err) {
    console.error('[reviews/recent] error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

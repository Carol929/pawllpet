export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({ where: { slug: params.slug }, select: { id: true } })
  if (!product) return NextResponse.json([], { status: 404 })

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    include: { user: { select: { fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    user: { name: r.user.fullName, avatar: r.user.avatarUrl },
  })))
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  const product = await prisma.product.findFirst({ where: { slug: params.slug }, select: { id: true } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { rating, title, body } = await request.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating 1-5 required' }, { status: 400 })

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: product.id, userId } },
    create: { productId: product.id, userId, rating, title, body },
    update: { rating, title, body },
  })

  // Recalculate average rating
  const agg = await prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true })
  await prisma.product.update({ where: { id: product.id }, data: { rating: agg._avg.rating || 0 } })

  return NextResponse.json(review)
}

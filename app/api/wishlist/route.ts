export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const products = items.map(w => ({
    id: w.product.id,
    slug: w.product.slug,
    name: w.product.name,
    subtitle: w.product.subtitle,
    price: w.product.price,
    image: w.product.images[0]?.url || '/product-placeholder.svg',
    category: w.product.category.slug,
    petType: w.product.petType,
    rating: w.product.rating,
    wishlistId: w.id,
  }))

  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } })
  if (existing) return NextResponse.json({ ok: true })

  await prisma.wishlist.create({ data: { userId, productId } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  await prisma.wishlist.deleteMany({ where: { userId, productId } })
  return NextResponse.json({ ok: true })
}

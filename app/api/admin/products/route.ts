export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { productCreateSchema } from '@/lib/validations/product'

// GET - List products with search/filter/pagination
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  if (status && status !== 'all') {
    where.status = status
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
}

// POST - Create product
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const data = productCreateSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        petType: data.petType,
        brand: data.brand,
        material: data.material,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stock: data.stock,
        status: data.status,
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        isDrop: data.isDrop,
        isBundle: data.isBundle,
        createdById: auth.userId,
        images: {
          create: (data.imageUrls || []).map((url, i) => ({
            url,
            sortOrder: i,
          })),
        },
        variants: {
          create: (data.variants || []).map((v, i) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            sortOrder: i,
          })),
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

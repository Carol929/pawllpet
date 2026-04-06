export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { productUpdateSchema } from '@/lib/validations/product'

// GET - Single product with all details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      categories: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await request.json()
    const data = productUpdateSchema.parse(body)

    // Fetch existing product to merge with partial update for completeness check
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Update product fields
    const updateData: Record<string, unknown> = {}
    const fields = ['name', 'subtitle', 'slug', 'description', 'categoryId', 'petType', 'brand', 'material', 'price', 'compareAtPrice', 'stock', 'status', 'isNew', 'isBestSeller', 'isDrop', 'isBundle'] as const
    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    // Enforce draft if required fields are incomplete (merge with existing data)
    const mergedDescription = data.description !== undefined ? data.description : existing.description
    const mergedCategoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId
    const mergedPetType = data.petType !== undefined ? data.petType : existing.petType
    const mergedPrice = data.price !== undefined ? data.price : existing.price
    const mergedVariants = data.variants !== undefined ? data.variants : existing.variants
    const hasVariantsWithPrice = (mergedVariants || []).some((v: { name?: string; price: number }) => v.name && v.price > 0)
    if (!mergedDescription || !mergedCategoryId || !mergedPetType || (mergedPrice <= 0 && !hasVariantsWithPrice)) {
      updateData.status = 'draft'
    }

    // Handle categories many-to-many
    if (data.categoryIds !== undefined && data.categoryIds.length > 0) {
      updateData.categories = {
        set: data.categoryIds.map((cid: string) => ({ id: cid })),
      }
    }

    // Handle images: delete old, create new
    if (data.imageUrls !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      updateData.images = {
        create: data.imageUrls.map((url: string, i: number) => ({ url, sortOrder: i })),
      }
    }

    // Handle variants: delete old, create new
    if (data.variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      updateData.variants = {
        create: data.variants.map((v, i: number) => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          imageIndex: v.imageIndex ?? null,
          sortOrder: i,
        })),
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        categories: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return NextResponse.json(product)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: (error as { issues: unknown }).issues }, { status: 400 })
    }
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

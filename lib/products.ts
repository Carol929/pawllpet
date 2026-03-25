import { prisma } from '@/lib/db'
export type { Product } from '@/lib/product-types'
import type { Product } from '@/lib/product-types'

function toProductDTO(dbProduct: {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string
  petType: string
  price: number
  rating: number
  isNew: boolean
  isBestSeller: boolean
  isDrop: boolean
  isBundle: boolean
  stock: number
  compareAtPrice: number | null
  brand: string | null
  material: string | null
  category: { name: string; slug: string }
  images: { url: string }[]
  variants: { id: string; name: string; price: number; stock: number }[]
}): Product {
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    subtitle: dbProduct.subtitle || undefined,
    category: dbProduct.category.slug,
    petType: dbProduct.petType as 'Dog' | 'Cat' | 'Both',
    price: dbProduct.price,
    rating: dbProduct.rating,
    isNew: dbProduct.isNew,
    isBestSeller: dbProduct.isBestSeller,
    isDrop: dbProduct.isDrop,
    isBundle: dbProduct.isBundle,
    image: dbProduct.images[0]?.url || '/product-placeholder.svg',
    description: dbProduct.description,
    images: dbProduct.images.map(img => img.url),
    variants: dbProduct.variants,
    stock: dbProduct.stock,
    compareAtPrice: dbProduct.compareAtPrice,
    brand: dbProduct.brand,
    material: dbProduct.material,
  }
}

// Full include — for product detail pages
const fullInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: { sortOrder: 'asc' as const } },
}

// Light include — for product lists (only first image, skip variants)
const listInclude = {
  category: { select: { name: true, slug: true } },
  images: { take: 1, orderBy: { sortOrder: 'asc' as const } },
  variants: { take: 0 },
}

export async function getProducts(filters?: {
  search?: string
  category?: string
  petType?: string
  isNew?: boolean
  isBestSeller?: boolean
  isDrop?: boolean
  isBundle?: boolean
  limit?: number
  sortBy?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
  ids?: string[] // Fetch specific products by ID
  full?: boolean // Use full include (for detail pages)
}): Promise<{ products: Product[]; total: number }> {
  const where: Record<string, unknown> = { status: 'live' }

  if (filters?.ids?.length) {
    where.id = { in: filters.ids }
  }
  if (filters?.search) {
    where.name = { contains: filters.search, mode: 'insensitive' }
  }
  if (filters?.category) {
    where.category = { slug: filters.category }
  }
  if (filters?.petType) {
    where.petType = filters.petType
  }
  if (filters?.isNew) where.isNew = true
  if (filters?.isBestSeller) where.isBestSeller = true
  if (filters?.isDrop) where.isDrop = true
  if (filters?.isBundle) where.isBundle = true
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    }
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  switch (filters?.sortBy) {
    case 'price_asc': orderBy = { price: 'asc' }; break
    case 'price_desc': orderBy = { price: 'desc' }; break
    case 'newest': orderBy = { createdAt: 'desc' }; break
    case 'name': orderBy = { name: 'asc' }; break
    case 'rating': orderBy = { rating: 'desc' }; break
  }

  const pageSize = filters?.limit || filters?.pageSize || undefined
  const skip = filters?.page && pageSize ? (filters.page - 1) * pageSize : undefined
  const needsCount = filters?.page || filters?.pageSize // Only count when paginating

  const include = filters?.full ? fullInclude : listInclude
  const findPromise = prisma.product.findMany({
    where,
    include,
    orderBy,
    take: pageSize,
    skip,
  })

  if (needsCount) {
    const [products, total] = await Promise.all([findPromise, prisma.product.count({ where })])
    return { products: products.map(toProductDTO), total }
  }

  const products = await findPromise
  return { products: products.map(toProductDTO), total: products.length }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'live' },
    include: fullInclude,
  })

  return product ? toProductDTO(product) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: fullInclude,
  })

  return product ? toProductDTO(product) : null
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

// Static data (collections, blogPosts) moved to lib/static-data.ts
// to avoid pulling Prisma into client bundles

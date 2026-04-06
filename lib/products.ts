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
  weight: number | null
  category: { name: string; slug: string }
  categories?: { name: string; slug: string }[]
  images: { url: string }[]
  variants: { id?: string; name?: string; price: number; stock?: number; imageIndex?: number | null }[]
}): Product {
  // Use minimum variant price when base price is 0
  const displayPrice = dbProduct.price > 0
    ? dbProduct.price
    : dbProduct.variants.length > 0
      ? Math.min(...dbProduct.variants.map(v => v.price))
      : dbProduct.price

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    subtitle: dbProduct.subtitle || undefined,
    category: dbProduct.category.slug,
    categories: dbProduct.categories?.map(c => c.slug),
    petType: dbProduct.petType as 'Dog' | 'Cat' | 'Both',
    price: displayPrice,
    rating: dbProduct.rating,
    isNew: dbProduct.isNew,
    isBestSeller: dbProduct.isBestSeller,
    isDrop: dbProduct.isDrop,
    isBundle: dbProduct.isBundle,
    image: dbProduct.images[0]?.url || '/product-placeholder.svg',
    description: dbProduct.description,
    images: dbProduct.images.map(img => img.url),
    variants: dbProduct.variants.filter(v => v.id && v.name) as Product['variants'],
    stock: dbProduct.stock,
    compareAtPrice: dbProduct.compareAtPrice,
    brand: dbProduct.brand,
    material: dbProduct.material,
    weight: dbProduct.weight,
  }
}

// Full include — for product detail pages
const fullInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: { sortOrder: 'asc' as const } },
}

// Light include — for product lists (first image + variant prices)
const listInclude = {
  category: { select: { name: true, slug: true } },
  images: { take: 1, orderBy: { sortOrder: 'asc' as const } },
  variants: { select: { id: true, price: true }, orderBy: { price: 'asc' as const } },
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
  const andConditions: Record<string, unknown>[] = []

  if (filters?.ids?.length) {
    where.id = { in: filters.ids }
  }
  if (filters?.search) {
    where.name = { contains: filters.search, mode: 'insensitive' }
  }
  if (filters?.category) {
    andConditions.push({
      OR: [
        { category: { slug: filters.category } },
        { categories: { some: { slug: filters.category } } },
      ],
    })
  }
  if (filters?.petType) {
    const pt = filters.petType.charAt(0).toUpperCase() + filters.petType.slice(1).toLowerCase()
    andConditions.push({ OR: [{ petType: pt }, { petType: 'Both' }] })
  }
  if (andConditions.length > 0) {
    where.AND = andConditions
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

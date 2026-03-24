import { prisma } from '@/lib/db'

// DTO type matching the old catalog Product shape for compatibility
export type Product = {
  id: string
  slug: string
  name: string
  category: string
  petType: 'Dog' | 'Cat' | 'Both'
  price: number
  rating: number
  isNew: boolean
  isBestSeller: boolean
  isDrop: boolean
  isBundle: boolean
  image: string
  description: string
  images?: string[]
  variants?: { id: string; name: string; price: number; stock: number }[]
  stock?: number
  compareAtPrice?: number | null
  brand?: string | null
  material?: string | null
}

function toProductDTO(dbProduct: {
  id: string
  slug: string
  name: string
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

const defaultInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: { sortOrder: 'asc' as const } },
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
}): Promise<Product[]> {
  const where: Record<string, unknown> = { status: 'live' }

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

  const products = await prisma.product.findMany({
    where,
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit,
  })

  return products.map(toProductDTO)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'live' },
    include: defaultInclude,
  })

  return product ? toProductDTO(product) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: defaultInclude,
  })

  return product ? toProductDTO(product) : null
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

// Static data (collections, blogPosts) moved to lib/static-data.ts
// to avoid pulling Prisma into client bundles

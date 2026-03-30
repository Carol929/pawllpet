// Product DTO type - safe for client-side imports (no Prisma dependency)
export type Product = {
  id: string
  slug: string
  name: string
  subtitle?: string
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
  weight?: number | null
}

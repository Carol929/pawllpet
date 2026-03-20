import { z } from 'zod'

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be >= 0'),
  stock: z.number().int().min(0, 'Stock must be >= 0'),
  sortOrder: z.number().int().default(0),
})

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1).max(255),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  petType: z.enum(['Dog', 'Cat', 'Both']).default('Both'),
  brand: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().min(0).default(0),
  compareAtPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  status: z.enum(['draft', 'live', 'archived']).default('draft'),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isDrop: z.boolean().default(false),
  isBundle: z.boolean().default(false),
  imageUrls: z.array(z.string()).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type VariantInput = z.infer<typeof variantSchema>

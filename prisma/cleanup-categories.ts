import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REMOVE_SLUGS = ['treats', 'grooming', 'apparel', 'travel']

async function main() {
  // 1. Rename "Feeders & Bowls" → "Bowls" (slug: feeders-bowls → bowls)
  const feeders = await prisma.category.findUnique({ where: { slug: 'feeders-bowls' } })
  if (feeders) {
    // Move products from old category to new
    // First check if "bowls" already exists
    const existing = await prisma.category.findUnique({ where: { slug: 'bowls' } })
    if (existing) {
      console.log('Bowls category already exists, skipping rename')
    } else {
      await prisma.category.update({
        where: { slug: 'feeders-bowls' },
        data: { name: 'Bowls', slug: 'bowls' },
      })
      console.log('Renamed "Feeders & Bowls" → "Bowls"')
    }
  }

  // 2. For each category to remove, reassign products to a safe default
  for (const slug of REMOVE_SLUGS) {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) {
      console.log(`Category "${slug}" not found, skipping`)
      continue
    }

    // Check if any products use this as primary category
    const productCount = await prisma.product.count({ where: { categoryId: cat.id } })
    if (productCount > 0) {
      // Move to "Accessories" as default
      const accessories = await prisma.category.findUnique({ where: { slug: 'accessories' } })
      if (accessories) {
        await prisma.product.updateMany({
          where: { categoryId: cat.id },
          data: { categoryId: accessories.id },
        })
        console.log(`Moved ${productCount} products from "${slug}" to "Accessories"`)
      }
    }

    // Remove from many-to-many relations (disconnect)
    // Prisma implicit many-to-many: just delete the category, relations auto-cleanup
    try {
      await prisma.category.delete({ where: { slug } })
      console.log(`Deleted category "${slug}"`)
    } catch (err) {
      console.error(`Failed to delete "${slug}":`, err)
    }
  }

  console.log('Category cleanup complete!')
}

main().finally(() => prisma.$disconnect())

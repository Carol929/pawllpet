import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { name: 'Toys', slug: 'toys' },
  { name: 'Treats', slug: 'treats' },
  { name: 'Grooming', slug: 'grooming' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Beds', slug: 'beds' },
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Feeders & Bowls', slug: 'feeders-bowls' },
  { name: 'Travel', slug: 'travel' },
]

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  // Seed admin user
  await prisma.user.upsert({
    where: { email: 'admin@pawllpet.com' },
    update: { role: 'admin', emailVerified: true },
    create: {
      fullName: 'PawLL Admin',
      username: 'admin',
      email: 'admin@pawllpet.com',
      password,
      role: 'admin',
      emailVerified: true,
      petType: 'Both',
    },
  })

  // Seed categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    })
  }

  console.log('Seed complete: admin user + 8 categories')
}

main().finally(async () => prisma.$disconnect())

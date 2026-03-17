import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)

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

  for (let i = 1; i <= 8; i++) {
    await prisma.user.upsert({
      where: { email: `customer${i}@pawllpet.com` },
      update: {},
      create: {
        fullName: `PawLL Customer ${i}`,
        username: `customer${i}`,
        email: `customer${i}@pawllpet.com`,
        password,
        emailVerified: true,
        petType: i % 2 ? 'Dog' : 'Cat',
      },
    })
  }

  console.log('Seed complete: admin@pawllpet.com / admin123')
}

main().finally(async () => prisma.$disconnect())

// Prisma Client 单例
// 用于在整个应用中共享数据库连接

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 在开发环境中，每次代码热重载时会创建新的Prisma Client实例
// 为了避免连接数过多，我们使用单例模式
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


// 数据库种子脚本
// 用于初始化数据库，创建默认管理员账号等
// 运行方式：npm run db:seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 检查是否已存在管理员账号
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (existingAdmin) {
    console.log('管理员账号已存在，跳过创建')
    return
  }

  // 创建默认管理员账号
  // 密码：admin123（请在生产环境中修改）
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      username: 'admin',
      email: 'admin@pawllpet.com',
      emailVerified: true, // 管理员账号默认已验证邮箱
      password: hashedPassword,
      role: 'admin',
      petType: 'Both'
    }
  })

  console.log('管理员账号创建成功！')
  console.log('用户名: admin')
  console.log('邮箱: admin@pawllpet.com')
  console.log('密码: admin123')
  console.log('⚠️  请在生产环境中立即修改默认密码！')
}

main()
  .catch((e) => {
    console.error('初始化数据库失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


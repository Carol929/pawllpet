// 用户注册API
// POST /api/auth/register

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateEmailVerificationToken } from '@/lib/utils'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

// 注册表单验证schema
const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  petType: z.enum(['Cat', 'Dog', 'Both', 'None yet']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证输入数据
    const validatedData = registerSchema.parse(body)

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone || null,
        petType: validatedData.petType || null,
        emailVerified: false, // 注册时邮箱未验证
        role: 'user', // 默认角色为普通用户
      },
    })

    // 生成邮箱验证token
    const token = generateEmailVerificationToken()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24小时后过期

    // 保存验证token
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    })

    // 发送验证邮件
    try {
      await sendVerificationEmail(user.email, user.fullName, token)
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError)
      // 即使邮件发送失败，也返回成功（用户可以在登录时重发）
    }

    // 返回成功响应（不返回密码）
    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册失败:', error)

    // Zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}


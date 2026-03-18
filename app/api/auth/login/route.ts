// 用户登录API
// POST /api/auth/login

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { SignJWT } from 'jose'

// 登录表单验证schema
const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

// JWT密钥（从环境变量获取）
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)

// 创建JWT token
async function createToken(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7天过期
    .sign(JWT_SECRET)

  return token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证输入数据
    const validatedData = loginSchema.parse(body)

    // 查找用户（通过username或email）
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.usernameOrEmail },
          { email: validatedData.usernameOrEmail },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    // 检查账号是否被禁用
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      )
    }

    // 检查邮箱是否已验证
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email first. Check your inbox for the 6-digit code.',
          requiresVerification: true,
        },
        { status: 403 }
      )
    }

    // 检查密码（如果用户有密码）
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid username/email or password' },
          { status: 401 }
        )
      }
    } else {
      // 用户没有密码（可能是Google登录用户），不允许密码登录
      return NextResponse.json(
        { error: 'This account is linked to Google. Please use Google login.' },
        { status: 401 }
      )
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // 创建JWT token
    const token = await createToken(user.id, user.role)

    // 创建响应
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          petType: user.petType,
          gender: user.gender,
          birthday: user.birthday,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
      },
      { status: 200 }
    )

    // 设置HttpOnly Cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    })

    return response
  } catch (error) {
    console.error('登录失败:', error)

    // Zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}


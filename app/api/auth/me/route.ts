// 获取当前登录用户信息API
// GET /api/auth/me

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'

// JWT密钥（从环境变量获取）
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)

// 从Cookie中获取token
function getTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['auth-token'] || null
}

// 验证JWT token
async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    }
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // 从Cookie中获取token
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // 验证token
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        petType: true,
        gender: true,
        birthday: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        isBlocked: true,
        createdAt: true,
        lastLoginAt: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 检查账号是否被禁用
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Your account has been blocked' },
        { status: 403 }
      )
    }

    const { password, ...userWithoutPassword } = user
    return NextResponse.json({ ...userWithoutPassword, hasPassword: Boolean(password) }, { status: 200 })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
}


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/jwt'

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const emailSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

const authSchema = z.object({
  password: passwordSchema,
})

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const match = cookieHeader.match(/auth-token=([^;]+)/)
  if (!match) return null
  try {
    const { payload } = await jwtVerify(match[1], getJwtSecret())
    return payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let user

    // Try JWT auth first (logged-in user from account page)
    const userId = await getUserIdFromToken(request)
    if (userId) {
      const { password } = authSchema.parse(body)
      user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      if (user.password) {
        return NextResponse.json({ error: 'Password already set. Use change password instead.' }, { status: 400 })
      }
      body._password = password
    } else {
      // Fall back to email-based flow (post-registration)
      const { email, password } = emailSchema.parse(body)
      user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      if (!user.emailVerified) {
        return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 })
      }
      body._password = password
    }

    const hashedPassword = await bcrypt.hash(body._password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, lastLoginAt: new Date() },
    })

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret())

    const response = NextResponse.json({
      message: 'Password set successfully',
      user: {
        id: user.id, username: user.username, email: user.email,
        fullName: user.fullName, role: user.role, phone: user.phone,
        petType: user.petType, gender: user.gender, birthday: user.birthday,
        avatarUrl: user.avatarUrl, emailVerified: user.emailVerified,
        createdAt: user.createdAt, lastLoginAt: new Date(), hasPassword: true,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Set password failed:', error)
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }
}

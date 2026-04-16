export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/jwt'

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/)
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, newPassword } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    if (user.isBlocked) {
      return NextResponse.json({ error: 'Account is blocked' }, { status: 403 })
    }

    const token = await prisma.emailVerificationToken.findUnique({ where: { userId: user.id } })
    if (!token) {
      return NextResponse.json({ error: 'No verification code found' }, { status: 400 })
    }
    if (token.expires < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { userId: user.id } })
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }
    if (token.token !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { lastLoginAt: new Date() }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: updateData }),
      prisma.emailVerificationToken.delete({ where: { userId: user.id } }),
    ])

    const jwt = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret())

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id, username: user.username, email: user.email,
        fullName: user.fullName, role: user.role, phone: user.phone,
        petType: user.petType, gender: user.gender, birthday: user.birthday,
        avatarUrl: user.avatarUrl, emailVerified: user.emailVerified,
        createdAt: user.createdAt, lastLoginAt: new Date(),
      },
    })

    response.cookies.set('auth-token', jwt, {
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
    console.error('Verify and login failed:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

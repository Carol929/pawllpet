export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/jwt'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const emailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
  password: passwordSchema,
})

const authSchema = z.object({
  password: passwordSchema,
})

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.userId as string
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let user
    let consumeTokenUserId: string | null = null

    // Try JWT auth first (logged-in user setting a password for the first time,
    // e.g. a Google account adding email/password login from their account page).
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
      // Unauthenticated post-registration flow. This must prove ownership of the
      // email — an emailVerified flag alone is NOT proof, since it is true for
      // every Google/code-verified account. Require the single-use verification
      // code so an attacker who only knows the victim's email cannot set a
      // password and take over the account.
      const { email, code, password } = emailSchema.parse(body)

      // Throttle brute force of the 6-digit code.
      const ip = clientIp(request)
      const byEmail = rateLimit(`set-password:email:${email}`, 5, 15 * 60 * 1000)
      const byIp = rateLimit(`set-password:ip:${ip}`, 20, 15 * 60 * 1000)
      if (!byEmail.ok || !byIp.ok) {
        return NextResponse.json({ error: 'Too many attempts. Please request a new code and try again later.' }, {
          status: 429,
          headers: { 'Retry-After': String(Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds)) },
        })
      }

      user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
      }
      if (!user.emailVerified) {
        return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 })
      }
      if (user.password) {
        // First-time set only; password resets go through forgot-password.
        return NextResponse.json({ error: 'Password already set. Use forgot password instead.' }, { status: 400 })
      }

      const token = await prisma.emailVerificationToken.findUnique({ where: { userId: user.id } })
      if (!token || token.expires < new Date() || token.token !== code) {
        return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
      }

      consumeTokenUserId = user.id
      body._password = password
    }

    const hashedPassword = await bcrypt.hash(body._password, 10)
    if (consumeTokenUserId) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword, lastLoginAt: new Date() },
        }),
        prisma.emailVerificationToken.delete({ where: { userId: consumeTokenUserId } }),
      ])
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, lastLoginAt: new Date() },
      })
    }

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

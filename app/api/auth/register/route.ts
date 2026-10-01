export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { generateUniqueUsername } from '@/lib/utils'
import { generateVerificationCode } from '@/lib/verification-code'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { normalizeEmail } from '@/lib/email-utils'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores').optional(),
  email: z.string().email('Invalid email address').transform(normalizeEmail),
  petType: z.enum(['Dog', 'Cat', 'Both', 'None']).optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request)
    const limit = rateLimit(`register:ip:${ip}`, 5, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      })
    }

    const body = await request.json()
    const data = registerSchema.parse(body)

    // Anti-enumeration: a taken email returns the exact same response as a
    // successful registration (same shape, same message, no user object), so
    // this endpoint cannot confirm which addresses have accounts. The real
    // owner can always sign in or use forgot-password.
    const SUCCESS_RESPONSE = {
      message: 'Registration successful. A 6-digit verification code has been sent to your email.',
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingByEmail) {
      return NextResponse.json(SUCCESS_RESPONSE, { status: 201 })
    }

    // A taken username silently falls back to a generated variant instead of
    // confirming it exists ("Username already taken" was an enumeration
    // oracle for high-value names like "admin").
    let username: string
    const usernameTaken = async (candidate: string) => {
      const hit = await prisma.user.findUnique({ where: { username: candidate } })
      return Boolean(hit)
    }
    if (data.username && !(await usernameTaken(data.username))) {
      username = data.username
    } else {
      username = await generateUniqueUsername(data.username || data.email, usernameTaken)
    }

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        username,
        email: data.email,
        password: null,
        phone: data.phone || null,
        petType: data.petType,
        gender: data.gender || null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        emailVerified: false,
        role: 'user',
      },
    })

    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.emailVerificationToken.create({
      data: { token: code, userId: user.id, expires },
    })

    try {
      await sendVerificationEmail(user.email, user.fullName, code)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    // Must stay byte-identical to the taken-email branch above (the client
    // only uses its own copy of the email to route to /verify-email).
    return NextResponse.json(SUCCESS_RESPONSE, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Registration failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Registration failed: ${message}` }, { status: 500 })
  }
}

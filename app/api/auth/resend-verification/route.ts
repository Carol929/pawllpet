export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { generateVerificationCode } from '@/lib/verification-code'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({ email: z.string().email('Invalid email') })

// Generic response regardless of whether the account exists / is already
// verified, so this cannot be used to enumerate accounts.
const GENERIC_MESSAGE = 'If an account exists and is not yet verified, a new code has been sent.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const ip = clientIp(request)
    const byEmail = rateLimit(`resend-verification:email:${email}`, 5, 60 * 60 * 1000)
    const byIp = rateLimit(`resend-verification:ip:${ip}`, 20, 60 * 60 * 1000)
    if (!byEmail.ok || !byIp.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds)) },
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.emailVerified) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.emailVerificationToken.upsert({
      where: { userId: user.id },
      update: { token: code, expires },
      create: { userId: user.id, token: code, expires },
    })

    try {
      await sendVerificationEmail(user.email, user.fullName, code)
    } catch (emailError) {
      console.error('Failed to resend verification code:', emailError)
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to resend verification code' }, { status: 500 })
  }
}

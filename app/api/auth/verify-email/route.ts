export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const verifySchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().length(6, 'Code must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = verifySchema.parse(body)

    // Throttle brute force of the 6-digit code.
    const ip = clientIp(request)
    const byEmail = rateLimit(`verify-email:email:${email}`, 5, 15 * 60 * 1000)
    const byIp = rateLimit(`verify-email:ip:${ip}`, 30, 15 * 60 * 1000)
    if (!byEmail.ok || !byIp.ok) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code and try again later.' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds)) },
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    // Generic error for unknown email and wrong code alike, to avoid account enumeration.
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const token = await prisma.emailVerificationToken.findUnique({ where: { userId: user.id } })
    if (!token) {
      return NextResponse.json({ error: 'No verification code found. Please request a new code.' }, { status: 400 })
    }

    if (token.expires < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { userId: user.id } })
      return NextResponse.json({ error: 'Verification code expired. Please request a new code.' }, { status: 400 })
    }

    if (token.token !== code) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Mark verified but KEEP the token: the subsequent set-password step consumes
    // it as proof of email ownership. The token is single-use (deleted by
    // set-password) and still expires on its own.
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

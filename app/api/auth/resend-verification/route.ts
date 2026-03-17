export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({ email: z.string().email('Invalid email') })

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ message: 'Email already verified' })

    const code = generateCode()
    const expires = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.emailVerificationToken.upsert({
      where: { userId: user.id },
      update: { token: code, expires },
      create: { userId: user.id, token: code, expires },
    })

    await sendVerificationEmail(user.email, user.fullName, code)

    return NextResponse.json({ message: 'Verification code sent' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to resend verification code' }, { status: 500 })
  }
}

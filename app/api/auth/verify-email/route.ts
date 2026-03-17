export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().length(6, 'Code must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = verifySchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
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
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
      prisma.emailVerificationToken.delete({ where: { userId: user.id } }),
    ])

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

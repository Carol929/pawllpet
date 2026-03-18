export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { generateUniqueUsername } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores').optional(),
  email: z.string().email('Invalid email address'),
  petType: z.enum(['Dog', 'Cat', 'Both', 'None']).optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingByEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    let username: string
    if (data.username) {
      const existingByUsername = await prisma.user.findUnique({ where: { username: data.username } })
      if (existingByUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
      username = data.username
    } else {
      username = await generateUniqueUsername(data.email, async (candidate) => {
        const hit = await prisma.user.findUnique({ where: { username: candidate } })
        return Boolean(hit)
      })
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

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.emailVerificationToken.create({
      data: { token: code, userId: user.id, expires },
    })

    try {
      await sendVerificationEmail(user.email, user.fullName, code)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    return NextResponse.json(
      {
        message: 'Registration successful. A 6-digit verification code has been sent to your email.',
        user: { id: user.id, email: user.email, fullName: user.fullName },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Registration failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Registration failed: ${message}` }, { status: 500 })
  }
}

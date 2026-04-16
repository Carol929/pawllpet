export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/jwt'

async function getUserId(request: NextRequest) {
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

const MAX_BASE64_SIZE = 500_000 // ~500KB base64 string

const schema = z.object({
  avatarBase64: z.string().max(MAX_BASE64_SIZE, 'Image too large (max ~375KB)'),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { avatarBase64 } = schema.parse(body)

    // Validate it looks like a data URI
    if (!avatarBase64.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarBase64 },
    })

    return NextResponse.json({ avatarUrl: avatarBase64 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Avatar upload failed:', error)
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}

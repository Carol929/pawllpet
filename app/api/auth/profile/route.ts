export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { jwtVerify } from 'jose'
import { z } from 'zod'
import { getJwtSecret } from '@/lib/jwt'

async function getUser(request: NextRequest) {
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

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  petType: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    const updateData: Record<string, unknown> = {}
    if (data.fullName !== undefined) updateData.fullName = data.fullName
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.gender !== undefined) updateData.gender = data.gender || null
    if (data.petType !== undefined) updateData.petType = data.petType || null
    if (data.birthday !== undefined) updateData.birthday = data.birthday ? new Date(data.birthday) : null

    const user = await prisma.user.update({
      where: { id: userId },
      select: {
        id: true, fullName: true, username: true, email: true,
        phone: true, petType: true, gender: true, birthday: true,
        role: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Profile update failed:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const pets = await prisma.pet.findMany({
    where: { userId: authResult.userId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(pets)
}

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const data = await request.json()
  if (!data.name?.trim() || !data.type) {
    return NextResponse.json({ error: 'Name and type required' }, { status: 400 })
  }

  const pet = await prisma.pet.create({
    data: {
      userId: authResult.userId,
      name: data.name.trim(),
      type: data.type,
      breed: data.breed?.trim() || null,
      age: data.age || null,
      weight: data.weight || null,
      allergies: data.allergies?.trim() || null,
    },
  })
  return NextResponse.json(pet)
}

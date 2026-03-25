export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const pet = await prisma.pet.findFirst({ where: { id: params.id, userId: authResult.userId } })
  if (!pet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await request.json()
  const updated = await prisma.pet.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.breed !== undefined && { breed: data.breed?.trim() || null }),
      ...(data.age !== undefined && { age: data.age || null }),
      ...(data.weight !== undefined && { weight: data.weight || null }),
      ...(data.allergies !== undefined && { allergies: data.allergies?.trim() || null }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const pet = await prisma.pet.findFirst({ where: { id: params.id, userId: authResult.userId } })
  if (!pet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.pet.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

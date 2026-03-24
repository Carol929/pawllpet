export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = params
  const data = await request.json()

  // Verify ownership
  const existing = await prisma.address.findFirst({ where: { id, userId: authResult.userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: authResult.userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.update({ where: { id }, data })
  return NextResponse.json(address)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = params
  const existing = await prisma.address.findFirst({ where: { id, userId: authResult.userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

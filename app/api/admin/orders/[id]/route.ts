export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: { select: { fullName: true, email: true, phone: true } }, items: true },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const data = await request.json()
  const allowed: Record<string, unknown> = {}
  if (data.status) allowed.status = data.status
  if (data.trackingNumber !== undefined) allowed.trackingNumber = data.trackingNumber

  const order = await prisma.order.update({
    where: { id: params.id },
    data: allowed,
    include: { items: true },
  })

  return NextResponse.json(order)
}

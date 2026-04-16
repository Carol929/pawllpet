export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true },
  })

  // Only allow the order owner to cancel
  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Only cancel if still pending
  if (order.status !== 'pending') {
    return NextResponse.json({ error: `Order cannot be cancelled (status: ${order.status})` }, { status: 400 })
  }

  await prisma.order.update({
    where: { id },
    data: { status: 'cancelled' },
  })

  console.log(`[Orders] Order ${id} cancelled by user ${userId}`)
  return NextResponse.json({ status: 'cancelled' })
}

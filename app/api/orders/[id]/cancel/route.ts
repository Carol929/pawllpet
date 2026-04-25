export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'
import { sendAdminCancellationRequestEmail } from '@/lib/email'

const DELIVERY_CANCEL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult
  const { id } = await params

  const body = await request.json().catch(() => ({}))
  const reason = (body?.reason as string | undefined)?.trim() || ''
  if (!reason) {
    return NextResponse.json({ error: 'A reason is required to cancel an order.' }, { status: 400 })
  }
  if (reason.length > 1000) {
    return NextResponse.json({ error: 'Reason must be under 1000 characters.' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      status: true, userId: true, total: true, deliveredAt: true, updatedAt: true,
      user: { select: { fullName: true, email: true } },
    },
  })

  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'cancelled' || order.status === 'cancellation_requested') {
    return NextResponse.json({ error: `Order is already ${order.status.replace('_', ' ')}` }, { status: 400 })
  }

  // Enforce 30-day window for delivered orders (use deliveredAt; fallback to updatedAt for legacy rows)
  if (order.status === 'delivered') {
    const deliveredTime = (order.deliveredAt ?? order.updatedAt).getTime()
    if (Date.now() - deliveredTime > DELIVERY_CANCEL_WINDOW_MS) {
      return NextResponse.json({ error: 'Cancellation period has expired (30 days after delivery).' }, { status: 400 })
    }
  }

  // Pending (unpaid) orders: cancel directly — no payment to refund, no admin review needed
  if (order.status === 'pending') {
    await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    })
    console.log(`[Orders] Pending order ${id} cancelled by user ${userId}: ${reason}`)
    return NextResponse.json({ status: 'cancelled' })
  }

  // Paid / shipped / delivered (within window): create a cancellation request for admin review
  await prisma.order.update({
    where: { id },
    data: {
      status: 'cancellation_requested',
      cancellationReason: reason,
      cancellationRequestedAt: new Date(),
    },
  })

  // Notify admin (best-effort — request itself succeeds even if email fails)
  try {
    await sendAdminCancellationRequestEmail({
      orderId: id,
      customerName: order.user?.fullName || 'Unknown Customer',
      customerEmail: order.user?.email || '',
      orderStatus: order.status,
      orderTotal: order.total,
      reason,
    })
  } catch (err) {
    console.error(`[Orders] FAILED to send admin cancellation email for order ${id}:`, err)
  }

  console.log(`[Orders] Cancellation requested for order ${id} (was ${order.status}) by user ${userId}`)
  return NextResponse.json({ status: 'cancellation_requested' })
}

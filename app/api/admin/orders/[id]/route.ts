export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { sendOrderShippedEmail, sendOrderCancellationResultEmail } from '@/lib/email'

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
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'cancellation_requested']
  const validResolutions = ['full_refund', 'partial_50', 'reship', 'no_action', 'other']
  const allowed: Record<string, unknown> = {}

  if (data.status) {
    if (!validStatuses.includes(data.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    allowed.status = data.status
  }

  // Read existing order so we can detect transitions
  const existing = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      trackingNumber: true, status: true, total: true, deliveredAt: true,
      cancellationReason: true,
      user: { select: { fullName: true, email: true } },
      items: { select: { name: true, quantity: true } },
    },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let shouldSendShippedEmail = false
  if (data.trackingNumber !== undefined) {
    const newTracking = (data.trackingNumber as string).trim()
    allowed.trackingNumber = newTracking
    if (newTracking !== '' && newTracking !== (existing.trackingNumber || '')) {
      shouldSendShippedEmail = true
      if (!data.status && existing.status !== 'shipped' && existing.status !== 'delivered') {
        allowed.status = 'shipped'
      }
    }
  }

  // Auto-set deliveredAt when transitioning to delivered (for the 30-day cancel window)
  if (allowed.status === 'delivered' && existing.status !== 'delivered' && !existing.deliveredAt) {
    allowed.deliveredAt = new Date()
  }

  // Cancellation handling: when admin finalizes a cancellation, capture resolution + refund + send user email
  let shouldSendCancellationEmail = false
  if (allowed.status === 'cancelled') {
    if (data.resolution !== undefined) {
      if (!validResolutions.includes(data.resolution)) {
        return NextResponse.json({ error: 'Invalid resolution' }, { status: 400 })
      }
      allowed.resolution = data.resolution
    }

    // A reason is mandatory for any cancellation. Use existing user reason, or admin-provided one.
    const finalReason = (data.cancellationReason as string | undefined)?.trim() || existing.cancellationReason
    if (!finalReason) {
      return NextResponse.json({ error: 'A reason is required to cancel an order.' }, { status: 400 })
    }
    allowed.cancellationReason = finalReason

    // Refund amount: explicit value, else infer from resolution
    if (data.refundAmount !== undefined) {
      const amount = Number(data.refundAmount)
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 })
      }
      allowed.refundAmount = amount
    } else if (data.resolution === 'full_refund') {
      allowed.refundAmount = existing.total
    } else if (data.resolution === 'partial_50') {
      allowed.refundAmount = +(existing.total * 0.5).toFixed(2)
    } else if (data.resolution === 'reship' || data.resolution === 'no_action') {
      allowed.refundAmount = 0
    }

    if (data.adminNote !== undefined) {
      allowed.adminNote = (data.adminNote as string).trim() || null
    }

    if (existing.status !== 'cancelled') {
      allowed.cancelledAt = new Date()
      shouldSendCancellationEmail = true
    }
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: allowed,
    include: { items: true, user: { select: { fullName: true, email: true } } },
  })

  if (shouldSendShippedEmail && order.user?.email && order.trackingNumber) {
    try {
      await sendOrderShippedEmail(order.user.email, order.user.fullName, {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity })),
      })
      console.log(`[Admin Orders] Shipped email sent for order ${order.id}`)
    } catch (err) {
      console.error(`[Admin Orders] FAILED to send shipped email for order ${order.id}:`, err)
    }
  }

  if (shouldSendCancellationEmail && order.user?.email && order.resolution) {
    try {
      await sendOrderCancellationResultEmail(order.user.email, order.user.fullName, {
        orderId: order.id,
        resolution: order.resolution,
        refundAmount: order.refundAmount ?? 0,
        adminNote: order.adminNote,
        orderTotal: order.total,
      })
      console.log(`[Admin Orders] Cancellation result email sent for order ${order.id} (resolution: ${order.resolution})`)
    } catch (err) {
      console.error(`[Admin Orders] FAILED to send cancellation email for order ${order.id}:`, err)
    }
  }

  return NextResponse.json(order)
}

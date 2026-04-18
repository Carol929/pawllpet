export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { sendOrderShippedEmail } from '@/lib/email'

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
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  const allowed: Record<string, unknown> = {}

  if (data.status) {
    if (!validStatuses.includes(data.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    allowed.status = data.status
  }

  // Read existing order so we can detect a tracking-number change
  const existing = await prisma.order.findUnique({
    where: { id: params.id },
    select: { trackingNumber: true, status: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let shouldSendShippedEmail = false
  if (data.trackingNumber !== undefined) {
    const newTracking = (data.trackingNumber as string).trim()
    allowed.trackingNumber = newTracking
    // Only trigger email when tracking is non-empty AND it changed from before
    if (newTracking !== '' && newTracking !== (existing.trackingNumber || '')) {
      shouldSendShippedEmail = true
      // Auto-advance status to "shipped" unless caller explicitly set a different status
      if (!data.status && existing.status !== 'shipped' && existing.status !== 'delivered') {
        allowed.status = 'shipped'
      }
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
      // Don't fail the request — the tracking number was saved successfully
    }
  }

  return NextResponse.json(order)
}

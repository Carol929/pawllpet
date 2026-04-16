export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  // Guard: ensure webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle checkout.session.completed — payment successful
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      console.log(`[Stripe Webhook] checkout.session.completed for order ${orderId}`)

      // Idempotency: only process if order is still pending
      const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
      if (!existing || existing.status !== 'pending') {
        console.log(`[Stripe Webhook] Order ${orderId} already processed (status: ${existing?.status}), skipping`)
        return NextResponse.json({ received: true })
      }

      // Update order status to paid + deduct stock
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' },
        include: { items: true },
      })

      console.log(`[Stripe Webhook] Order ${orderId} marked as paid, ${order.items.length} items to destock`)

      for (const item of order.items) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
          console.log(`[Stripe Webhook] Decremented stock for ${item.productId} by ${item.quantity}`)
        } catch (err) {
          console.error(`[Stripe Webhook] FAILED to decrement stock for ${item.productId}:`, err)
          // Don't throw — payment is already confirmed. Log for manual review.
        }
      }
    }
  }

  // Handle checkout.session.expired — user abandoned checkout
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      console.log(`[Stripe Webhook] checkout.session.expired for order ${orderId}`)

      const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
      if (existing && existing.status === 'pending') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'cancelled' },
        })
        console.log(`[Stripe Webhook] Order ${orderId} marked as cancelled (session expired)`)
      }
    }
  }

  return NextResponse.json({ received: true })
}

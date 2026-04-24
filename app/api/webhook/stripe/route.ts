export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email'
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
    const eventSession = event.data.object as Stripe.Checkout.Session
    const orderId = eventSession.metadata?.orderId

    if (orderId) {
      console.log(`[Stripe Webhook] checkout.session.completed for order ${orderId}`)

      // Idempotency: only process if order is still pending
      const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
      if (!existing || existing.status !== 'pending') {
        console.log(`[Stripe Webhook] Order ${orderId} already processed (status: ${existing?.status}), skipping`)
        return NextResponse.json({ received: true })
      }

      // Retrieve full session with expanded discount details (so we can read promo code name)
      const session = await getStripe().checkout.sessions.retrieve(eventSession.id, {
        expand: ['total_details.breakdown.discounts.discount.promotion_code'],
      })

      const amountTotal = (session.amount_total ?? 0) / 100
      const amountDiscount = (session.total_details?.amount_discount ?? 0) / 100
      const firstDiscount = session.total_details?.breakdown?.discounts?.[0]
      const promoCode = firstDiscount?.discount?.promotion_code
      const discountCode =
        typeof promoCode === 'object' && promoCode !== null
          ? (promoCode as Stripe.PromotionCode).code
          : null

      if (amountDiscount > 0) {
        console.log(`[Stripe Webhook] Order ${orderId} used promo "${discountCode}" for -$${amountDiscount.toFixed(2)}`)
      }

      // Update order: overwrite total with actual paid amount, store discount info
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          total: amountTotal,
          discountAmount: amountDiscount,
          discountCode,
        },
        include: { items: true },
      })

      console.log(`[Stripe Webhook] Order ${orderId} marked as paid, ${order.items.length} items to destock`)

      for (const item of order.items) {
        try {
          if (item.variantId) {
            // Decrement variant stock
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            })
            console.log(`[Stripe Webhook] Decremented variant stock for ${item.variantId} by ${item.quantity}`)
          } else {
            // Decrement base product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
            console.log(`[Stripe Webhook] Decremented product stock for ${item.productId} by ${item.quantity}`)
          }
        } catch (err) {
          console.error(`[Stripe Webhook] FAILED to decrement stock for ${item.variantId || item.productId}:`, err)
          // Don't throw — payment is already confirmed. Log for manual review.
        }
      }

      // Send order confirmation email + admin notification
      const user = await prisma.user.findUnique({ where: { id: order.userId }, select: { email: true, fullName: true } })

      try {
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, user.fullName, {
            orderId,
            items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal: order.subtotal,
            shipping: order.shipping,
            tax: order.tax,
            discountAmount: order.discountAmount,
            discountCode: order.discountCode,
            total: order.total,
            shippingAddress: order.shippingAddress as Record<string, string>,
          })
          console.log(`[Stripe Webhook] Confirmation email sent for order ${orderId}`)
        }
      } catch (emailErr) {
        console.error(`[Stripe Webhook] FAILED to send confirmation email for order ${orderId}:`, emailErr)
        // Don't throw — payment is confirmed, email failure is non-critical
      }

      try {
        await sendAdminOrderNotificationEmail({
          orderId,
          customerName: user?.fullName || 'Unknown Customer',
          customerEmail: user?.email || '',
          items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          discountAmount: order.discountAmount,
          discountCode: order.discountCode,
          total: order.total,
          shippingAddress: order.shippingAddress as Record<string, string>,
        })
        console.log(`[Stripe Webhook] Admin notification email sent for order ${orderId}`)
      } catch (adminEmailErr) {
        console.error(`[Stripe Webhook] FAILED to send admin notification for order ${orderId}:`, adminEmailErr)
        // Don't throw — payment is confirmed, admin notification failure is non-critical
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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// The webhook buys a Shippo label synchronously (another network round-trip)
// on top of DB writes and emails. Allow headroom over the 10s default so the
// label purchase isn't cut off mid-flight.
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendShippingNotificationEmail,
} from '@/lib/email'
import { getCarrierTrackingUrl, purchaseLabel } from '@/lib/shipping'
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

      // Only fulfill fully-paid sessions. If a delayed-notification method (e.g.
      // ACH) is ever enabled in Stripe, the session completes as 'unpaid' and
      // settles later — we must not mark it paid, destock, or email yet.
      if (eventSession.payment_status !== 'paid') {
        console.log(`[Stripe Webhook] Order ${orderId} payment_status=${eventSession.payment_status}, not fulfilling yet`)
        return NextResponse.json({ received: true })
      }

      // Atomic idempotency: claim the pending→paid transition. updateMany with a
      // status guard is a single conditional write, so concurrent duplicate
      // deliveries can't both pass a check-then-act race and double-process.
      const claim = await prisma.order.updateMany({
        where: { id: orderId, status: 'pending' },
        data: { status: 'paid' },
      })
      if (claim.count === 0) {
        console.log(`[Stripe Webhook] Order ${orderId} already processed or not pending, skipping`)
        return NextResponse.json({ received: true })
      }

      // We now exclusively own fulfillment for this order.
      const adminNotes: string[] = []

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

      // Record the actual paid amount + discount info (status already claimed above)
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          total: amountTotal,
          discountAmount: amountDiscount,
          discountCode,
        },
        include: { items: true },
      })

      console.log(`[Stripe Webhook] Order ${orderId} marked as paid, ${order.items.length} items to destock`)

      for (const item of order.items) {
        try {
          // Conditional decrement (stock >= quantity) so concurrent paid orders
          // can't drive stock negative. count === 0 means it would have oversold.
          const result = item.variantId
            ? await prisma.productVariant.updateMany({
                where: { id: item.variantId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              })
            : await prisma.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              })

          if (result.count === 0) {
            const ref = item.variantId ? `variant ${item.variantId}` : `product ${item.productId}`
            console.error(`[Stripe Webhook] OVERSOLD: not enough stock to fulfill ${item.quantity}× "${item.name}" (${ref}) for order ${orderId}`)
            adminNotes.push(`Oversold: "${item.name}" ×${item.quantity} — insufficient stock at payment, needs manual restock/refund.`)
          } else {
            console.log(`[Stripe Webhook] Decremented stock for ${item.variantId || item.productId} by ${item.quantity}`)
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

      // --- Shippo label purchase (best-effort, non-blocking) ---
      // If the checkout used a Shippo rate, the rate ID was forwarded through
      // Stripe metadata. Buy the label now and persist tracking info on the order.
      // On any failure we log + email admin but never throw — payment is already
      // confirmed and admin can buy the label manually from the dashboard.
      const shippoRateId = eventSession.metadata?.shippoRateId
      if (shippoRateId) {
        try {
          const label = await purchaseLabel(shippoRateId)
          if (label) {
            const trackingUrl = getCarrierTrackingUrl(label.carrier || order.carrier || 'usps', label.trackingNumber)
            await prisma.order.update({
              where: { id: orderId },
              data: {
                trackingNumber: label.trackingNumber,
                labelUrl: label.labelUrl,
                shippoTransactionId: label.transactionId,
                carrier: label.carrier || order.carrier,
                shippedAt: new Date(),
                status: 'processing',
              },
            })
            console.log(`[Stripe Webhook] Shippo label purchased for order ${orderId}: tracking=${label.trackingNumber}`)

            // Notify customer with tracking info
            if (user?.email) {
              try {
                await sendShippingNotificationEmail(user.email, user.fullName || 'Customer', {
                  orderId,
                  carrier: label.carrier || order.carrier || 'usps',
                  trackingNumber: label.trackingNumber,
                  trackingUrl,
                })
                console.log(`[Stripe Webhook] Shipping notification email sent for order ${orderId}`)
              } catch (shipEmailErr) {
                console.error(`[Stripe Webhook] FAILED to send shipping notification for order ${orderId}:`, shipEmailErr)
              }
            }
          }
        } catch (labelErr) {
          const msg = labelErr instanceof Error ? labelErr.message : String(labelErr)
          console.error(`[Stripe Webhook] Shippo label purchase failed for order ${orderId}: ${msg}`)
          // Record the failure context; admin will see the missing labelUrl in
          // /admin/orders and can buy a label manually.
          adminNotes.push(`Shippo label purchase failed: ${msg.slice(0, 400)}`)
        }
      }

      // Flush any accumulated admin notes (oversell warnings, label failures) in
      // a single write so they don't clobber each other.
      if (adminNotes.length > 0) {
        try {
          await prisma.order.update({
            where: { id: orderId },
            data: { adminNote: adminNotes.join(' | ').slice(0, 900) },
          })
        } catch (noteErr) {
          console.error(`[Stripe Webhook] FAILED to persist admin notes for order ${orderId}:`, noteErr)
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

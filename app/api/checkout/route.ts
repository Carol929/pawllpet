export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Checkout re-validates the selected Shippo rate (a network call to Shippo)
// before creating the Stripe session. Allow headroom over the 10s default.
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { calculateTax } from '@/lib/tax-rates'
import { calculateShipping, calculateTotalWeight, isShippingEligible, isPOBox, hasUnweighedItems } from '@/lib/shipping-rates'
import { validateRateId } from '@/lib/shipping'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!dbUser?.email) {
    return NextResponse.json({ error: 'Account email not found. Please sign in again.' }, { status: 401 })
  }

  try {
    const { items, shippingAddress, shippingMethod = 'standard', shippingRateId, shippingCarrier, shippingService } = await request.json()

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing items or shipping address' }, { status: 400 })
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 })
    }

    // Validate shipping eligibility — contiguous US only
    const eligibility = isShippingEligible(shippingAddress.state)
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason || 'Shipping not available to this location' }, { status: 400 })
    }
    if (isPOBox(shippingAddress.street) || isPOBox(shippingAddress.street2 || '')) {
      return NextResponse.json({ error: 'We cannot ship to PO Box, APO, or FPO addresses. Please use a street address.' }, { status: 400 })
    }

    // Validate quantities
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: 'Invalid item quantity (must be 1-99)' }, { status: 400 })
      }
    }

    // Fetch product prices from DB (prevent price tampering)
    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'live' },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        variants: { select: { id: true, name: true, price: true, stock: true } },
      },
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    const lineItems: { price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }; quantity: number }[] = []
    const orderItems: { productId: string; variantId?: string; name: string; image: string; price: number; quantity: number }[] = []
    let subtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      // Reject rather than silently drop: a product going non-live/deleted after
      // it was added to the cart must not silently reduce what the customer is
      // charged vs. what they saw.
      if (!product) {
        return NextResponse.json({ error: 'Some items in your cart are no longer available. Please review your cart and try again.' }, { status: 400 })
      }

      let price = product.price
      let itemName = product.name

      if (product.variants?.length) {
        // Variant products are priced per-variant (base price is 0 by convention).
        // A missing or unknown variantId must be rejected, otherwise the order
        // falls back to the $0 base price and skips stock checks entirely.
        if (!item.variantId) {
          return NextResponse.json({ error: `Please select an option for ${product.name}.` }, { status: 400 })
        }
        const variant = product.variants.find((v: { id: string }) => v.id === item.variantId)
        if (!variant) {
          return NextResponse.json({ error: `The selected option for ${product.name} is no longer available. Please refresh your cart.` }, { status: 400 })
        }
        price = variant.price
        itemName = `${product.name} - ${variant.name}`
        if (variant.stock < item.quantity) {
          return NextResponse.json({ error: `${itemName} only has ${variant.stock} in stock` }, { status: 400 })
        }
      } else {
        // Non-variant product: a variantId here is bogus.
        if (item.variantId) {
          return NextResponse.json({ error: `Invalid option selected for ${product.name}. Please refresh your cart.` }, { status: 400 })
        }
        // Stock check applies to every non-variant item, including $0 gifts,
        // to prevent overselling.
        if (product.stock < item.quantity) {
          return NextResponse.json({ error: `${product.name} only has ${product.stock} in stock` }, { status: 400 })
        }
      }
      subtotal += price * item.quantity

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemName,
            images: product.images[0] ? [product.images[0].url] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      })

      orderItems.push({
        productId: product.id,
        ...(item.variantId ? { variantId: item.variantId } : {}),
        name: itemName,
        image: product.images[0]?.url || '/product-placeholder.svg',
        price,
        quantity: item.quantity,
      })
    }

    if (!lineItems.length) {
      return NextResponse.json({ error: 'No valid products' }, { status: 400 })
    }

    // Check $10 threshold for free gifts ($0 products)
    const hasGift = products.some(p => p.price === 0)
    const paidTotal = orderItems.filter(i => i.price > 0).reduce((s, i) => s + i.price * i.quantity, 0)
    if (hasGift && paidTotal < 10) {
      return NextResponse.json({ error: 'Spend $10 or more to redeem your free gift' }, { status: 400 })
    }

    // Enforce the "no shipping without weight" invariant server-side (the client
    // and /api/shipping/rates both check this, but a direct API call must not be
    // able to ship an unweighed cart at the tier-1 rate).
    if (hasUnweighedItems(orderItems.map(i => ({ weight: productMap.get(i.productId)?.weight ?? undefined })))) {
      return NextResponse.json({ error: 'Some items are missing shipping weight. Please contact support@pawllpet.com.' }, { status: 400 })
    }

    const totalWeight = calculateTotalWeight(orderItems.map(i => ({ quantity: i.quantity, weight: productMap.get(i.productId)?.weight ?? undefined })))
    // Derive the legacy method from the selected rate id so an "express"
    // selection isn't silently charged as standard (the client sends the rate
    // id, not the method).
    let method: 'standard' | 'express' = shippingMethod === 'express' ? 'express' : 'standard'
    if (shippingRateId === 'legacy:express') method = 'express'
    else if (shippingRateId === 'legacy:standard') method = 'standard'

    // Resolve shipping cost. Two paths:
    //  1. If client sent a shippingRateId (Shippo path), re-validate it server-side
    //     and use that price. Saves the rate ID on the Order so the webhook can
    //     buy the label after payment.
    //  2. Otherwise, fall back to the legacy weight-tier table (current default).
    let shipping: number
    let shippingDisplayName: string
    let shippingDeliveryEstimate: { minimum: { unit: 'business_day'; value: number }; maximum: { unit: 'business_day'; value: number } } | undefined
    let resolvedShippoRateId: string | null = null
    let resolvedCarrier: string | null = null

    if (shippingRateId && !shippingRateId.startsWith('legacy:')) {
      // Shippo path: re-quote against Shippo for THIS cart + destination and
      // match the selection. We never trust the client's amount, and by
      // re-quoting for the real parcel/address a rate id minted for a lighter
      // or different-destination shipment cannot be replayed to underpay.
      const validated = await validateRateId({
        rateId: shippingRateId,
        to: {
          name: shippingAddress.fullName,
          street1: shippingAddress.street,
          street2: shippingAddress.street2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: 'US',
          phone: shippingAddress.phone || undefined,
        },
        carrier: typeof shippingCarrier === 'string' ? shippingCarrier : undefined,
        service: typeof shippingService === 'string' ? shippingService : undefined,
        items: orderItems.map(i => {
          const p = productMap.get(i.productId)
          return {
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            weight: p?.weight ?? null,
            length: p?.length ?? null,
            width: p?.width ?? null,
            height: p?.height ?? null,
          }
        }),
        subtotal,
      })
      if (!validated) {
        return NextResponse.json({ error: 'Selected shipping option is no longer available. Please refresh and choose a different option.' }, { status: 400 })
      }
      shipping = validated.amount
      shippingDisplayName = validated.displayName
      resolvedShippoRateId = validated.id
      resolvedCarrier = validated.carrier
      if (validated.estimatedDays) {
        shippingDeliveryEstimate = {
          minimum: { unit: 'business_day', value: validated.estimatedDays.min },
          maximum: { unit: 'business_day', value: validated.estimatedDays.max },
        }
      }
    } else {
      const shippingResult = calculateShipping(totalWeight, method, subtotal)
      if (shippingResult.needsReview) {
        return NextResponse.json({ error: 'Your order exceeds standard shipping limits. Please contact support@pawllpet.com for a custom shipping quote.' }, { status: 400 })
      }
      shipping = shippingResult.cost
      shippingDisplayName = shippingResult.label
      shippingDeliveryEstimate = method === 'express'
        ? { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 3 } }
        : { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } }
    }

    // Calculate sales tax based on shipping state (only for nexus states)
    const { rate: taxRate, amount: tax, stateAbbr } = calculateTax(subtotal, shippingAddress.state || '')
    const total = subtotal + shipping + tax

    // Add tax as a line item if applicable
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Sales Tax (${stateAbbr} ${(taxRate * 100).toFixed(1)}%)` },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      })
    }

    // Create order in DB first (pending until Stripe webhook confirms)
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        items: { create: orderItems },
        ...(resolvedShippoRateId ? { shippoRateId: resolvedShippoRateId } : {}),
        ...(resolvedCarrier ? { carrier: resolvedCarrier } : {}),
      },
    })

    console.log(`[Checkout] Order ${order.id} created for user ${userId}, total: $${total.toFixed(2)}`)

    // Create Stripe Checkout Session with idempotency
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
    let session
    try {
      session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shipping * 100), currency: 'usd' },
            display_name: shipping > 0 ? shippingDisplayName : 'Free Shipping',
            ...(shippingDeliveryEstimate ? { delivery_estimate: shippingDeliveryEstimate } : {}),
          },
        }],
        success_url: `${siteUrl}/checkout/success?orderId=${order.id}`,
        cancel_url: `${siteUrl}/checkout/cancel?orderId=${order.id}`,
        metadata: {
          orderId: order.id,
          ...(resolvedShippoRateId ? { shippoRateId: resolvedShippoRateId } : {}),
        },
        customer_email: dbUser.email,
        // Customer promotion codes are disabled: sales tax is passed as its own
        // line item, and Stripe applies percentage coupons proportionally across
        // ALL line items — including tax — which under-collects sales tax and
        // makes Order.tax disagree with what was actually charged. Re-enabling
        // coupons requires moving tax to Stripe Tax (automatic_tax) so the tax
        // is computed on the post-discount amount and never itself discounted.
        allow_promotion_codes: false,
        expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 min expiry
      }, {
        idempotencyKey: `checkout_${order.id}`,
      })
    } catch (stripeErr) {
      // Stripe session failed — mark order as cancelled so it doesn't linger as 'pending'
      console.error(`[Checkout] Stripe session creation failed for order ${order.id}:`, stripeErr)
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      }).catch(() => {})
      return NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 500 })
    }

    // Save stripe session ID to order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    console.log(`[Checkout] Stripe session ${session.id} created for order ${order.id}`)
    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : ''
    console.error('[Checkout] Error:', msg, stack)
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json({ error: 'Payment system not configured. Please contact support.' }, { status: 500 })
    }
    if (msg.includes('Unknown argument') || msg.includes('Invalid')) {
      return NextResponse.json({ error: 'Database schema needs update. Please contact support.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Checkout failed. Please try again or contact support.' }, { status: 500 })
  }
}

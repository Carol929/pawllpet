export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { calculateTax } from '@/lib/tax-rates'
import { calculateShipping, calculateTotalWeight } from '@/lib/shipping-rates'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  try {
    const { items, shippingAddress, shippingMethod = 'standard' } = await request.json()

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing items or shipping address' }, { status: 400 })
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 })
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
    const orderItems: { productId: string; name: string; image: string; price: number; quantity: number }[] = []
    let subtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      // Resolve variant price if specified
      let price = product.price
      let itemName = product.name
      if (item.variantId && product.variants?.length) {
        const variant = product.variants.find((v: { id: string }) => v.id === item.variantId)
        if (variant) {
          price = variant.price
          itemName = `${product.name} - ${variant.name}`
          // Stock validation for variant
          if (variant.stock < item.quantity) {
            return NextResponse.json({ error: `${itemName} only has ${variant.stock} in stock` }, { status: 400 })
          }
        }
      }

      // Stock validation — prevent overselling (base product)
      if (!item.variantId && product.price > 0 && product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} only has ${product.stock} in stock` }, { status: 400 })
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

    const totalWeight = calculateTotalWeight(orderItems.map(i => ({ quantity: i.quantity, weight: (productMap.get(i.productId) as Record<string, unknown>)?.weight as number || 1 })))
    const method = shippingMethod === 'express' ? 'express' : 'standard' as const
    const { cost: shipping } = calculateShipping(totalWeight, method, subtotal)

    // Calculate sales tax based on shipping state (only for nexus states)
    const { rate: taxRate, amount: tax, stateAbbr } = calculateTax(subtotal, shippingAddress.state || '')
    const total = subtotal + shipping + tax

    // Create order in DB (pending until Stripe confirms)
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
      },
    })

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

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(shipping > 0 ? {
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shipping * 100), currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } },
          },
        }],
      } : {
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } },
          },
        }],
      }),
      success_url: `${siteUrl}/checkout/success?orderId=${order.id}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: { orderId: order.id },
    })

    // Save stripe session ID to order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : ''
    console.error('Checkout error:', msg, stack)
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json({ error: 'Payment system not configured. Please contact support.' }, { status: 500 })
    }
    if (msg.includes('Unknown argument') || msg.includes('Invalid')) {
      return NextResponse.json({ error: 'Database schema needs update. Please contact support.' }, { status: 500 })
    }
    return NextResponse.json({ error: `Checkout failed: ${msg}` }, { status: 500 })
  }
}

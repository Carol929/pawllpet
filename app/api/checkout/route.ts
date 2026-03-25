export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { calculateTax } from '@/lib/tax-rates'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  try {
    const { items, shippingAddress } = await request.json()

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing items or shipping address' }, { status: 400 })
    }

    // Fetch product prices from DB (prevent price tampering)
    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'live' },
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    const lineItems: { price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }; quantity: number }[] = []
    const orderItems: { productId: string; name: string; image: string; price: number; quantity: number }[] = []
    let subtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const price = product.price
      subtotal += price * item.quantity

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.images[0] ? [product.images[0].url] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      })

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.images[0]?.url || '/product-placeholder.svg',
        price,
        quantity: item.quantity,
      })
    }

    if (!lineItems.length) {
      return NextResponse.json({ error: 'No valid products' }, { status: 400 })
    }

    const shipping = subtotal >= 50 ? 0 : 5.99

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

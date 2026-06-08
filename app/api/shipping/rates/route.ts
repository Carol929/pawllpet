export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Shippo's synchronous rate call queries every enabled carrier and can take
// well over the 10s Vercel default. Allow up to 30s so the request completes
// instead of the connection being dropped ("Failed to fetch" on the client).
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import {
  getShippingOptions,
  hasUnweighedItems,
  isPOBox,
  isShippingEligible,
} from '@/lib/shipping'

const requestSchema = z.object({
  to: z.object({
    name: z.string().min(1).max(200),
    street1: z.string().min(1).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().length(2),
    zip: z.string().min(5).max(10),
    phone: z.string().max(30).optional(),
    email: z.string().email().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  subtotal: z.number().min(0).max(100000),
})

/**
 * POST /api/shipping/rates
 *
 * Returns live shipping options for a destination + cart. Used by the
 * checkout page to render rate radio buttons after the user enters their
 * address. The selected rate's `id` is passed to /api/checkout, which
 * forwards it through Stripe metadata so the webhook can buy the label.
 *
 * Routes through lib/shipping/provider.ts which selects Shippo or legacy
 * based on SHIPPING_PROVIDER, with automatic fallback on Shippo failure.
 */
export async function POST(request: NextRequest) {
  let parsed
  try {
    const body = await request.json()
    parsed = requestSchema.parse(body)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid request body'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { to, items, subtotal } = parsed

  // Fast-reject obviously ineligible destinations before any DB work
  const eligibility = isShippingEligible(to.state)
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason }, { status: 400 })
  }
  if (isPOBox(to.street1) || (to.street2 && isPOBox(to.street2))) {
    return NextResponse.json(
      {
        error:
          'We cannot ship to PO Box, APO, or FPO addresses. Please use a street address.',
      },
      { status: 400 },
    )
  }

  // Load product weights + dimensions
  const productIds = Array.from(new Set(items.map((i) => i.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'live' },
    select: {
      id: true,
      weight: true,
      length: true,
      width: true,
      height: true,
    },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  const enrichedItems = items.map((item) => {
    const p = productMap.get(item.productId)
    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      weight: p?.weight ?? null,
      length: p?.length ?? null,
      width: p?.width ?? null,
      height: p?.height ?? null,
    }
  })

  // Require weights on all items — same guard the checkout API uses
  if (hasUnweighedItems(enrichedItems.map((i) => ({ weight: i.weight ?? undefined })))) {
    return NextResponse.json(
      {
        error:
          'Some items in your cart are missing weight information. Please contact support@pawllpet.com.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await getShippingOptions({
      to: { ...to, country: 'US' },
      items: enrichedItems,
      subtotal,
    })

    if (!result.options.length) {
      return NextResponse.json(
        {
          error:
            'Your order exceeds standard shipping limits. Please contact support@pawllpet.com for a custom shipping quote.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      options: result.options,
      provider: result.usedProvider,
      ...(result.fallbackReason ? { fallbackReason: result.fallbackReason } : {}),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[shipping/rates] error:', msg)
    return NextResponse.json(
      { error: 'Unable to calculate shipping. Please try again.' },
      { status: 500 },
    )
  }
}

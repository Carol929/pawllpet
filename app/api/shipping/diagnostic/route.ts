export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { getActiveProvider } from '@/lib/shipping'
import { getShippoRates } from '@/lib/shipping/shippo-client'
import { prisma } from '@/lib/db'

/**
 * GET /api/shipping/diagnostic
 *
 * TEMPORARY diagnostic endpoint for the Shippo POC. Reports why the active
 * shipping provider resolves the way it does, and runs a live Shippo test
 * rate call so we can see the exact error if Shippo is failing.
 *
 * Safe to expose: it NEVER returns the API key value, only whether it's
 * present and its non-secret prefix (e.g. "shippo_test"). Delete this route
 * before promoting Shippo to production.
 */
export async function GET() {
  const apiKey = process.env.SHIPPO_API_KEY

  const env = {
    SHIPPING_PROVIDER: process.env.SHIPPING_PROVIDER ?? '(not set)',
    SHIPPO_API_KEY_present: !!apiKey,
    // Show only the non-secret prefix so we can confirm test vs live key
    SHIPPO_API_KEY_prefix: apiKey ? apiKey.slice(0, 12) + '…' : '(not set)',
    SHIPPO_FROM_ADDRESS_ID_present: !!process.env.SHIPPO_FROM_ADDRESS_ID,
    SHIPPO_ORIGIN_NAME: process.env.SHIPPO_ORIGIN_NAME ?? '(not set)',
    SHIPPO_ORIGIN_STREET: process.env.SHIPPO_ORIGIN_STREET ?? '(not set)',
    SHIPPO_ORIGIN_CITY: process.env.SHIPPO_ORIGIN_CITY ?? '(not set)',
    SHIPPO_ORIGIN_STATE: process.env.SHIPPO_ORIGIN_STATE ?? '(not set)',
    SHIPPO_ORIGIN_ZIP: process.env.SHIPPO_ORIGIN_ZIP ?? '(not set)',
    SHIPPO_ORIGIN_PHONE_present: !!process.env.SHIPPO_ORIGIN_PHONE,
  }

  const activeProvider = getActiveProvider()

  // Explain WHY the provider resolved this way
  let providerReason: string
  if (process.env.SHIPPING_PROVIDER?.toLowerCase() !== 'shippo') {
    providerReason = `SHIPPING_PROVIDER is "${env.SHIPPING_PROVIDER}", not "shippo" — using legacy. Set it to exactly "shippo".`
  } else if (!apiKey) {
    providerReason = 'SHIPPING_PROVIDER is "shippo" but SHIPPO_API_KEY is missing — using legacy. Add the API key.'
  } else {
    providerReason = 'Provider resolves to Shippo. Running a live test rate call below.'
  }

  // Live test: only attempt if the provider would actually use Shippo.
  // We time the call so we can tell whether Vercel's function timeout is the
  // culprit behind "Failed to fetch" on the real checkout.
  let liveTest: Record<string, unknown> = { skipped: true, reason: 'provider is not shippo' }
  if (activeProvider === 'shippo') {
    const startedAt = performance.now()
    try {
      const rates = await getShippoRates(
        {
          name: 'Diagnostic Test',
          street1: '1600 Amphitheatre Pkwy',
          city: 'Mountain View',
          state: 'CA',
          zip: '94043',
        },
        { weightLb: 1, lengthIn: 8, widthIn: 6, heightIn: 4 },
      )
      liveTest = {
        ok: true,
        elapsedMs: Math.round(performance.now() - startedAt),
        ratesReturned: rates.length,
        sample: rates.slice(0, 5).map((r) => ({
          carrier: r.carrier,
          service: r.service,
          amount: r.amount,
        })),
      }
    } catch (err) {
      liveTest = {
        ok: false,
        elapsedMs: Math.round(performance.now() - startedAt),
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  // Real-path test: replicate exactly what /api/shipping/rates does for a real
  // product — load a live product from the DB, then quote Shippo with its real
  // weight/dimensions. This catches DB issues and slow real-product quotes that
  // the hardcoded liveTest above wouldn't surface.
  let realPathTest: Record<string, unknown> = { skipped: true }
  try {
    const dbStart = performance.now()
    const product = await prisma.product.findFirst({
      where: { status: 'live' },
      select: { id: true, name: true, weight: true, length: true, width: true, height: true },
    })
    const dbMs = Math.round(performance.now() - dbStart)

    if (!product) {
      realPathTest = { skipped: true, reason: 'no live product found' }
    } else if (!product.weight || product.weight <= 0) {
      realPathTest = {
        ok: false,
        reason: 'product is missing weight — /api/shipping/rates returns a 400 for this',
        product: { name: product.name, weight: product.weight },
        dbMs,
      }
    } else if (activeProvider === 'shippo') {
      const quoteStart = performance.now()
      try {
        const rates = await getShippoRates(
          { name: 'Diagnostic Test', street1: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'CA', zip: '94043' },
          {
            weightLb: product.weight,
            lengthIn: product.length ?? 6,
            widthIn: product.width ?? 4,
            heightIn: product.height ?? 2,
          },
        )
        realPathTest = {
          ok: true,
          product: { name: product.name, weight: product.weight, length: product.length, width: product.width, height: product.height },
          dbMs,
          quoteMs: Math.round(performance.now() - quoteStart),
          ratesReturned: rates.length,
        }
      } catch (err) {
        realPathTest = {
          ok: false,
          product: { name: product.name, weight: product.weight },
          dbMs,
          quoteMs: Math.round(performance.now() - quoteStart),
          error: err instanceof Error ? err.message : String(err),
        }
      }
    }
  } catch (err) {
    realPathTest = {
      ok: false,
      stage: 'db',
      error: err instanceof Error ? err.message : String(err),
    }
  }

  return NextResponse.json(
    {
      activeProvider,
      providerReason,
      env,
      liveTest,
      realPathTest,
      note: 'This is a temporary POC diagnostic. It does not expose the API key value.',
    },
    { status: 200 },
  )
}

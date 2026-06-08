export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getActiveProvider } from '@/lib/shipping'
import { getShippoRates } from '@/lib/shipping/shippo-client'

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

  // Live test: only attempt if the provider would actually use Shippo
  let liveTest: Record<string, unknown> = { skipped: true, reason: 'provider is not shippo' }
  if (activeProvider === 'shippo') {
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
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  return NextResponse.json(
    {
      activeProvider,
      providerReason,
      env,
      liveTest,
      note: 'This is a temporary POC diagnostic. It does not expose the API key value.',
    },
    { status: 200 },
  )
}

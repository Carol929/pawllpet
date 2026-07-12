/**
 * Shipping strategy resolver.
 *
 * Reads SHIPPING_PROVIDER env var at call time and routes to either the Shippo
 * client or the legacy hardcoded table. When Shippo is selected but the call
 * fails (network error, bad API key, no rates for destination), we fall back
 * to legacy so the checkout flow NEVER breaks because of shipping.
 *
 * Why a strategy layer instead of replacing legacy outright:
 *   - Lets us flip per environment (dev=shippo, prod=legacy until validated)
 *   - Gives us a safety net during the POC validation window
 *   - Once Shippo is stable in production, we can delete this file + legacy
 *     and have callers import Shippo directly.
 */

import {
  calculateShipping,
  calculateTotalWeight,
  isShippingEligible,
  FREE_STANDARD_THRESHOLD,
} from '../shipping-rates'
import {
  getCarrierTrackingUrl,
  getShippoRates,
  purchaseShippoLabel,
} from './shippo-client'
import type {
  CartItemForShipping,
  LabelPurchaseResult,
  ShippingAddress,
  ShippingRateOption,
} from './types'

export type ShippingProvider = 'legacy' | 'shippo'

const LEGACY_RATE_PREFIX = 'legacy:'

export function getActiveProvider(): ShippingProvider {
  const raw = process.env.SHIPPING_PROVIDER?.toLowerCase()
  if (raw === 'shippo' && process.env.SHIPPO_API_KEY) return 'shippo'
  return 'legacy'
}

/**
 * Return shipping options for a destination + cart, ordered cheapest first.
 *
 * Uses the active provider. On Shippo failure, transparently falls back to
 * the legacy table — the returned `provider` field tells the caller which
 * path actually ran (useful for logging).
 */
export async function getShippingOptions(args: {
  to: ShippingAddress
  items: CartItemForShipping[]
  subtotal: number
}): Promise<{ options: ShippingRateOption[]; usedProvider: ShippingProvider; fallbackReason?: string }> {
  const { to, items, subtotal } = args
  const provider = getActiveProvider()

  // Hard rejections that apply regardless of provider (still useful as a fast
  // path; Shippo would also reject AK/HI/PO Box but we save a round trip).
  // NOTE: once Shippo is live and validated, we can lift the AK/HI restriction
  // since USPS Priority Mail covers them — that change goes in a follow-up PR.
  const eligibility = isShippingEligible(to.state)
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason || 'Shipping not available to this destination')
  }

  if (provider === 'shippo') {
    try {
      const parcel = buildParcel(items)
      const rates = await getShippoRates(to, parcel)
      // Sort cheapest first
      rates.sort((a, b) => a.amount - b.amount)
      // Honor the same free-standard-shipping promise the legacy table (and the
      // storefront UI) make: at/above the threshold the cheapest option ships
      // free. Without this, a customer who crossed $80 because the site told
      // them to would still be quoted paid Shippo rates.
      applyFreeStandardShipping(rates, subtotal)
      return { options: rates, usedProvider: 'shippo' }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[shipping] Shippo failed, falling back to legacy: ${msg}`)
      const legacy = computeLegacyOptions(items, subtotal)
      return { options: legacy, usedProvider: 'legacy', fallbackReason: msg }
    }
  }

  return { options: computeLegacyOptions(items, subtotal), usedProvider: 'legacy' }
}

/**
 * Re-validate a selected rate against the provider and return its authoritative
 * price. Called from /api/checkout — we never trust the client's `amount`.
 *
 * For legacy IDs, recomputes via the legacy table from the server's cart weight
 * + subtotal.
 *
 * For Shippo IDs, we do NOT simply re-fetch the rate by id: that id may have
 * been minted (via the public /api/shipping/rates) for a lighter parcel or a
 * different destination, then replayed here to underpay. Instead we re-quote
 * Shippo for THIS cart + destination and match the client's selection by
 * carrier + service, using the freshly-quoted amount and id. A rate that
 * doesn't correspond to a current option for the real shipment is rejected.
 *
 * Returns null if the selection can't be matched to a current option.
 */
export async function validateRateId(args: {
  rateId: string
  items: CartItemForShipping[]
  subtotal: number
  to?: ShippingAddress
  carrier?: string
  service?: string
}): Promise<ShippingRateOption | null> {
  const { rateId, items, subtotal, to, carrier, service } = args
  if (!rateId) return null

  if (rateId.startsWith(LEGACY_RATE_PREFIX)) {
    const legacy = computeLegacyOptions(items, subtotal)
    return legacy.find((o) => o.id === rateId) || null
  }

  // Shippo path — re-quote for the true shipment and match the selection.
  if (!to) return null
  try {
    const { options } = await getShippingOptions({ to, items, subtotal })
    // Exact id match wins (same shipment quote); otherwise fall back to matching
    // the selected carrier + service among the freshly-quoted options.
    const byId = options.find((o) => o.id === rateId)
    if (byId) return byId
    if (carrier && service) {
      const match = options.find(
        (o) =>
          o.provider === 'shippo' &&
          o.carrier.toLowerCase() === carrier.toLowerCase() &&
          o.service.toLowerCase() === service.toLowerCase(),
      )
      if (match) return match
    }
    return null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[shipping] validateRateId(${rateId}) failed: ${msg}`)
    return null
  }
}

/**
 * Purchase a label for a rate that was previously offered to the user.
 *
 * For legacy rates (id starts with "legacy:"), this is a no-op and returns null
 * — the order still ships, but the admin will need to buy a label manually
 * through the carrier's portal.
 *
 * For Shippo rates, this synchronously buys the label via Shippo's transactions
 * endpoint and returns the tracking number + PDF URL.
 */
export async function purchaseLabel(rateId: string): Promise<LabelPurchaseResult | null> {
  if (!rateId || rateId.startsWith(LEGACY_RATE_PREFIX)) return null
  return purchaseShippoLabel(rateId)
}

export { getCarrierTrackingUrl }

/* ---------- internals ---------- */

/**
 * Build a single parcel from cart items.
 *
 * POC simplification: we sum weights and use the largest single-item dimensions
 * (not a true bin-packing). For real production we'd want a packing algorithm,
 * but at this volume the carrier will re-measure on intake anyway.
 */
function buildParcel(items: CartItemForShipping[]) {
  let totalWeight = 0
  let maxLength = 0
  let maxWidth = 0
  let maxHeight = 0

  for (const item of items) {
    const w = item.weight ?? 0
    totalWeight += w * item.quantity
    if (item.length && item.length > maxLength) maxLength = item.length
    if (item.width && item.width > maxWidth) maxWidth = item.width
    if (item.height && item.height > maxHeight) maxHeight = item.height
  }

  // Sensible defaults so Shippo doesn't reject the request — these are tiny
  // values that won't matter once dimensions are populated on actual products.
  return {
    weightLb: Math.max(totalWeight, 0.1),
    lengthIn: Math.max(maxLength, 6),
    widthIn: Math.max(maxWidth, 4),
    heightIn: Math.max(maxHeight, 2),
  }
}

/**
 * Apply the free-standard-shipping promotion to a set of Shippo options.
 *
 * At/above the threshold the cheapest option (already sorted first) is set to
 * $0 and relabelled. The merchant still buys the real label after payment — the
 * free shipping is absorbed, exactly like the legacy table's free tier.
 */
function applyFreeStandardShipping(rates: ShippingRateOption[], subtotal: number) {
  if (subtotal < FREE_STANDARD_THRESHOLD || rates.length === 0) return
  const cheapest = rates[0]
  cheapest.amount = 0
  if (!/free/i.test(cheapest.displayName)) {
    cheapest.displayName = `${cheapest.displayName} (Free)`
  }
}

function computeLegacyOptions(
  items: CartItemForShipping[],
  subtotal: number,
): ShippingRateOption[] {
  const totalWeight = calculateTotalWeight(
    items.map((i) => ({ quantity: i.quantity, weight: i.weight ?? undefined })),
  )

  const standard = calculateShipping(totalWeight, 'standard', subtotal)
  const express = calculateShipping(totalWeight, 'express', subtotal)

  // If the weight is too heavy for flat-rate, signal that to the caller by
  // returning empty — caller will surface the "contact support" error.
  if (standard.needsReview) return []

  const opts: ShippingRateOption[] = [
    {
      id: `${LEGACY_RATE_PREFIX}standard`,
      provider: 'legacy',
      carrier: 'legacy',
      service: 'Standard',
      displayName: standard.label,
      amount: standard.cost,
      currency: 'USD',
      estimatedDays: { min: 5, max: 7 },
    },
  ]

  if (!express.needsReview) {
    opts.push({
      id: `${LEGACY_RATE_PREFIX}express`,
      provider: 'legacy',
      carrier: 'legacy',
      service: 'Express',
      displayName: express.label,
      amount: express.cost,
      currency: 'USD',
      estimatedDays: { min: 2, max: 3 },
    })
  }

  return opts
}

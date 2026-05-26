/**
 * Thin Shippo REST client (no SDK dependency).
 *
 * We use `fetch` directly to keep the bundle small and avoid the unmaintained
 * official Node SDK (https://github.com/goshippo/shippo-node-client — archived).
 *
 * All functions throw on non-2xx responses or missing config. The provider
 * layer in provider.ts catches these and falls back to the legacy rate table.
 *
 * Docs: https://docs.goshippo.com/
 */

import type {
  LabelPurchaseResult,
  Parcel,
  ShippingAddress,
  ShippingRateOption,
} from './types'

const SHIPPO_API_BASE = 'https://api.goshippo.com'

interface ShippoOrigin {
  name: string
  street1: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
}

function getApiKey(): string {
  const key = process.env.SHIPPO_API_KEY
  if (!key) throw new Error('SHIPPO_API_KEY is not configured')
  return key
}

function getOrigin(): ShippoOrigin {
  const name = process.env.SHIPPO_ORIGIN_NAME || 'PawLL Pet'
  const street1 = process.env.SHIPPO_ORIGIN_STREET
  const city = process.env.SHIPPO_ORIGIN_CITY || 'Arlington'
  const state = process.env.SHIPPO_ORIGIN_STATE || 'VA'
  const zip = process.env.SHIPPO_ORIGIN_ZIP || '22202'
  const phone = process.env.SHIPPO_ORIGIN_PHONE
  const email = process.env.SHIPPO_ORIGIN_EMAIL

  if (!street1) throw new Error('SHIPPO_ORIGIN_STREET is not configured')

  return { name, street1, city, state, zip, country: 'US', phone, email }
}

async function shippoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SHIPPO_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `ShippoToken ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Shippo ${path} failed: ${res.status} ${res.statusText} ${body.slice(0, 200)}`)
  }

  return res.json() as Promise<T>
}

/* ---------- Shippo API response shapes (only the fields we use) ---------- */

interface ShippoRate {
  object_id: string
  provider: string // e.g. 'USPS', 'UPS', 'FedEx'
  servicelevel: { name: string; token: string }
  amount: string // string in USD
  currency: string
  estimated_days?: number
  duration_terms?: string
}

interface ShippoShipmentResponse {
  object_id: string
  status: string
  rates: ShippoRate[]
  messages?: { source: string; code: string; text: string }[]
}

interface ShippoRateDetail {
  object_id: string
  provider: string
  servicelevel: { name: string; token: string }
  amount: string
  currency: string
  estimated_days?: number
}

interface ShippoTransactionResponse {
  object_id: string
  status: 'SUCCESS' | 'ERROR' | 'WAITING' | 'QUEUED'
  tracking_number: string
  label_url: string
  rate: string // rate object_id
  messages?: { source: string; code: string; text: string }[]
}

/* ---------- Public API ---------- */

/**
 * Fetch live rates from Shippo for a given destination + parcel.
 *
 * Throws on configuration errors, network errors, or Shippo API errors.
 * Returns normalized ShippingRateOption[] so callers don't need to know
 * Shippo's response format.
 */
export async function getShippoRates(
  to: ShippingAddress,
  parcel: Parcel,
): Promise<ShippingRateOption[]> {
  const origin = getOrigin()

  const shipment = await shippoFetch<ShippoShipmentResponse>('/shipments/', {
    method: 'POST',
    body: JSON.stringify({
      address_from: {
        name: origin.name,
        street1: origin.street1,
        city: origin.city,
        state: origin.state,
        zip: origin.zip,
        country: origin.country,
        phone: origin.phone,
        email: origin.email,
      },
      address_to: {
        name: to.name,
        street1: to.street1,
        street2: to.street2 || '',
        city: to.city,
        state: to.state,
        zip: to.zip,
        country: to.country || 'US',
        phone: to.phone || '',
        email: to.email || '',
      },
      parcels: [
        {
          length: parcel.lengthIn.toString(),
          width: parcel.widthIn.toString(),
          height: parcel.heightIn.toString(),
          distance_unit: 'in',
          weight: parcel.weightLb.toString(),
          mass_unit: 'lb',
        },
      ],
      async: false,
    }),
  })

  if (!shipment.rates?.length) {
    const msg = shipment.messages?.map((m) => m.text).join('; ') || 'no rates returned'
    throw new Error(`Shippo returned no rates: ${msg}`)
  }

  return shipment.rates.map((r): ShippingRateOption => {
    const amount = parseFloat(r.amount)
    const carrier = r.provider.toLowerCase()
    const serviceName = r.servicelevel?.name || r.servicelevel?.token || 'Standard'
    const displayName = `${r.provider} ${serviceName}`
    return {
      id: r.object_id,
      provider: 'shippo',
      carrier,
      service: serviceName,
      displayName,
      amount,
      currency: 'USD',
      estimatedDays:
        typeof r.estimated_days === 'number' && r.estimated_days > 0
          ? { min: r.estimated_days, max: r.estimated_days + 1 }
          : undefined,
    }
  })
}

/**
 * Re-fetch a Shippo rate by its object_id.
 *
 * Used by /api/checkout to validate the price the client sent — we never
 * trust the client's `amount` field, we re-fetch from Shippo and use that.
 */
export async function getShippoRateById(rateId: string): Promise<ShippingRateOption> {
  const r = await shippoFetch<ShippoRateDetail>(`/rates/${encodeURIComponent(rateId)}/`)
  const serviceName = r.servicelevel?.name || r.servicelevel?.token || 'Standard'
  return {
    id: r.object_id,
    provider: 'shippo',
    carrier: r.provider.toLowerCase(),
    service: serviceName,
    displayName: `${r.provider} ${serviceName}`,
    amount: parseFloat(r.amount),
    currency: 'USD',
    estimatedDays:
      typeof r.estimated_days === 'number' && r.estimated_days > 0
        ? { min: r.estimated_days, max: r.estimated_days + 1 }
        : undefined,
  }
}

/**
 * Purchase a shipping label for a previously-quoted rate.
 *
 * Called from the Stripe webhook after `checkout.session.completed`.
 * Synchronous (`async: false`) so we can persist the result immediately.
 *
 * For POC scale this is fine; if order volume grows past a few per minute
 * we should move this to a background job (Inngest / queue).
 */
export async function purchaseShippoLabel(rateId: string): Promise<LabelPurchaseResult> {
  const tx = await shippoFetch<ShippoTransactionResponse>('/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      rate: rateId,
      label_file_type: 'PDF',
      async: false,
    }),
  })

  if (tx.status !== 'SUCCESS') {
    const msg = tx.messages?.map((m) => m.text).join('; ') || `status=${tx.status}`
    throw new Error(`Shippo label purchase failed: ${msg}`)
  }

  // We need the carrier + service info but the transaction response doesn't
  // include them — caller already has the ShippingRateOption from getShippoRates,
  // so they can pass `carrier`/`service` through. For now we leave them empty
  // and let the caller fill them in from the saved rate selection.
  return {
    provider: 'shippo',
    trackingNumber: tx.tracking_number,
    labelUrl: tx.label_url,
    transactionId: tx.object_id,
    rateId: tx.rate,
    carrier: '',
    service: '',
  }
}

/**
 * Build a public tracking URL for a carrier + tracking number.
 *
 * Shippo provides its own tracking URLs but we link to the carrier directly
 * so customers see a familiar UI.
 */
export function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const t = encodeURIComponent(trackingNumber)
  switch (carrier.toLowerCase()) {
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`
    case 'ups':
      return `https://www.ups.com/track?tracknum=${t}`
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${t}`
    case 'dhl':
    case 'dhl_express':
      return `https://www.dhl.com/en/express/tracking.html?AWB=${t}`
    default:
      // Fallback: Shippo's own tracking page works for any carrier they support
      return `https://tools.goshippo.com/track/${encodeURIComponent(carrier)}/${t}`
  }
}

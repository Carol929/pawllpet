/**
 * Provider-agnostic shipping types.
 *
 * The provider layer in lib/shipping/provider.ts maps Shippo or legacy responses
 * into these shapes so callers (checkout API, webhook, UI) don't depend on
 * Shippo's response format directly.
 */

export interface ShippingAddress {
  name: string
  street1: string
  street2?: string
  city: string
  state: string // 2-letter US state code
  zip: string
  country?: string // defaults to 'US'
  phone?: string
  email?: string
}

export interface Parcel {
  weightLb: number
  lengthIn: number
  widthIn: number
  heightIn: number
}

export interface CartItemForShipping {
  productId: string
  variantId?: string
  quantity: number
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
}

/**
 * A single shipping rate option presented to the user at checkout.
 *
 * For Shippo: `id` is the Shippo rate object_id, which the webhook later passes
 * to purchaseLabel() to buy that exact rate.
 *
 * For legacy: `id` is a synthetic key like 'legacy:standard' / 'legacy:express'.
 * Calling purchaseLabel() on a legacy id is a no-op (no label to buy).
 */
export interface ShippingRateOption {
  id: string
  provider: 'shippo' | 'legacy'
  carrier: string // e.g. 'usps', 'ups', 'fedex', 'legacy'
  service: string // e.g. 'Priority Mail', 'Ground', 'Standard Shipping'
  displayName: string // user-facing label
  amount: number // USD, not cents
  currency: 'USD'
  estimatedDays?: { min: number; max: number }
}

export interface LabelPurchaseResult {
  provider: 'shippo'
  trackingNumber: string
  carrier: string
  service: string
  labelUrl: string
  transactionId: string
  rateId: string
}

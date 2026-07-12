/**
 * Public entry point for shipping logic.
 *
 * Callers (checkout API, webhook, UI) should import from here, not from
 * shippo-client.ts or shipping-rates.ts directly. This lets us swap providers
 * without touching call sites.
 */

export {
  getActiveProvider,
  getCarrierTrackingUrl,
  getShippingOptions,
  purchaseLabel,
  validateRateId,
} from './provider'

export type {
  CartItemForShipping,
  LabelPurchaseResult,
  Parcel,
  ShippingAddress,
  ShippingRateOption,
} from './types'

// Re-export legacy helpers that are still used directly (address validation,
// weight totalling, missing-weight detection). These are stable, provider-
// independent utilities — they live in shipping-rates.ts but conceptually
// belong to the shipping module.
export {
  calculateTotalWeight,
  hasUnweighedItems,
  isPOBox,
  isShippingEligible,
} from '../shipping-rates'

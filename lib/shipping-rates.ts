/**
 * Temporary Shipping Rate Table (2026 estimates)
 * Origin: Arlington, VA 22202
 * Contiguous US only (48 states) — excludes AK, HI, PO Box, APO/FPO
 * Based on UPS Small Business rates + residential surcharge
 *
 * TODO: Replace with live UPS API integration
 */

interface ShippingRate {
  maxWeight: number // lbs
  standard: number  // UPS Ground (5-7 business days)
  express: number   // UPS 2nd Day Air (2-3 business days)
}

const RATE_TABLE: ShippingRate[] = [
  { maxWeight: 1,  standard: 7.99,  express: 15.99 },
  { maxWeight: 3,  standard: 9.99,  express: 19.99 },
  { maxWeight: 5,  standard: 11.99, express: 24.99 },
  { maxWeight: 10, standard: 14.99, express: 29.99 },
  { maxWeight: 20, standard: 19.99, express: 39.99 },
  { maxWeight: Infinity, standard: 27.99, express: 49.99 },
]

const FREE_STANDARD_THRESHOLD = 80 // Free standard shipping at $80+
const MAX_STANDARD_WEIGHT = 50     // lbs — orders above this need manual review

// States that are NOT eligible for flat-rate shipping
const RESTRICTED_STATES = new Set(['AK', 'HI'])

/**
 * Check if a shipping address is eligible for flat-rate shipping
 */
export function isShippingEligible(state: string, zip?: string): { eligible: boolean; reason?: string } {
  const st = state.trim().toUpperCase()

  if (RESTRICTED_STATES.has(st)) {
    return { eligible: false, reason: 'Shipping to Alaska and Hawaii is not available at this time. Please contact support@pawllpet.com for a custom quote.' }
  }

  // PO Box / APO / FPO detection (checked against street address in checkout)
  return { eligible: true }
}

/**
 * Check if a street address is a PO Box / APO / FPO
 */
export function isPOBox(street: string): boolean {
  const s = street.trim().toLowerCase()
  return /\bp\.?\s*o\.?\s*box\b/i.test(s)
    || /\bapo\b/i.test(s)
    || /\bfpo\b/i.test(s)
}

/**
 * Check if all items in the cart have weight set
 */
export function hasUnweighedItems(items: { weight?: number }[]): boolean {
  return items.some(item => !item.weight || item.weight <= 0)
}

/**
 * Calculate shipping cost
 * @param totalWeightLbs - total weight of all items in lbs
 * @param method - 'standard' (Ground) or 'express' (2nd Day Air)
 * @param subtotal - order subtotal for free shipping check
 */
export function calculateShipping(
  totalWeightLbs: number,
  method: 'standard' | 'express',
  subtotal: number
): { cost: number; label: string; estimate: string; needsReview: boolean } {
  // Check if order is too heavy for flat-rate
  if (totalWeightLbs > MAX_STANDARD_WEIGHT) {
    return {
      cost: 0,
      label: 'Shipping calculated after order review',
      estimate: 'We will contact you with shipping options',
      needsReview: true,
    }
  }

  // Free standard shipping for orders >= $80
  if (method === 'standard' && subtotal >= FREE_STANDARD_THRESHOLD) {
    return { cost: 0, label: 'Standard Shipping (Free)', estimate: '5-7 business days', needsReview: false }
  }

  const weight = Math.max(totalWeightLbs, 0.1)
  const tier = RATE_TABLE.find(r => weight <= r.maxWeight) || RATE_TABLE[RATE_TABLE.length - 1]
  const cost = method === 'standard' ? tier.standard : tier.express

  if (method === 'standard') {
    return { cost, label: 'Standard Shipping', estimate: '5-7 business days', needsReview: false }
  }
  return { cost, label: 'Express Shipping', estimate: '2-3 business days', needsReview: false }
}

/**
 * Calculate total weight from cart items
 * Returns 0 if any item is missing weight (caller should handle this)
 */
export function calculateTotalWeight(
  items: { quantity: number; weight?: number }[]
): number {
  return items.reduce((sum, item) => {
    if (!item.weight || item.weight <= 0) return sum // skip unweighed items — flagged separately
    return sum + item.weight * item.quantity
  }, 0)
}

export { FREE_STANDARD_THRESHOLD, RESTRICTED_STATES }

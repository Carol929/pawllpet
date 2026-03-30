/**
 * UPS Shipping Rate Table (2026 estimates)
 * Origin: Arlington, VA 22202
 * Includes residential surcharge ($6.50)
 * Based on UPS Small Business rates + average zone pricing
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
const DEFAULT_PRODUCT_WEIGHT = 1   // lb, if product weight not set

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
): { cost: number; label: string; estimate: string } {
  // Free standard shipping for orders >= $50
  if (method === 'standard' && subtotal >= FREE_STANDARD_THRESHOLD) {
    return { cost: 0, label: 'Standard Shipping (Free)', estimate: '5-7 business days' }
  }

  const weight = Math.max(totalWeightLbs, 0.1)
  const tier = RATE_TABLE.find(r => weight <= r.maxWeight) || RATE_TABLE[RATE_TABLE.length - 1]
  const cost = method === 'standard' ? tier.standard : tier.express

  if (method === 'standard') {
    return { cost, label: `Standard Shipping`, estimate: '5-7 business days' }
  }
  return { cost, label: `Express Shipping`, estimate: '2-3 business days' }
}

/**
 * Calculate total weight from cart items
 */
export function calculateTotalWeight(
  items: { quantity: number; weight?: number }[]
): number {
  return items.reduce((sum, item) => sum + (item.weight || DEFAULT_PRODUCT_WEIGHT) * item.quantity, 0)
}

export { FREE_STANDARD_THRESHOLD }

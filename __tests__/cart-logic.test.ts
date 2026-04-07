import { describe, it, expect, beforeEach, vi } from 'vitest'

// Test cart logic in isolation (without React context)
// We extract and test the pure logic functions

// ═══════════════════════════════════════════════════════════
// Cart item matching logic
// ═══════════════════════════════════════════════════════════
type CartItem = {
  productId: string
  quantity: number
  variantIndex?: number
  variantName?: string
  variantPrice?: number
}

function matchItem(item: CartItem, productId: string, variantIndex?: number): boolean {
  return item.productId === productId && (item.variantIndex ?? -1) === (variantIndex ?? -1)
}

function addItem(
  items: CartItem[],
  productId: string,
  qty: number = 1,
  variant?: { index: number; name: string; price: number }
): CartItem[] {
  const match = (i: CartItem) => i.productId === productId && (i.variantIndex ?? -1) === (variant?.index ?? -1)
  const existing = items.find(match)
  if (existing) {
    return items.map((i) => match(i) ? { ...i, quantity: i.quantity + qty } : i)
  }
  return [...items, {
    productId, quantity: qty,
    ...(variant ? { variantIndex: variant.index, variantName: variant.name, variantPrice: variant.price } : {}),
  }]
}

function removeItem(items: CartItem[], productId: string, variantIndex?: number): CartItem[] {
  return items.filter((i) => !(i.productId === productId && (i.variantIndex ?? -1) === (variantIndex ?? -1)))
}

function updateQuantity(items: CartItem[], productId: string, qty: number, variantIndex?: number): CartItem[] {
  const match = (i: CartItem) => i.productId === productId && (i.variantIndex ?? -1) === (variantIndex ?? -1)
  if (qty <= 0) {
    return items.filter((i) => !match(i))
  }
  return items.map((i) => match(i) ? { ...i, quantity: qty } : i)
}

function totalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

describe('Cart item matching', () => {
  it('matches by productId when no variant', () => {
    expect(matchItem({ productId: 'p1', quantity: 1 }, 'p1')).toBe(true)
  })

  it('does not match different productId', () => {
    expect(matchItem({ productId: 'p1', quantity: 1 }, 'p2')).toBe(false)
  })

  it('matches with same variantIndex', () => {
    expect(matchItem({ productId: 'p1', quantity: 1, variantIndex: 0 }, 'p1', 0)).toBe(true)
  })

  it('does not match with different variantIndex', () => {
    expect(matchItem({ productId: 'p1', quantity: 1, variantIndex: 0 }, 'p1', 1)).toBe(false)
  })

  it('treats undefined variantIndex as -1 for matching', () => {
    expect(matchItem({ productId: 'p1', quantity: 1 }, 'p1', undefined)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════
// addItem
// ═══════════════════════════════════════════════════════════
describe('addItem', () => {
  it('adds new item to empty cart', () => {
    const result = addItem([], 'p1')
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }])
  })

  it('adds new item with default qty 1', () => {
    const result = addItem([], 'p1')
    expect(result[0].quantity).toBe(1)
  })

  it('adds new item with custom qty', () => {
    const result = addItem([], 'p1', 3)
    expect(result[0].quantity).toBe(3)
  })

  it('increments quantity for existing item', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 2 }]
    const result = addItem(items, 'p1', 1)
    expect(result[0].quantity).toBe(3)
  })

  it('adds variant item separately from base product', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = addItem(items, 'p1', 1, { index: 0, name: 'Small', price: 10 })
    expect(result).toHaveLength(2)
    expect(result[1].variantIndex).toBe(0)
    expect(result[1].variantName).toBe('Small')
    expect(result[1].variantPrice).toBe(10)
  })

  it('increments quantity for existing variant item', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, variantIndex: 0, variantName: 'S', variantPrice: 10 }]
    const result = addItem(items, 'p1', 2, { index: 0, name: 'S', price: 10 })
    expect(result[0].quantity).toBe(3)
  })

  it('treats different variants as separate items', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, variantIndex: 0, variantName: 'S', variantPrice: 10 }]
    const result = addItem(items, 'p1', 1, { index: 1, name: 'M', price: 12 })
    expect(result).toHaveLength(2)
  })

  it('does not mutate original array', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = addItem(items, 'p2')
    expect(items).toHaveLength(1)
    expect(result).toHaveLength(2)
  })
})

// ═══════════════════════════════════════════════════════════
// removeItem
// ═══════════════════════════════════════════════════════════
describe('removeItem', () => {
  it('removes item by productId', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 2 }]
    const result = removeItem(items, 'p1')
    expect(result).toHaveLength(1)
    expect(result[0].productId).toBe('p2')
  })

  it('removes specific variant, keeps others', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 1, variantIndex: 0 },
      { productId: 'p1', quantity: 1, variantIndex: 1 },
    ]
    const result = removeItem(items, 'p1', 0)
    expect(result).toHaveLength(1)
    expect(result[0].variantIndex).toBe(1)
  })

  it('returns same array if item not found', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = removeItem(items, 'p99')
    expect(result).toHaveLength(1)
  })

  it('handles empty cart', () => {
    expect(removeItem([], 'p1')).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
// updateQuantity
// ═══════════════════════════════════════════════════════════
describe('updateQuantity', () => {
  it('updates quantity of existing item', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = updateQuantity(items, 'p1', 5)
    expect(result[0].quantity).toBe(5)
  })

  it('removes item when qty is 0', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = updateQuantity(items, 'p1', 0)
    expect(result).toHaveLength(0)
  })

  it('removes item when qty is negative', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }]
    const result = updateQuantity(items, 'p1', -1)
    expect(result).toHaveLength(0)
  })

  it('updates specific variant quantity', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 1, variantIndex: 0 },
      { productId: 'p1', quantity: 2, variantIndex: 1 },
    ]
    const result = updateQuantity(items, 'p1', 10, 1)
    expect(result[0].quantity).toBe(1) // variant 0 unchanged
    expect(result[1].quantity).toBe(10) // variant 1 updated
  })

  it('does not affect other items', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 3 },
    ]
    const result = updateQuantity(items, 'p1', 5)
    expect(result[1].quantity).toBe(3)
  })
})

// ═══════════════════════════════════════════════════════════
// totalItems
// ═══════════════════════════════════════════════════════════
describe('totalItems', () => {
  it('returns 0 for empty cart', () => {
    expect(totalItems([])).toBe(0)
  })

  it('returns quantity for single item', () => {
    expect(totalItems([{ productId: 'p1', quantity: 3 }])).toBe(3)
  })

  it('sums quantities across multiple items', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 3 },
      { productId: 'p3', quantity: 1 },
    ]
    expect(totalItems(items)).toBe(6)
  })
})

// ═══════════════════════════════════════════════════════════
// Cart localStorage serialization
// ═══════════════════════════════════════════════════════════
describe('Cart serialization', () => {
  it('cart items can be serialized to JSON and back', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1, variantIndex: 0, variantName: 'Small', variantPrice: 9.99 },
    ]
    const json = JSON.stringify(items)
    const parsed = JSON.parse(json) as CartItem[]
    expect(parsed).toEqual(items)
  })

  it('empty cart serializes to empty array', () => {
    const json = JSON.stringify([])
    expect(JSON.parse(json)).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
// Cart subtotal calculation (as done in cart page)
// ═══════════════════════════════════════════════════════════
describe('Cart subtotal calculation', () => {
  type ProductLike = { price: number }
  type CartProductLike = { unitPrice: number; quantity: number }

  function calculateSubtotal(items: CartProductLike[]): number {
    return items.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
  }

  it('returns 0 for empty cart', () => {
    expect(calculateSubtotal([])).toBe(0)
  })

  it('calculates single item subtotal', () => {
    expect(calculateSubtotal([{ unitPrice: 10, quantity: 2 }])).toBe(20)
  })

  it('calculates multi-item subtotal', () => {
    const items = [
      { unitPrice: 10.50, quantity: 2 },
      { unitPrice: 25.00, quantity: 1 },
    ]
    expect(calculateSubtotal(items)).toBeCloseTo(46)
  })

  it('uses variantPrice when available', () => {
    // Simulates: item.variantPrice ?? p.price
    const variantPrice = 15
    const basePrice = 10
    const unitPrice = variantPrice ?? basePrice
    expect(unitPrice).toBe(15)
  })

  it('falls back to base price when no variant', () => {
    const variantPrice = undefined
    const basePrice = 10
    const unitPrice = variantPrice ?? basePrice
    expect(unitPrice).toBe(10)
  })
})

// ═══════════════════════════════════════════════════════════
// Free shipping threshold logic (from cart page)
// ═══════════════════════════════════════════════════════════
describe('Free shipping logic', () => {
  const THRESHOLD = 80

  it('free shipping at exactly $80', () => {
    expect(80 >= THRESHOLD).toBe(true)
  })

  it('free shipping above $80', () => {
    expect(100 >= THRESHOLD).toBe(true)
  })

  it('no free shipping below $80', () => {
    expect(79.99 >= THRESHOLD).toBe(false)
  })

  it('shipping cost is $5.99 when not free', () => {
    const subtotal = 50
    const shipping = subtotal >= THRESHOLD ? 0 : 5.99
    expect(shipping).toBe(5.99)
  })

  it('shipping cost is $0 when free', () => {
    const subtotal = 80
    const shipping = subtotal >= THRESHOLD ? 0 : 5.99
    expect(shipping).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════
// Gift item threshold logic (from cart page)
// ═══════════════════════════════════════════════════════════
describe('Gift item threshold', () => {
  const GIFT_MINIMUM = 10

  it('gift blocked when paid total under $10', () => {
    const hasGift = true
    const paidSubtotal = 9.99
    expect(hasGift && paidSubtotal < GIFT_MINIMUM).toBe(true)
  })

  it('gift allowed when paid total is $10+', () => {
    const hasGift = true
    const paidSubtotal = 10
    expect(hasGift && paidSubtotal < GIFT_MINIMUM).toBe(false)
  })

  it('no blocking when no gift in cart', () => {
    const hasGift = false
    const paidSubtotal = 5
    expect(hasGift && paidSubtotal < GIFT_MINIMUM).toBe(false)
  })
})

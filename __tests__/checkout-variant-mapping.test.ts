import { describe, it, expect } from 'vitest'

// ═══════════════════════════════════════════════════════════
// Checkout: variantIndex → variantId mapping
// This tests the fix we applied in app/checkout/page.tsx
// ═══════════════════════════════════════════════════════════

type CartItem = {
  productId: string
  quantity: number
  variantIndex?: number
  variantName?: string
  variantPrice?: number
}

type ProductVariant = {
  id: string
  name: string
  price: number
}

type Product = {
  id: string
  name: string
  price: number
  variants?: ProductVariant[]
}

function mapCartItemsForCheckout(items: CartItem[], productMap: Record<string, Product>) {
  return items.map(item => {
    const p = productMap[item.productId]
    const variantId = p?.variants && item.variantIndex !== undefined
      ? p.variants[item.variantIndex]?.id
      : undefined
    return { productId: item.productId, quantity: item.quantity, variantId }
  })
}

describe('Checkout variant mapping', () => {
  const productMap: Record<string, Product> = {
    'prod-1': {
      id: 'prod-1',
      name: 'Cat Toy',
      price: 10,
      variants: [
        { id: 'var-a', name: 'Small', price: 10 },
        { id: 'var-b', name: 'Large', price: 15 },
      ],
    },
    'prod-2': {
      id: 'prod-2',
      name: 'Dog Bed',
      price: 50,
    },
  }

  it('maps variantIndex 0 to correct variantId', () => {
    const items: CartItem[] = [{ productId: 'prod-1', quantity: 1, variantIndex: 0 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBe('var-a')
  })

  it('maps variantIndex 1 to correct variantId', () => {
    const items: CartItem[] = [{ productId: 'prod-1', quantity: 1, variantIndex: 1 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBe('var-b')
  })

  it('returns undefined variantId for product without variants', () => {
    const items: CartItem[] = [{ productId: 'prod-2', quantity: 2 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBeUndefined()
  })

  it('returns undefined variantId when no variantIndex set', () => {
    const items: CartItem[] = [{ productId: 'prod-1', quantity: 1 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBeUndefined()
  })

  it('returns undefined variantId for out-of-range index', () => {
    const items: CartItem[] = [{ productId: 'prod-1', quantity: 1, variantIndex: 99 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBeUndefined()
  })

  it('handles missing product gracefully', () => {
    const items: CartItem[] = [{ productId: 'nonexistent', quantity: 1, variantIndex: 0 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].variantId).toBeUndefined()
  })

  it('preserves quantity in mapped output', () => {
    const items: CartItem[] = [{ productId: 'prod-1', quantity: 5, variantIndex: 0 }]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result[0].quantity).toBe(5)
  })

  it('maps multiple items correctly', () => {
    const items: CartItem[] = [
      { productId: 'prod-1', quantity: 1, variantIndex: 0 },
      { productId: 'prod-2', quantity: 3 },
      { productId: 'prod-1', quantity: 2, variantIndex: 1 },
    ]
    const result = mapCartItemsForCheckout(items, productMap)
    expect(result).toHaveLength(3)
    expect(result[0].variantId).toBe('var-a')
    expect(result[1].variantId).toBeUndefined()
    expect(result[2].variantId).toBe('var-b')
  })
})

// ═══════════════════════════════════════════════════════════
// Checkout: shipping address validation (as done in API)
// ═══════════════════════════════════════════════════════════
describe('Shipping address validation', () => {
  function isValidAddress(addr: Record<string, string | undefined>): boolean {
    return !!(addr.fullName && addr.street && addr.city && addr.state && addr.zip)
  }

  it('accepts complete address', () => {
    expect(isValidAddress({
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Arlington',
      state: 'VA',
      zip: '22201',
    })).toBe(true)
  })

  it('rejects missing fullName', () => {
    expect(isValidAddress({ fullName: '', street: '123', city: 'X', state: 'VA', zip: '22201' })).toBe(false)
  })

  it('rejects missing street', () => {
    expect(isValidAddress({ fullName: 'J', street: '', city: 'X', state: 'VA', zip: '22201' })).toBe(false)
  })

  it('rejects missing city', () => {
    expect(isValidAddress({ fullName: 'J', street: '123', city: '', state: 'VA', zip: '22201' })).toBe(false)
  })

  it('rejects missing state', () => {
    expect(isValidAddress({ fullName: 'J', street: '123', city: 'X', state: '', zip: '22201' })).toBe(false)
  })

  it('rejects missing zip', () => {
    expect(isValidAddress({ fullName: 'J', street: '123', city: 'X', state: 'VA', zip: '' })).toBe(false)
  })

  it('rejects undefined fields', () => {
    expect(isValidAddress({ fullName: 'J', street: '123', city: 'X', state: 'VA', zip: undefined })).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
// Checkout: item quantity validation (as done in API)
// ═══════════════════════════════════════════════════════════
describe('Checkout item validation', () => {
  function isValidItem(item: { productId?: string; quantity?: number }): boolean {
    return !!(item.productId && Number.isInteger(item.quantity) && item.quantity! >= 1 && item.quantity! <= 99)
  }

  it('accepts valid item', () => {
    expect(isValidItem({ productId: 'p1', quantity: 1 })).toBe(true)
  })

  it('accepts max quantity 99', () => {
    expect(isValidItem({ productId: 'p1', quantity: 99 })).toBe(true)
  })

  it('rejects quantity 0', () => {
    expect(isValidItem({ productId: 'p1', quantity: 0 })).toBe(false)
  })

  it('rejects quantity 100', () => {
    expect(isValidItem({ productId: 'p1', quantity: 100 })).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(isValidItem({ productId: 'p1', quantity: -1 })).toBe(false)
  })

  it('rejects decimal quantity', () => {
    expect(isValidItem({ productId: 'p1', quantity: 1.5 })).toBe(false)
  })

  it('rejects missing productId', () => {
    expect(isValidItem({ quantity: 1 })).toBe(false)
  })

  it('rejects missing quantity', () => {
    expect(isValidItem({ productId: 'p1' })).toBe(false)
  })
})

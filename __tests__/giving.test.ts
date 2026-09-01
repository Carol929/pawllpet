import { describe, it, expect } from 'vitest'
import {
  DONATION_RATE,
  PLEDGE_ELIGIBLE_STATUSES,
  orderPledgeBaseCents,
  orderPledgeCents,
  calcPledgeCents,
  formatUsd,
  donationInputSchema,
} from '../lib/giving'

describe('pledge eligibility', () => {
  it('counts only paid-and-not-cancelled statuses', () => {
    expect(PLEDGE_ELIGIBLE_STATUSES).toContain('paid')
    expect(PLEDGE_ELIGIBLE_STATUSES).toContain('processing')
    expect(PLEDGE_ELIGIBLE_STATUSES).toContain('shipped')
    expect(PLEDGE_ELIGIBLE_STATUSES).toContain('delivered')
    expect(PLEDGE_ELIGIBLE_STATUSES).toContain('cancellation_requested')
    expect(PLEDGE_ELIGIBLE_STATUSES).not.toContain('pending')
    expect(PLEDGE_ELIGIBLE_STATUSES).not.toContain('cancelled')
  })

  it('rate is 1%', () => {
    expect(DONATION_RATE).toBe(0.01)
  })
})

describe('orderPledgeBaseCents', () => {
  it('converts the merchandise subtotal to cents', () => {
    expect(orderPledgeBaseCents({ subtotal: 50, discountAmount: 0 })).toBe(5000)
    expect(orderPledgeBaseCents({ subtotal: 19.99, discountAmount: 0 })).toBe(1999)
  })

  it('subtracts discounts before pledging', () => {
    expect(orderPledgeBaseCents({ subtotal: 50, discountAmount: 10 })).toBe(4000)
  })

  it('never goes negative when a discount exceeds the subtotal', () => {
    expect(orderPledgeBaseCents({ subtotal: 10, discountAmount: 25 })).toBe(0)
  })

  it('treats a missing discount as zero', () => {
    expect(
      orderPledgeBaseCents({ subtotal: 30, discountAmount: undefined as unknown as number }),
    ).toBe(3000)
  })
})

describe('orderPledgeCents', () => {
  it('is 1% rounded to the nearest cent', () => {
    expect(orderPledgeCents({ subtotal: 100, discountAmount: 0 })).toBe(100) // $100 → $1.00
    expect(orderPledgeCents({ subtotal: 50, discountAmount: 0 })).toBe(50) // $50 → $0.50
    expect(orderPledgeCents({ subtotal: 49.99, discountAmount: 0 })).toBe(50) // 49.99¢ rounds up
    expect(orderPledgeCents({ subtotal: 0.49, discountAmount: 0 })).toBe(0) // 0.49¢ rounds down
  })
})

describe('calcPledgeCents', () => {
  it('returns 0 for no orders', () => {
    expect(calcPledgeCents([])).toBe(0)
  })

  it('sums per-order pledges', () => {
    const orders = [
      { subtotal: 100, discountAmount: 0 }, // 100¢
      { subtotal: 50, discountAmount: 0 }, // 50¢
      { subtotal: 24.99, discountAmount: 5 }, // 1999¢ base → 20¢
    ]
    expect(calcPledgeCents(orders)).toBe(170)
  })

  it('does not accumulate float drift across many orders', () => {
    const orders = Array.from({ length: 1000 }, () => ({ subtotal: 10.1, discountAmount: 0 }))
    expect(calcPledgeCents(orders)).toBe(10 * 1000) // each order: 1010¢ → 10.1¢ → 10¢
  })
})

describe('formatUsd', () => {
  it('formats cents as US dollars', () => {
    expect(formatUsd(123456)).toBe('$1,234.56')
    expect(formatUsd(0)).toBe('$0.00')
  })
})

describe('donationInputSchema', () => {
  const valid = {
    organization: 'Homeward Trails Animal Rescue',
    amount: 120.5,
    donatedAt: '2026-08-01',
    note: 'Quarterly donation',
    link: 'https://www.homewardtrails.org',
    imageUrl: '',
  }

  it('accepts a valid record and nulls empty optionals', () => {
    const parsed = donationInputSchema.parse(valid)
    expect(parsed.organization).toBe('Homeward Trails Animal Rescue')
    expect(parsed.amount).toBe(120.5)
    expect(parsed.donatedAt).toBeInstanceOf(Date)
    expect(parsed.imageUrl).toBeNull()
    expect(parsed.link).toBe('https://www.homewardtrails.org')
  })

  it('rejects a zero or negative amount', () => {
    expect(donationInputSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(donationInputSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })

  it('rejects a blank organization', () => {
    expect(donationInputSchema.safeParse({ ...valid, organization: '  ' }).success).toBe(false)
  })

  it('rejects a non-http link', () => {
    expect(donationInputSchema.safeParse({ ...valid, link: 'javascript:alert(1)' }).success).toBe(
      false,
    )
  })

  it('rejects an unparseable date', () => {
    expect(donationInputSchema.safeParse({ ...valid, donatedAt: 'not-a-date' }).success).toBe(false)
  })

  it('accepts a minimal record without optional fields', () => {
    const parsed = donationInputSchema.parse({
      organization: 'Shelter',
      amount: 10,
      donatedAt: '2026-08-29',
    })
    expect(parsed.note ?? null).toBeNull()
    expect(parsed.link ?? null).toBeNull()
  })

  it('partial() lets PATCH update a single field without wiping the others', () => {
    const parsed = donationInputSchema.partial().parse({ amount: 99 })
    expect(parsed.amount).toBe(99)
    expect('organization' in parsed).toBe(false)
    // Omitted optionals must NOT come back as null — that would clear them in the DB
    expect('note' in parsed).toBe(false)
    expect('imageUrl' in parsed).toBe(false)
  })

  it('partial() with an explicit empty string clears a field to null', () => {
    const parsed = donationInputSchema.partial().parse({ note: '' })
    expect(parsed.note).toBeNull()
  })
})

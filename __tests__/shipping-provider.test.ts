/**
 * Tests for the shipping strategy resolver.
 *
 * We mock the Shippo client at the module boundary so we exercise the actual
 * provider.ts logic — flag handling, response normalization, fallback on
 * Shippo errors, and legacy rate computation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetShippoRates = vi.fn()
const mockGetShippoRateById = vi.fn()
const mockPurchaseShippoLabel = vi.fn()

vi.mock('@/lib/shipping/shippo-client', () => ({
  getShippoRates: (...args: unknown[]) => mockGetShippoRates(...args),
  getShippoRateById: (...args: unknown[]) => mockGetShippoRateById(...args),
  purchaseShippoLabel: (...args: unknown[]) => mockPurchaseShippoLabel(...args),
  getCarrierTrackingUrl: (carrier: string, t: string) => `https://example.com/${carrier}/${t}`,
}))

// Import AFTER mocking
import {
  getActiveProvider,
  getShippingOptions,
  purchaseLabel,
  validateRateId,
} from '@/lib/shipping/provider'

const baseAddress = {
  name: 'Jane Doe',
  street1: '742 Evergreen Ter',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
}

beforeEach(() => {
  mockGetShippoRates.mockReset()
  mockGetShippoRateById.mockReset()
  mockPurchaseShippoLabel.mockReset()
})

afterEach(() => {
  delete process.env.SHIPPING_PROVIDER
  delete process.env.SHIPPO_API_KEY
})

describe('getActiveProvider', () => {
  it('returns legacy by default', () => {
    expect(getActiveProvider()).toBe('legacy')
  })

  it('returns shippo only when both flag and API key are set', () => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    expect(getActiveProvider()).toBe('legacy') // no key
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
    expect(getActiveProvider()).toBe('shippo')
  })

  it('falls back to legacy for unknown flag values', () => {
    process.env.SHIPPING_PROVIDER = 'easypost'
    process.env.SHIPPO_API_KEY = 'k'
    expect(getActiveProvider()).toBe('legacy')
  })
})

describe('getShippingOptions — legacy mode', () => {
  it('returns standard and express options from the legacy table', async () => {
    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 2 }],
      subtotal: 30,
    })

    expect(result.usedProvider).toBe('legacy')
    expect(result.options.length).toBeGreaterThanOrEqual(1)
    expect(result.options[0].id).toMatch(/^legacy:/)
    expect(result.options.every((o) => o.provider === 'legacy')).toBe(true)
    // Standard at 2 lbs is $9.99 per the table
    const standard = result.options.find((o) => o.service === 'Standard')
    expect(standard?.amount).toBe(9.99)
  })

  it('applies free standard shipping above the $80 threshold', async () => {
    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 2 }],
      subtotal: 100,
    })
    const standard = result.options.find((o) => o.service === 'Standard')
    expect(standard?.amount).toBe(0)
  })

  it('rejects AK shipping with a clear error', async () => {
    await expect(
      getShippingOptions({
        to: { ...baseAddress, state: 'AK' },
        items: [{ productId: 'p1', quantity: 1, weight: 2 }],
        subtotal: 30,
      }),
    ).rejects.toThrow(/Alaska|HI|not available/)
  })
})

describe('getShippingOptions — shippo mode', () => {
  beforeEach(() => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
  })

  it('returns Shippo rates sorted cheapest-first', async () => {
    mockGetShippoRates.mockResolvedValue([
      {
        id: 'r_ups',
        provider: 'shippo',
        carrier: 'ups',
        service: 'Ground',
        displayName: 'UPS Ground',
        amount: 12.5,
        currency: 'USD',
      },
      {
        id: 'r_usps',
        provider: 'shippo',
        carrier: 'usps',
        service: 'Priority',
        displayName: 'USPS Priority',
        amount: 7.25,
        currency: 'USD',
      },
    ])

    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 1, length: 8, width: 6, height: 4 }],
      subtotal: 30,
    })

    expect(result.usedProvider).toBe('shippo')
    expect(result.options.map((o) => o.id)).toEqual(['r_usps', 'r_ups'])
    expect(mockGetShippoRates).toHaveBeenCalledTimes(1)
  })

  it('falls back to legacy when Shippo throws (network error, bad key, etc)', async () => {
    mockGetShippoRates.mockRejectedValue(new Error('connection refused'))

    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 2 }],
      subtotal: 30,
    })

    expect(result.usedProvider).toBe('legacy')
    expect(result.fallbackReason).toMatch(/connection refused/)
    expect(result.options.every((o) => o.provider === 'legacy')).toBe(true)
  })

  it('falls back to legacy when Shippo returns no rates (empty array case)', async () => {
    mockGetShippoRates.mockRejectedValue(new Error('Shippo returned no rates: NO_SERVICE'))

    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 2 }],
      subtotal: 30,
    })

    expect(result.usedProvider).toBe('legacy')
  })
})

describe('purchaseLabel', () => {
  it('is a no-op for legacy rate IDs', async () => {
    expect(await purchaseLabel('legacy:standard')).toBeNull()
    expect(await purchaseLabel('legacy:express')).toBeNull()
    expect(mockPurchaseShippoLabel).not.toHaveBeenCalled()
  })

  it('returns null for empty rate ID', async () => {
    expect(await purchaseLabel('')).toBeNull()
  })

  it('delegates to Shippo for Shippo rate IDs', async () => {
    mockPurchaseShippoLabel.mockResolvedValue({
      provider: 'shippo',
      trackingNumber: 'TRK1',
      labelUrl: 'https://example.com/label.pdf',
      transactionId: 'tx_1',
      rateId: 'rate_abc',
      carrier: '',
      service: '',
    })

    const result = await purchaseLabel('rate_abc')
    expect(mockPurchaseShippoLabel).toHaveBeenCalledWith('rate_abc')
    expect(result?.trackingNumber).toBe('TRK1')
  })
})

describe('validateRateId', () => {
  it('returns the matching legacy option for a "legacy:*" id', async () => {
    const r = await validateRateId({
      rateId: 'legacy:standard',
      items: [{ productId: 'p1', quantity: 1, weight: 2 }],
      subtotal: 30,
    })
    expect(r?.id).toBe('legacy:standard')
    expect(r?.amount).toBe(9.99)
  })

  it('returns null for a legacy ID that does not match any option (heavy order)', async () => {
    const r = await validateRateId({
      rateId: 'legacy:standard',
      items: [{ productId: 'p1', quantity: 1, weight: 200 }], // over 50 lb cap
      subtotal: 30,
    })
    expect(r).toBeNull()
  })

  it('re-quotes Shippo for the real cart+destination and matches the selection', async () => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
    // Fresh quote returns a DIFFERENT rate id than the client sent (Shippo ids
    // are per-shipment). We must still match on carrier+service and use the
    // fresh amount — never the client's number.
    mockGetShippoRates.mockResolvedValue([
      { id: 'rate_fresh', provider: 'shippo', carrier: 'usps', service: 'Priority', displayName: 'USPS Priority', amount: 8.5, currency: 'USD' },
    ])

    const r = await validateRateId({
      rateId: 'rate_stale_from_client',
      to: baseAddress,
      carrier: 'usps',
      service: 'Priority',
      items: [{ productId: 'p1', quantity: 1, weight: 1 }],
      subtotal: 30,
    })

    expect(mockGetShippoRates).toHaveBeenCalledTimes(1)
    expect(mockGetShippoRateById).not.toHaveBeenCalled()
    expect(r?.id).toBe('rate_fresh')
    expect(r?.amount).toBe(8.5)
  })

  it('returns null when the selected carrier/service is not in the fresh quote', async () => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
    mockGetShippoRates.mockResolvedValue([
      { id: 'rate_fresh', provider: 'shippo', carrier: 'usps', service: 'Ground Advantage', displayName: 'USPS GA', amount: 6.0, currency: 'USD' },
    ])

    const r = await validateRateId({
      rateId: 'rate_stale',
      to: baseAddress,
      carrier: 'fedex',
      service: 'Priority Overnight',
      items: [{ productId: 'p1', quantity: 1, weight: 1 }],
      subtotal: 30,
    })
    expect(r).toBeNull()
  })

  it('returns null for a Shippo rate id when no destination is supplied', async () => {
    // Without the destination we can't re-quote, so we cannot safely price it.
    const r = await validateRateId({
      rateId: 'rate_xyz',
      items: [{ productId: 'p1', quantity: 1, weight: 1 }],
      subtotal: 30,
    })
    expect(r).toBeNull()
  })

  it('returns null when the Shippo re-quote fails (fallback options do not match)', async () => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
    mockGetShippoRates.mockRejectedValue(new Error('rate expired'))

    const r = await validateRateId({
      rateId: 'rate_expired',
      to: baseAddress,
      carrier: 'usps',
      service: 'Priority',
      items: [{ productId: 'p1', quantity: 1, weight: 1 }],
      subtotal: 30,
    })
    expect(r).toBeNull()
  })

  it('returns null for empty rate ID', async () => {
    expect(
      await validateRateId({
        rateId: '',
        items: [{ productId: 'p1', quantity: 1, weight: 1 }],
        subtotal: 30,
      }),
    ).toBeNull()
  })
})

describe('getShippingOptions — free shipping under Shippo', () => {
  beforeEach(() => {
    process.env.SHIPPING_PROVIDER = 'shippo'
    process.env.SHIPPO_API_KEY = 'shippo_test_key'
  })

  it('zeroes the cheapest option at/above the $80 threshold', async () => {
    mockGetShippoRates.mockResolvedValue([
      { id: 'r_usps', provider: 'shippo', carrier: 'usps', service: 'Priority', displayName: 'USPS Priority', amount: 7.25, currency: 'USD' },
      { id: 'r_ups', provider: 'shippo', carrier: 'ups', service: 'Ground', displayName: 'UPS Ground', amount: 12.5, currency: 'USD' },
    ])

    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 1, length: 8, width: 6, height: 4 }],
      subtotal: 100,
    })

    // cheapest is free, the pricier option is unchanged
    expect(result.options[0].amount).toBe(0)
    expect(result.options[0].displayName).toMatch(/free/i)
    expect(result.options[1].amount).toBe(12.5)
  })

  it('leaves all options paid below the threshold', async () => {
    mockGetShippoRates.mockResolvedValue([
      { id: 'r_usps', provider: 'shippo', carrier: 'usps', service: 'Priority', displayName: 'USPS Priority', amount: 7.25, currency: 'USD' },
    ])

    const result = await getShippingOptions({
      to: baseAddress,
      items: [{ productId: 'p1', quantity: 1, weight: 1 }],
      subtotal: 50,
    })
    expect(result.options[0].amount).toBe(7.25)
  })
})

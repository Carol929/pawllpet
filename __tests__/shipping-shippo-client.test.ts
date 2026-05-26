/**
 * Tests for the Shippo REST client.
 *
 * Mocks global `fetch` so we never hit the real Shippo API. Each test asserts
 * BOTH the request shape sent to Shippo and the parsing of the response.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getCarrierTrackingUrl,
  getShippoRateById,
  getShippoRates,
  purchaseShippoLabel,
} from '@/lib/shipping/shippo-client'

const SHIPPO_API_BASE = 'https://api.goshippo.com'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  process.env.SHIPPO_API_KEY = 'shippo_test_fake_key'
  process.env.SHIPPO_ORIGIN_STREET = '1500 Crystal Dr'
  process.env.SHIPPO_ORIGIN_CITY = 'Arlington'
  process.env.SHIPPO_ORIGIN_STATE = 'VA'
  process.env.SHIPPO_ORIGIN_ZIP = '22202'
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  delete process.env.SHIPPO_API_KEY
  delete process.env.SHIPPO_ORIGIN_STREET
  delete process.env.SHIPPO_ORIGIN_CITY
  delete process.env.SHIPPO_ORIGIN_STATE
  delete process.env.SHIPPO_ORIGIN_ZIP
  delete process.env.SHIPPO_FROM_ADDRESS_ID
})

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

describe('getShippoRates', () => {
  it('sends a well-formed shipment request and normalizes the response', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'shp_123',
        status: 'SUCCESS',
        rates: [
          {
            object_id: 'rate_usps_priority',
            provider: 'USPS',
            servicelevel: { name: 'Priority Mail', token: 'usps_priority' },
            amount: '8.45',
            currency: 'USD',
            estimated_days: 3,
          },
          {
            object_id: 'rate_ups_ground',
            provider: 'UPS',
            servicelevel: { name: 'Ground', token: 'ups_ground' },
            amount: '12.30',
            currency: 'USD',
            estimated_days: 5,
          },
        ],
      }),
    )

    const rates = await getShippoRates(
      {
        name: 'Jane Doe',
        street1: '742 Evergreen Ter',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
      { weightLb: 2.5, lengthIn: 10, widthIn: 6, heightIn: 4 },
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${SHIPPO_API_BASE}/shipments/`)
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('ShippoToken shippo_test_fake_key')

    const body = JSON.parse(init.body as string)
    expect(body.address_from.zip).toBe('22202')
    expect(body.address_to.zip).toBe('62701')
    expect(body.parcels[0]).toEqual({
      length: '10',
      width: '6',
      height: '4',
      distance_unit: 'in',
      weight: '2.5',
      mass_unit: 'lb',
    })
    expect(body.async).toBe(false)

    expect(rates).toHaveLength(2)
    expect(rates[0]).toMatchObject({
      id: 'rate_usps_priority',
      provider: 'shippo',
      carrier: 'usps',
      service: 'Priority Mail',
      amount: 8.45,
      currency: 'USD',
    })
    expect(rates[0].estimatedDays).toEqual({ min: 3, max: 4 })
    expect(rates[1].carrier).toBe('ups')
  })

  it('throws when Shippo returns 0 rates', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'shp_456',
        status: 'SUCCESS',
        rates: [],
        messages: [{ source: 'usps', code: 'NO_SERVICE', text: 'No services available' }],
      }),
    )

    await expect(
      getShippoRates(
        { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
        { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
      ),
    ).rejects.toThrow(/no rates/i)
  })

  it('throws when Shippo returns a non-2xx HTTP status', async () => {
    fetchMock.mockReturnValueOnce(jsonResponse({ error: 'unauthorized' }, 401))

    await expect(
      getShippoRates(
        { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
        { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
      ),
    ).rejects.toThrow(/401/)
  })

  it('throws when SHIPPO_API_KEY is missing', async () => {
    delete process.env.SHIPPO_API_KEY

    await expect(
      getShippoRates(
        { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
        { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
      ),
    ).rejects.toThrow(/SHIPPO_API_KEY/)
  })

  it('passes SHIPPO_FROM_ADDRESS_ID as a string when set (preferred over inline)', async () => {
    process.env.SHIPPO_FROM_ADDRESS_ID = 'adr_test_default_sender'
    // Inline env vars are still set but should be ignored when ID is present
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'shp_789',
        status: 'SUCCESS',
        rates: [
          {
            object_id: 'rate_x',
            provider: 'USPS',
            servicelevel: { name: 'Priority', token: 'usps_priority' },
            amount: '7.00',
            currency: 'USD',
          },
        ],
      }),
    )

    await getShippoRates(
      { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
      { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
    )

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.address_from).toBe('adr_test_default_sender')
    expect(typeof body.address_from).toBe('string')
  })

  it('falls back to inline address when SHIPPO_FROM_ADDRESS_ID is not set', async () => {
    delete process.env.SHIPPO_FROM_ADDRESS_ID
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'shp_inline',
        status: 'SUCCESS',
        rates: [
          {
            object_id: 'rate_x',
            provider: 'USPS',
            servicelevel: { name: 'Priority', token: 'usps_priority' },
            amount: '7.00',
            currency: 'USD',
          },
        ],
      }),
    )

    await getShippoRates(
      { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
      { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
    )

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(typeof body.address_from).toBe('object')
    expect(body.address_from.street1).toBe('1500 Crystal Dr')
  })

  it('throws when neither SHIPPO_FROM_ADDRESS_ID nor SHIPPO_ORIGIN_STREET is set', async () => {
    delete process.env.SHIPPO_FROM_ADDRESS_ID
    delete process.env.SHIPPO_ORIGIN_STREET

    await expect(
      getShippoRates(
        { name: 'X', street1: 'Y', city: 'Z', state: 'CA', zip: '90001' },
        { weightLb: 1, lengthIn: 5, widthIn: 5, heightIn: 5 },
      ),
    ).rejects.toThrow(/SHIPPO_FROM_ADDRESS_ID|SHIPPO_ORIGIN_STREET/)
  })
})

describe('getShippoRateById', () => {
  it('GETs the rate by ID and normalizes the response', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'rate_abc',
        provider: 'FedEx',
        servicelevel: { name: 'Ground', token: 'fedex_ground' },
        amount: '15.75',
        currency: 'USD',
        estimated_days: 4,
      }),
    )

    const rate = await getShippoRateById('rate_abc')

    expect(fetchMock).toHaveBeenCalledWith(
      `${SHIPPO_API_BASE}/rates/rate_abc/`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'ShippoToken shippo_test_fake_key' }) }),
    )
    expect(rate).toMatchObject({
      id: 'rate_abc',
      provider: 'shippo',
      carrier: 'fedex',
      amount: 15.75,
    })
  })
})

describe('purchaseShippoLabel', () => {
  it('POSTs a transaction and returns parsed label info on success', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'tx_xyz',
        status: 'SUCCESS',
        tracking_number: '9405511899223197428490',
        label_url: 'https://shippo.s3.amazonaws.com/labels/tx_xyz.pdf',
        rate: 'rate_usps_priority',
      }),
    )

    const result = await purchaseShippoLabel('rate_usps_priority')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${SHIPPO_API_BASE}/transactions/`)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      rate: 'rate_usps_priority',
      label_file_type: 'PDF',
      async: false,
    })

    expect(result).toMatchObject({
      provider: 'shippo',
      trackingNumber: '9405511899223197428490',
      labelUrl: 'https://shippo.s3.amazonaws.com/labels/tx_xyz.pdf',
      transactionId: 'tx_xyz',
      rateId: 'rate_usps_priority',
    })
  })

  it('throws when transaction status is not SUCCESS', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        object_id: 'tx_fail',
        status: 'ERROR',
        tracking_number: '',
        label_url: '',
        rate: 'rate_x',
        messages: [{ source: 'usps', code: 'INVALID', text: 'address verification failed' }],
      }),
    )

    await expect(purchaseShippoLabel('rate_x')).rejects.toThrow(/address verification/i)
  })
})

describe('getCarrierTrackingUrl', () => {
  it('builds the right URL for each known carrier', () => {
    expect(getCarrierTrackingUrl('usps', '94055118')).toContain('usps.com')
    expect(getCarrierTrackingUrl('USPS', '94055118')).toContain('usps.com')
    expect(getCarrierTrackingUrl('ups', '1Z999AA1')).toContain('ups.com')
    expect(getCarrierTrackingUrl('fedex', '7896')).toContain('fedex.com')
    expect(getCarrierTrackingUrl('dhl', 'JD0')).toContain('dhl.com')
  })

  it('falls back to Shippo tracking for unknown carriers', () => {
    const url = getCarrierTrackingUrl('weirdcarrier', 'TRK123')
    expect(url).toContain('goshippo.com/track')
    expect(url).toContain('TRK123')
  })

  it('URL-encodes the tracking number', () => {
    const url = getCarrierTrackingUrl('usps', 'foo bar/baz')
    expect(url).toContain('foo%20bar%2Fbaz')
  })
})

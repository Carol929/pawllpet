// @vitest-environment node
/**
 * Abuse guards on the two endpoints anyone can call without logging in:
 * POST /api/shipping/rates and POST /api/newsletter.
 *
 * The handlers are exercised directly; the database, the shipping provider and
 * the email sender are mocked at the module boundary.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindMany = vi.fn()
const mockGetShippingOptions = vi.fn()
const mockSendNewsletterWelcomeEmail = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: { product: { findMany: (...args: unknown[]) => mockFindMany(...args) } },
}))

vi.mock('@/lib/shipping', () => ({
  getShippingOptions: (...args: unknown[]) => mockGetShippingOptions(...args),
  hasUnweighedItems: (items: { weight?: number }[]) => items.some((i) => !i.weight),
  isFreeShippingSlug: () => false,
  isPOBox: () => false,
  isShippingEligible: () => ({ eligible: true }),
}))

vi.mock('@/lib/email', () => ({
  sendNewsletterWelcomeEmail: (...args: unknown[]) => mockSendNewsletterWelcomeEmail(...args),
}))

// Import AFTER mocking
import { POST as ratesPOST } from '@/app/api/shipping/rates/route'
import { POST as newsletterPOST } from '@/app/api/newsletter/route'

// The rate limiter keeps module-level counters, so every test uses its own IP.
let ipCounter = 0
const freshIp = () => `203.0.113.${++ipCounter}`

function post(path: string, body: unknown, ip: string): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const address = { name: 'Jane Doe', street1: '742 Evergreen Ter', city: 'Springfield', state: 'IL', zip: '62701' }
const item = { productId: 'prod_1', quantity: 1 }
const ratesBody = (items: unknown) => ({ to: address, items, subtotal: 9.99 })

beforeEach(() => {
  mockFindMany.mockReset()
  mockGetShippingOptions.mockReset()
  mockSendNewsletterWelcomeEmail.mockReset()
  mockFindMany.mockResolvedValue([
    { id: 'prod_1', slug: 'toy', weight: 0.5, length: null, width: null, height: null },
  ])
  mockGetShippingOptions.mockResolvedValue({
    options: [{ id: 'rate_1', provider: 'shippo', carrier: 'usps', service: 'Ground Advantage', displayName: 'USPS Ground Advantage', amount: 6.5, currency: 'USD' }],
    usedProvider: 'shippo',
  })
})

describe('POST /api/shipping/rates', () => {
  it('quotes a normal cart', async () => {
    const res = await ratesPOST(post('/api/shipping/rates', ratesBody([item]), freshIp()))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.provider).toBe('shippo')
    expect(json.options).toHaveLength(1)
  })

  it('accepts a cart at the 50-line limit', async () => {
    const res = await ratesPOST(post('/api/shipping/rates', ratesBody(Array(50).fill(item)), freshIp()))
    expect(res.status).toBe(200)
  })

  // The "too many items" message only comes from the size check that runs
  // ahead of schema validation, so asserting on it proves the array never
  // reached zod (which would answer with the generic invalid-request message).
  it('rejects a cart over the limit before validating it or touching the database', async () => {
    const res = await ratesPOST(post('/api/shipping/rates', ratesBody(Array(51).fill(item)), freshIp()))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Too many items in this request.')
    expect(mockFindMany).not.toHaveBeenCalled()
    expect(mockGetShippingOptions).not.toHaveBeenCalled()
  })

  it('rejects a huge array of junk with a short error, not a dump of every issue', async () => {
    // Left to zod, 200k invalid elements yield ~400k issues and a ~70 MB
    // error message.
    const res = await ratesPOST(post('/api/shipping/rates', ratesBody(Array(200_000).fill({})), freshIp()))
    expect(res.status).toBe(400)
    const text = await res.text()
    expect(text.length).toBeLessThan(200)
    expect(JSON.parse(text).error).toBe('Too many items in this request.')
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it('does not echo validation details for an ordinary invalid body', async () => {
    const res = await ratesPOST(post('/api/shipping/rates', { to: { ...address, zip: '1' }, items: [item], subtotal: 9.99 }, freshIp()))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid shipping request. Please check your address and try again.')
  })

  it.each([
    ['items is not an array', ratesBody('nope')],
    ['items is missing', { to: address, subtotal: 9.99 }],
    ['body is null', null],
    ['body is a bare array', [item]],
  ])('returns 400 when %s', async (_label, body) => {
    const res = await ratesPOST(post('/api/shipping/rates', body, freshIp()))
    expect(res.status).toBe(400)
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON', async () => {
    const res = await ratesPOST(post('/api/shipping/rates', '{"to":', freshIp()))
    expect(res.status).toBe(400)
  })

  it('throttles one IP after 30 calls in a minute and leaves other IPs alone', async () => {
    const ip = freshIp()
    for (let i = 0; i < 30; i++) {
      const ok = await ratesPOST(post('/api/shipping/rates', ratesBody([item]), ip))
      expect(ok.status).toBe(200)
    }
    const blocked = await ratesPOST(post('/api/shipping/rates', ratesBody([item]), ip))
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0)

    const other = await ratesPOST(post('/api/shipping/rates', ratesBody([item]), freshIp()))
    expect(other.status).toBe(200)
  })
})

describe('POST /api/newsletter', () => {
  it('sends the welcome email to the lower-cased address', async () => {
    const res = await newsletterPOST(post('/api/newsletter', { email: 'New.Subscriber@Example.com' }, freshIp()))
    expect(res.status).toBe(200)
    expect(mockSendNewsletterWelcomeEmail).toHaveBeenCalledTimes(1)
    expect(mockSendNewsletterWelcomeEmail.mock.calls[0][0]).toBe('new.subscriber@example.com')
  })

  it.each([
    ['missing', {}],
    ['not a string', { email: 42 }],
    ['malformed', { email: 'not-an-email' }],
    ['absurdly long', { email: `${'a'.repeat(300)}@example.com` }],
  ])('rejects an email that is %s', async (_label, body) => {
    const res = await newsletterPOST(post('/api/newsletter', body, freshIp()))
    expect(res.status).toBe(400)
    expect(mockSendNewsletterWelcomeEmail).not.toHaveBeenCalled()
  })

  it('stops emailing the same address after two sends, whatever IP asks', async () => {
    const email = 'repeat-target@example.com'
    for (let i = 0; i < 5; i++) {
      const res = await newsletterPOST(post('/api/newsletter', { email }, freshIp()))
      // Still reported as success: the person is subscribed either way.
      expect(res.status).toBe(200)
    }
    expect(mockSendNewsletterWelcomeEmail).toHaveBeenCalledTimes(2)
  })

  it('treats case variants of an address as the same recipient', async () => {
    for (const email of ['Case@Example.com', 'case@example.com', 'CASE@EXAMPLE.COM']) {
      await newsletterPOST(post('/api/newsletter', { email }, freshIp()))
    }
    expect(mockSendNewsletterWelcomeEmail).toHaveBeenCalledTimes(2)
  })

  it('throttles one IP after 5 signups in an hour', async () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) {
      const res = await newsletterPOST(post('/api/newsletter', { email: `person${i}@example.com` }, ip))
      expect(res.status).toBe(200)
    }
    const blocked = await newsletterPOST(post('/api/newsletter', { email: 'person6@example.com' }, ip))
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(mockSendNewsletterWelcomeEmail).toHaveBeenCalledTimes(5)
  })
})

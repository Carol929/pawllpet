// @vitest-environment node
/**
 * POST /api/contact — the contact form's backend. The email sender is mocked;
 * these tests cover what gets through to it and what the customer is told.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockSendContactFormEmail = vi.fn()

vi.mock('@/lib/email', () => ({
  sendContactFormEmail: (...args: unknown[]) => mockSendContactFormEmail(...args),
}))

// Import AFTER mocking
import { POST } from '@/app/api/contact/route'

// The rate limiter keeps module-level counters, so every test uses its own IP.
let ipCounter = 0
const freshIp = () => `198.51.100.${++ipCounter}`

function post(body: unknown, ip: string): NextRequest {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const valid = {
  name: 'Jane Doe',
  email: 'Jane.Doe@Example.com',
  topic: 'order',
  message: 'My order has not arrived yet.',
}

beforeEach(() => {
  mockSendContactFormEmail.mockReset()
  mockSendContactFormEmail.mockResolvedValue(undefined)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/contact', () => {
  it('forwards a valid message with trimmed fields and a lower-cased address', async () => {
    const res = await POST(post({ ...valid, name: '  Jane Doe  ', message: '  My order has not arrived yet.  ' }, freshIp()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockSendContactFormEmail).toHaveBeenCalledTimes(1)
    expect(mockSendContactFormEmail).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      topic: 'order',
      message: 'My order has not arrived yet.',
    })
  })

  it.each([
    ['the name is missing', { ...valid, name: '' }],
    ['the name is only spaces', { ...valid, name: '   ' }],
    ['the email is malformed', { ...valid, email: 'not-an-email' }],
    ['the topic is not one of the options', { ...valid, topic: 'spam' }],
    ['the message is empty', { ...valid, message: '' }],
    ['the message is over 5000 characters', { ...valid, message: 'x'.repeat(5001) }],
    ['the name is over 100 characters', { ...valid, name: 'x'.repeat(101) }],
    ['the body is not an object', 'just a string'],
  ])('returns 400 and sends nothing when %s', async (_label, body) => {
    const res = await POST(post(body, freshIp()))
    expect(res.status).toBe(400)
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON', async () => {
    const res = await POST(post('{"name":', freshIp()))
    expect(res.status).toBe(400)
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })

  it('pretends to succeed but sends nothing when the hidden honeypot field is filled', async () => {
    const res = await POST(post({ ...valid, website: 'https://spam.example' }, freshIp()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })

  it('tells the customer when the message could not be delivered', async () => {
    mockSendContactFormEmail.mockRejectedValue(new Error('Email was not sent: quota exceeded'))
    const res = await POST(post(valid, freshIp()))
    expect(res.status).toBe(502)
    const json = await res.json()
    expect(json.success).toBeUndefined()
    // The provider's own error text stays in the server log.
    expect(json.error).not.toContain('quota')
  })

  it('throttles one IP after 5 messages in an hour', async () => {
    const ip = freshIp()
    for (let i = 0; i < 5; i++) {
      expect((await POST(post(valid, ip))).status).toBe(200)
    }
    const blocked = await POST(post(valid, ip))
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(mockSendContactFormEmail).toHaveBeenCalledTimes(5)
  })
})

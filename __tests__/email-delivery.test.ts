// @vitest-environment node
/**
 * lib/email.ts against a mocked Resend client: what each message says, where
 * it goes, and what happens when Resend rejects the send.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockSend = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => mockSend(...args) }
  },
}))

// Import AFTER mocking
import {
  sendContactFormEmail,
  sendNewsletterWelcomeEmail,
  sendShippingNotificationEmail,
  sendVerificationEmail,
} from '@/lib/email'

const REJECTED = { data: null, error: { name: 'validation_error', message: 'The pawllpet.com domain is not verified' } }

let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  mockSend.mockReset()
  mockSend.mockResolvedValue({ data: { id: 'email_1' }, error: null })
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.com')
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  errorLog.mockRestore()
})

const lastPayload = () => mockSend.mock.calls[mockSend.mock.calls.length - 1][0] as Record<string, string>

describe('sendContactFormEmail', () => {
  const message = { name: 'Jane Doe', email: 'jane@example.com', topic: 'return', message: 'The collar arrived damaged.' }

  it('goes to the store inbox with the customer as Reply-To', async () => {
    await sendContactFormEmail(message)
    const payload = lastPayload()
    expect(payload.to).toBe('owner@example.com')
    expect(payload.reply_to).toBe('jane@example.com')
    expect(payload.subject).toBe('Contact form: Returns & exchanges — Jane Doe')
    expect(payload.html).toContain('The collar arrived damaged.')
  })

  it('escapes HTML in everything the customer typed', async () => {
    await sendContactFormEmail({ ...message, name: '<b>Jane</b>', message: '<script>alert(1)</script>' })
    const { html } = lastPayload()
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<b>Jane</b>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('keeps the subject on one line', async () => {
    await sendContactFormEmail({ ...message, name: 'Jane\r\nBcc: someone@example.com' })
    expect(lastPayload().subject).not.toMatch(/[\r\n]/)
  })

  it('throws when Resend rejects the send, so the form can say so', async () => {
    mockSend.mockResolvedValue(REJECTED)
    await expect(sendContactFormEmail(message)).rejects.toThrow(/not sent/i)
  })

  it('throws without sending when the store inbox is not configured', async () => {
    vi.stubEnv('ADMIN_EMAIL', '')
    await expect(sendContactFormEmail(message)).rejects.toThrow(/not configured/i)
    expect(mockSend).not.toHaveBeenCalled()
  })
})

describe('sendNewsletterWelcomeEmail', () => {
  it('offers the automatic first-order discount and no promo code', async () => {
    await sendNewsletterWelcomeEmail('subscriber@example.com')
    const { to, subject, html } = lastPayload()
    expect(to).toBe('subscriber@example.com')
    expect(subject).toContain('10% off your first order')
    expect(html).toContain('10% OFF')
    expect(html).toContain('$50')
    expect(html).toContain('No code needed')
    // The grand-opening code expired on 2026-05-31.
    expect(html).not.toMatch(/GRAND25|25%|discount code/i)
  })

  it('throws when Resend rejects the send', async () => {
    mockSend.mockResolvedValue(REJECTED)
    await expect(sendNewsletterWelcomeEmail('subscriber@example.com')).rejects.toThrow(/not sent/i)
  })
})

describe('customer emails', () => {
  it('point at the contact form rather than a mailbox that cannot receive mail', async () => {
    await sendShippingNotificationEmail('customer@example.com', 'Jane', {
      orderId: 'order_12345678',
      carrier: 'usps',
      trackingNumber: '9400100000000000000000',
      trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400100000000000000000',
    })
    const { html } = lastPayload()
    expect(html).toContain('https://pawllpet.com/contact')
    expect(html).not.toContain('support@pawllpet.com')
    expect(html).not.toMatch(/reply to this email/i)
  })
})

describe('a rejected send on a transactional email', () => {
  it('is logged under the sender name and does not throw', async () => {
    mockSend.mockResolvedValue(REJECTED)
    await expect(sendVerificationEmail('new@example.com', 'New User', '123456')).resolves.toBeUndefined()
    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(String(errorLog.mock.calls[0][0])).toContain('sendVerificationEmail')
    expect(String(errorLog.mock.calls[0][0])).toContain('not verified')
  })

  it('logs nothing when the send is accepted', async () => {
    await sendVerificationEmail('new@example.com', 'New User', '123456')
    expect(errorLog).not.toHaveBeenCalled()
  })
})

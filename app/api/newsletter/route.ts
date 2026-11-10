export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendNewsletterWelcomeEmail } from '@/lib/email'
import { normalizeEmail } from '@/lib/email-utils'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const DISCOUNT_CODE = 'GRAND25'

// Longest address SMTP will accept (RFC 5321).
const MAX_EMAIL_LENGTH = 254

const HOUR = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    // This endpoint sends mail from our domain to whatever address it is
    // given, with no login. Unthrottled, it lets anyone flood a third party
    // with our emails and burn the Resend quota that order confirmations and
    // verification codes depend on.
    const byIp = rateLimit(`newsletter:ip:${clientIp(req)}`, 5, HOUR)
    if (!byIp.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(byIp.retryAfterSeconds) } },
      )
    }

    const { email } = await req.json()

    if (
      !email ||
      typeof email !== 'string' ||
      email.length > MAX_EMAIL_LENGTH ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const address = normalizeEmail(email)

    // At most two welcome emails per address per day (the second covers a
    // retry after a failed send). Further signups still report success — the
    // person is subscribed — they just don't trigger another email.
    const byAddress = rateLimit(`newsletter:email:${address}`, 2, 24 * HOUR)
    if (byAddress.ok) {
      await sendNewsletterWelcomeEmail(address, DISCOUNT_CODE)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter signup error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

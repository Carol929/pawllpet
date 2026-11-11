export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactFormEmail } from '@/lib/email'
import { normalizeEmail } from '@/lib/email-utils'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const HOUR = 60 * 60 * 1000

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(254).email(),
  topic: z.enum(['order', 'product', 'return', 'partnership', 'other']),
  message: z.string().trim().min(1).max(5000),
  // Honeypot. The field is hidden from people, so only a bot fills it in.
  website: z.string().max(200).optional(),
})

/**
 * POST /api/contact
 *
 * Delivers a contact-form message to the store inbox (ADMIN_EMAIL) with the
 * sender as Reply-To. Public, so it is throttled per IP.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(`contact:ip:${clientIp(request)}`, 5, HOUR)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let data: z.infer<typeof contactSchema>
  try {
    data = contactSchema.parse(await request.json())
  } catch {
    return NextResponse.json(
      { error: 'Please fill in your name, a valid email, a topic and a message.' },
      { status: 400 },
    )
  }

  // Report success to a bot without sending anything, so it has no signal to adapt to.
  if (data.website) {
    return NextResponse.json({ success: true })
  }

  try {
    await sendContactFormEmail({
      name: data.name,
      email: normalizeEmail(data.email),
      topic: data.topic,
      message: data.message,
    })
  } catch (err) {
    console.error('[contact] failed to deliver message:', err)
    return NextResponse.json(
      { error: 'We could not send your message. Please try again in a few minutes.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true })
}

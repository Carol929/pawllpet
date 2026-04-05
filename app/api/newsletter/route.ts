import { NextRequest, NextResponse } from 'next/server'
import { sendNewsletterWelcomeEmail } from '@/lib/email'

const DISCOUNT_CODE = 'GRAND25'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    await sendNewsletterWelcomeEmail(email.trim().toLowerCase(), DISCOUNT_CODE)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter signup error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { sendFirstOrderPerkEmail } from '@/lib/email'

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'cancellation_requested']

/**
 * One-off blast: tell existing verified accounts that have never placed a
 * paid order about the automatic 10%-off-first-order perk.
 *
 * POST { "dryRun": true }  → counts recipients without sending
 * POST {}                  → sends the 'reminder' variant to each recipient
 *
 * There is no persisted sent-flag — run the real blast once. A dry run first
 * shows exactly how many emails would go out.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  let dryRun = false
  try {
    const body = await request.json()
    dryRun = body?.dryRun === true
  } catch {
    // empty body → real send
  }

  const recipients = await prisma.user.findMany({
    where: {
      emailVerified: true,
      isBlocked: false,
      role: 'user',
      orders: { none: { status: { in: PAID_STATUSES } } },
    },
    select: { email: true, fullName: true },
  })

  if (dryRun) {
    return NextResponse.json({ dryRun: true, wouldSend: recipients.length })
  }

  let sent = 0
  let failed = 0
  for (const r of recipients) {
    try {
      await sendFirstOrderPerkEmail(r.email, r.fullName, 'reminder')
      sent++
    } catch (e) {
      failed++
      console.error(`[first-order-blast] failed for ${r.email}:`, e)
    }
  }

  console.log(`[first-order-blast] done: ${sent} sent, ${failed} failed of ${recipients.length}`)
  return NextResponse.json({ sent, failed, total: recipients.length })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DONATION_RATE, PLEDGE_ELIGIBLE_STATUSES, calcPledgeCents } from '@/lib/giving'

// Public endpoint for the /giving page: the running 1% pledge (computed live
// from paid orders), total actually donated, and the donation log.
export async function GET() {
  try {
    const [orders, donations] = await Promise.all([
      prisma.order.findMany({
        where: { status: { in: [...PLEDGE_ELIGIBLE_STATUSES] } },
        select: { subtotal: true, discountAmount: true },
      }),
      prisma.donation.findMany({ orderBy: { donatedAt: 'desc' } }),
    ])

    const pledgedCents = calcPledgeCents(orders)
    const donatedCents = Math.round(donations.reduce((sum, d) => sum + d.amount, 0) * 100)

    return NextResponse.json(
      {
        rate: DONATION_RATE,
        pledged: pledgedCents / 100,
        donated: donatedCents / 100,
        orderCount: orders.length,
        donations: donations.map((d) => ({
          id: d.id,
          organization: d.organization,
          amount: d.amount,
          donatedAt: d.donatedAt,
          note: d.note,
          link: d.link,
          imageUrl: d.imageUrl,
        })),
      },
      // Donation totals don't need to be second-accurate — let the CDN absorb
      // repeat visits for 5 minutes.
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
    )
  } catch (err) {
    console.error('[Giving API] Failed to load stats:', err)
    return NextResponse.json({ error: 'Failed to load giving stats' }, { status: 500 })
  }
}

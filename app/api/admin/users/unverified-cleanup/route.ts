export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizeEmail } from '@/lib/email-utils'

/**
 * Cleanup for junk signups (e.g. the 2026-09 pentest probe accounts).
 * Only ever touches accounts that are ALL of: email not verified, role
 * 'user', and zero orders — so a real customer can never be deleted here.
 *
 * POST { "dryRun": true }          → list deletable accounts, delete nothing
 * POST { "emails": ["a@x.com"] }   → delete those accounts (conditions re-checked per account)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  let body: { dryRun?: boolean; emails?: string[] } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pass {"dryRun":true} to list, or {"emails":[...]} to delete.' }, { status: 400 })
  }

  const deletableWhere = {
    emailVerified: false,
    role: 'user',
    orders: { none: {} },
  } as const

  if (body.dryRun === true) {
    const candidates = await prisma.user.findMany({
      where: deletableWhere,
      select: { email: true, fullName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ dryRun: true, count: candidates.length, candidates })
  }

  if (!Array.isArray(body.emails) || body.emails.length === 0) {
    return NextResponse.json({ error: 'Pass {"dryRun":true} to list, or {"emails":[...]} to delete.' }, { status: 400 })
  }

  const emails = body.emails.map(normalizeEmail)
  // Exact-email match, conditions enforced again — never a blanket delete.
  const targets = await prisma.user.findMany({
    where: { email: { in: emails }, ...deletableWhere },
    select: { id: true, email: true },
  })

  const ids = targets.map(t => t.id)
  const [, deleted] = await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids }, ...deletableWhere } }),
  ])

  console.log(`[unverified-cleanup] deleted ${deleted.count} of ${emails.length} requested`)
  return NextResponse.json({
    deleted: deleted.count,
    requested: emails.length,
    skipped: emails.filter(e => !targets.some(t => t.email === e)),
  })
}

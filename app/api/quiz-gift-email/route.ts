export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'
import { sendQuizGiftEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { giftName } = await request.json()
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { email: true, fullName: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await sendQuizGiftEmail(user.email, user.fullName, giftName || 'Free Gift')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Quiz gift email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

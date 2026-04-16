export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true },
  })

  // Only allow the order owner to check status
  if (!order || order.userId !== userId) {
    return NextResponse.json({ status: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ status: order.status })
}

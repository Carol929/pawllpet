export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: authResult.userId },
    include: { items: true },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

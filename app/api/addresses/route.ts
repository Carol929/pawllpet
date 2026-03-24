export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'

export async function GET(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const addresses = await prisma.address.findMany({
    where: { userId: authResult.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(request: NextRequest) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const data = await request.json()
  const { label, fullName, phone, street, city, state, zip, country, isDefault } = data

  if (!fullName || !street || !city || !state || !zip) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: authResult.userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.create({
    data: {
      userId: authResult.userId,
      label: label || 'Home',
      fullName,
      phone,
      street,
      city,
      state,
      zip,
      country: country || 'US',
      isDefault: isDefault || false,
    },
  })

  return NextResponse.json(address, { status: 201 })
}

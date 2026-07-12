export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/user-auth'
import { z } from 'zod'

// Whitelist of updatable fields. Passing the raw body to Prisma would let a
// caller set columns like `userId`, reassigning the row to another account.
const updateSchema = z.object({
  label: z.string().min(1).max(60).optional(),
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  street: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(120).optional(),
  state: z.string().min(1).max(60).optional(),
  zip: z.string().min(1).max(20).optional(),
  country: z.string().min(2).max(2).optional(),
  isDefault: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = params

  let data: z.infer<typeof updateSchema>
  try {
    data = updateSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Verify ownership
  const existing = await prisma.address.findFirst({ where: { id, userId: authResult.userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: authResult.userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.update({ where: { id }, data })
  return NextResponse.json(address)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireUser(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = params
  const existing = await prisma.address.findFirst({ where: { id, userId: authResult.userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

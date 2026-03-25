export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/products'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

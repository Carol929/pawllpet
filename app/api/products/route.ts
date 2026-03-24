export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: Record<string, unknown> = {}
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const petType = searchParams.get('petType')
    const limit = searchParams.get('limit')

    if (search) filters.search = search
    if (category) filters.category = category
    if (petType) filters.petType = petType
    if (searchParams.get('isNew') === 'true') filters.isNew = true
    if (searchParams.get('isBestSeller') === 'true') filters.isBestSeller = true
    if (searchParams.get('isDrop') === 'true') filters.isDrop = true
    if (searchParams.get('isBundle') === 'true') filters.isBundle = true
    if (limit) filters.limit = parseInt(limit)

    const products = await getProducts(filters as Parameters<typeof getProducts>[0])
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json([], { status: 500 })
  }
}

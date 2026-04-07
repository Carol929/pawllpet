export const runtime = 'nodejs'

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
    const sort = searchParams.get('sort')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')
    const ids = searchParams.get('ids')

    if (ids) filters.ids = ids.split(',').filter(Boolean)
    if (search) filters.search = search
    if (category) filters.category = category
    if (petType) filters.petType = petType
    if (searchParams.get('isNew') === 'true') filters.isNew = true
    if (searchParams.get('isBestSeller') === 'true') filters.isBestSeller = true
    if (searchParams.get('isDrop') === 'true') filters.isDrop = true
    if (searchParams.get('isBundle') === 'true') filters.isBundle = true
    if (limit) filters.limit = parseInt(limit)
    if (sort) filters.sortBy = sort
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    if (page) filters.page = parseInt(page)
    if (pageSize) filters.pageSize = parseInt(pageSize)

    const result = await getProducts(filters as Parameters<typeof getProducts>[0])

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ products: [], total: 0 }, { status: 500 })
  }
}

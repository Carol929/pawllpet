export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/products'

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const product = await getProductBySlug(slug)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

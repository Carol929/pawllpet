export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

export async function GET() {
  try {
    const [all, newArr, best] = await Promise.all([
      getProducts({ limit: 8 }),
      getProducts({ isNew: true, limit: 4 }),
      getProducts({ isBestSeller: true, limit: 4 }),
    ])

    return NextResponse.json({
      allProducts: all.products,
      newArrivals: newArr.products,
      bestSellers: best.products,
    })
  } catch (error) {
    console.error('Homepage data error:', error)
    return NextResponse.json({ allProducts: [], newArrivals: [], bestSellers: [] }, { status: 500 })
  }
}

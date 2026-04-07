export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

// In-memory cache for homepage data
let cache: { data: Record<string, unknown>; ts: number } | null = null
const CACHE_TTL = 120_000 // 120 seconds

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
      })
    }

    const [all, newArr, best] = await Promise.all([
      getProducts({ limit: 20 }),
      getProducts({ isNew: true, limit: 4 }),
      getProducts({ isBestSeller: true, limit: 4 }),
    ])

    const data = {
      allProducts: all.products,
      newArrivals: newArr.products,
      bestSellers: best.products,
    }

    // Update cache
    cache = { data, ts: Date.now() }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error('Homepage data error:', error)
    return NextResponse.json({ allProducts: [], newArrivals: [], bestSellers: [] }, { status: 500 })
  }
}

'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/product-types'
import { getRecentlyViewed } from '@/lib/recently-viewed'
import { ProductGrid } from '@/components/ProductGrid'
import { Reveal } from '@/components/Reveal'
import { useLocale } from '@/lib/i18n'

/**
 * "Recently viewed" rail. Reads product ids from localStorage, fetches the live
 * products, and renders them in recency order. Renders nothing when empty, so
 * it's invisible to first-time visitors.
 */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { locale } = useLocale()
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    const ids = getRecentlyViewed().filter((id) => id !== excludeId).slice(0, 4)
    if (ids.length === 0) return
    fetch(`/api/products?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((data) => {
        const products: Product[] = data.products || []
        const order = new Map(ids.map((id, i) => [id, i]))
        products.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
        setItems(products)
      })
      .catch(() => {})
  }, [excludeId])

  if (items.length === 0) return null

  return (
    <Reveal>
      <section className="section-oval">
        <span className="home-eyebrow">{locale === 'zh' ? '继续逛逛' : 'Pick up where you left off'}</span>
        <h2 style={{ marginTop: 0 }}>{locale === 'zh' ? '最近浏览' : 'Recently viewed'}</h2>
        <ProductGrid items={items} />
      </section>
    </Reveal>
  )
}

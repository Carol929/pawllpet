'use client'

import { useState, useEffect, useMemo } from 'react'
import { Product } from '@/lib/product-types'

export function useProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const key = useMemo(() => JSON.stringify(params || {}), [params])

  useEffect(() => {
    const qs = new URLSearchParams(params || {}).toString()
    fetch(`/api/products${qs ? `?${qs}` : ''}`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { products, loading }
}

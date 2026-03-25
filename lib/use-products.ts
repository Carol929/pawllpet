'use client'

import { useState, useEffect, useMemo } from 'react'
import { Product } from '@/lib/product-types'

export function useProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const key = useMemo(() => JSON.stringify(params || {}), [params])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams(params || {}).toString()
    fetch(`/api/products${qs ? `?${qs}` : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object' && 'products' in data) {
          setProducts(data.products)
          setTotal(data.total || 0)
        } else if (Array.isArray(data)) {
          setProducts(data)
          setTotal(data.length)
        } else {
          setProducts([])
          setTotal(0)
        }
        setLoading(false)
      })
      .catch(() => { setProducts([]); setTotal(0); setLoading(false) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { products, total, loading }
}

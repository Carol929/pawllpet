'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

interface WishlistCtx {
  wishlistIds: Set<string>
  toggle: (productId: string) => void
  isWished: (productId: string) => boolean
}

const Ctx = createContext<WishlistCtx>({ wishlistIds: new Set(), toggle: () => {}, isWished: () => false })

const WL_CACHE_KEY = 'pawll-wishlist-cache'
const WL_CACHE_TTL = 60_000 // 60 seconds

function getCachedWishlist(): string[] | null {
  try {
    const raw = sessionStorage.getItem(WL_CACHE_KEY)
    if (!raw) return null
    const { ids, ts } = JSON.parse(raw)
    if (Date.now() - ts < WL_CACHE_TTL) return ids
  } catch {}
  return null
}

function setCachedWishlist(ids: string[]) {
  try {
    sessionStorage.setItem(WL_CACHE_KEY, JSON.stringify({ ids, ts: Date.now() }))
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const cached = getCachedWishlist()
    return cached ? new Set(cached) : new Set()
  })

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return }
    // Use cache on subsequent navigations, refresh in background
    const cached = getCachedWishlist()
    if (cached) setWishlistIds(new Set(cached))
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(items => {
        const ids = items.map((i: { id: string }) => i.id)
        setWishlistIds(new Set(ids))
        setCachedWishlist(ids)
      })
      .catch(() => {})
  }, [user])

  const toggle = useCallback(async (productId: string) => {
    if (!user) return
    const isIn = wishlistIds.has(productId)
    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev)
      if (isIn) next.delete(productId); else next.add(productId)
      return next
    })
    try {
      await fetch('/api/wishlist', {
        method: isIn ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      // Update cache after successful toggle
      setWishlistIds(current => {
        setCachedWishlist(Array.from(current))
        return current
      })
    } catch {
      // Revert
      setWishlistIds(prev => {
        const next = new Set(prev)
        if (isIn) next.add(productId); else next.delete(productId)
        return next
      })
    }
  }, [user, wishlistIds])

  const isWished = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds])

  return <Ctx.Provider value={{ wishlistIds, toggle, isWished }}>{children}</Ctx.Provider>
}

export const useWishlist = () => useContext(Ctx)

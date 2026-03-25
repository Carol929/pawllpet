'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

interface WishlistCtx {
  wishlistIds: Set<string>
  toggle: (productId: string) => void
  isWished: (productId: string) => boolean
}

const Ctx = createContext<WishlistCtx>({ wishlistIds: new Set(), toggle: () => {}, isWished: () => false })

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return }
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(items => setWishlistIds(new Set(items.map((i: { id: string }) => i.id))))
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

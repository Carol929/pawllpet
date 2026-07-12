'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export type CartItem = {
  productId: string
  quantity: number
  variantIndex?: number
  variantName?: string
  variantPrice?: number
}

interface CartContextValue {
  items: CartItem[]
  loaded: boolean
  addItem: (productId: string, qty?: number, variant?: { index: number; name: string; price: number }) => void
  removeItem: (productId: string, variantIndex?: number) => void
  removeItemsByKey: (keys: string[]) => void
  updateQuantity: (productId: string, qty: number, variantIndex?: number) => void
  clearCart: () => void
  totalItems: number
}

// Max quantity per line — mirrors the server-side cap in /api/checkout so the
// client can't build a cart the server will reject.
const MAX_QTY = 99

// The cart is namespaced per user id. A global key would leak one user's cart to
// the next person who logs in on the same browser (localStorage outlives a
// logout that doesn't explicitly clear it).
const STORAGE_PREFIX = 'pawll-cart'
function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`
}

// Stable key identifying a cart line (productId + optional variant index).
export function cartItemKey(productId: string, variantIndex?: number) {
  return variantIndex !== undefined ? `${productId}:${variantIndex}` : productId
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1
  return Math.max(1, Math.min(MAX_QTY, Math.floor(qty)))
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(userId: string): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(userId: string, items: CartItem[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load this user's cart from localStorage. Logging out just clears the
  // in-memory cart — it does NOT delete the stored cart, so it survives to the
  // next login and never bleeds into another user's session.
  useEffect(() => {
    if (authLoading) return // Wait for auth to resolve
    setItems(userId ? loadCart(userId) : [])
    setLoaded(true)
  }, [userId, authLoading])

  // Persist whenever items change (only once loaded and for a real user).
  useEffect(() => {
    if (loaded && userId) saveCart(userId, items)
  }, [items, loaded, userId])

  const addItem = useCallback((productId: string, qty = 1, variant?: { index: number; name: string; price: number }) => {
    setItems((prev) => {
      const match = (i: CartItem) => i.productId === productId && (i.variantIndex ?? -1) === (variant?.index ?? -1)
      const existing = prev.find(match)
      if (existing) {
        return prev.map((i) => match(i) ? { ...i, quantity: clampQty(i.quantity + qty) } : i)
      }
      return [...prev, {
        productId, quantity: clampQty(qty),
        ...(variant ? { variantIndex: variant.index, variantName: variant.name, variantPrice: variant.price } : {}),
      }]
    })
  }, [])

  const removeItem = useCallback((productId: string, variantIndex?: number) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && (i.variantIndex ?? -1) === (variantIndex ?? -1))))
  }, [])

  const removeItemsByKey = useCallback((keys: string[]) => {
    const toRemove = new Set(keys)
    setItems((prev) => prev.filter((i) => !toRemove.has(cartItemKey(i.productId, i.variantIndex))))
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number, variantIndex?: number) => {
    const match = (i: CartItem) => i.productId === productId && (i.variantIndex ?? -1) === (variantIndex ?? -1)
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !match(i)))
    } else {
      setItems((prev) => prev.map((i) => match(i) ? { ...i, quantity: clampQty(qty) } : i))
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    if (userId) { try { localStorage.removeItem(storageKey(userId)) } catch {} }
  }, [userId])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, loaded, addItem, removeItem, removeItemsByKey, updateQuantity, clearCart, totalItems }),
    [items, loaded, addItem, removeItem, removeItemsByKey, updateQuantity, clearCart, totalItems]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

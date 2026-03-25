'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export type CartItem = { productId: string; quantity: number }

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  totalItems: number
}

const STORAGE_KEY = 'pawll-cart'

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load cart from localStorage only when user is logged in
  useEffect(() => {
    if (authLoading) return // Wait for auth to resolve
    if (user) {
      setItems(loadCart())
    } else {
      setItems([]) // Not logged in = empty cart
    }
    setLoaded(true)
  }, [user, authLoading])

  // Save cart to localStorage when items change (only if logged in)
  useEffect(() => {
    if (loaded && user) saveCart(items)
  }, [items, loaded, user])

  const addItem = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { productId, quantity: qty }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i))
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo(() => ({ items, addItem, removeItem, updateQuantity, clearCart, totalItems }), [items, addItem, removeItem, updateQuantity, clearCart, totalItems])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/lib/products'
import './cart.css'

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart()
  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false)
      return
    }

    // Fetch all products and build a lookup map
    fetch('/api/products')
      .then(r => r.json())
      .then((products: Product[]) => {
        const map: Record<string, Product> = {}
        products.forEach(p => { map[p.id] = p })
        setProductMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [items.length])

  const cartProducts = items
    .map(item => {
      const product = productMap[item.productId]
      return product ? { ...product, quantity: item.quantity } : null
    })
    .filter(Boolean) as (Product & { quantity: number })[]

  const subtotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalCount = cartProducts.reduce((sum, p) => sum + p.quantity, 0)
  const freeShipping = subtotal >= 65

  if (loading) {
    return <main className="container page-stack"><h1 className="cart-title">Shopping Bag</h1><p>Loading...</p></main>
  }

  if (cartProducts.length === 0) {
    return (
      <main className="container page-stack">
        <h1 className="cart-title">Shopping Bag</h1>
        <div className="cart-empty">
          <ShoppingCart size={56} strokeWidth={1} className="cart-empty-icon" />
          <h2>Your Bag is Empty</h2>
          <Link href="/" className="cart-empty-link">CONTINUE SHOPPING</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1 className="cart-title">Shopping Bag ({totalCount})</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartProducts.map((p) => (
            <div key={p.id} className="cart-item">
              <Link href={`/products/${p.slug}`}>
                <img src={p.image} alt={p.name} className="cart-item-image" />
              </Link>
              <div className="cart-item-info">
                <Link href={`/products/${p.slug}`} className="cart-item-name cart-item-link">{p.name}</Link>
                <div className="cart-item-category">{p.category.replace('-', ' ')}</div>
              </div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => updateQuantity(p.id, p.quantity - 1)} disabled={p.quantity <= 1} aria-label="Decrease quantity">−</button>
                <span className="qty-value">{p.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(p.id, p.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
              <div className="cart-item-price">${(p.price * p.quantity).toFixed(2)}</div>
              <button className="cart-item-remove" onClick={() => removeItem(p.id)} aria-label={`Remove ${p.name}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-title">Order Summary</div>
          <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)} USD</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{freeShipping ? 'FREE' : 'Calculated at next step'}</span></div>
          <hr className="cart-summary-divider" />
          <div className="cart-summary-total">
            <span className="cart-summary-total-label">Total({totalCount})</span>
            <span><span className="cart-summary-total-price">${subtotal.toFixed(2)}</span><span className="cart-summary-currency">USD</span></span>
          </div>
          <button className="cart-checkout-btn">CHECK OUT</button>
          {!freeShipping && <div className="cart-free-shipping">Add <strong>${(65 - subtotal).toFixed(2)}</strong> more for free shipping!</div>}
        </div>
      </div>
    </main>
  )
}

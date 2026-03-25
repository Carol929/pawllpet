'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/product-types'
import { calculateTax } from '@/lib/tax-rates'
import './cart.css'

interface AddressData {
  id?: string; fullName: string; phone?: string; street: string; city: string; state: string; zip: string; country: string
}

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [selectedAddr, setSelectedAddr] = useState<number>(0)
  const [newAddr, setNewAddr] = useState<AddressData>({ fullName: '', street: '', city: '', state: '', zip: '', country: 'US' })
  const [useNewAddr, setUseNewAddr] = useState(false)

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return }
    fetch('/api/products')
      .then(r => r.json())
      .then((data) => {
        const products: Product[] = data.products || data || []
        const map: Record<string, Product> = {}
        products.forEach(p => { map[p.id] = p })
        setProductMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [items.length])

  useEffect(() => {
    if (showAddress && user) {
      fetch('/api/addresses').then(r => r.json()).then(setAddresses).catch(() => {})
    }
  }, [showAddress, user])

  const cartProducts = items
    .map(item => { const p = productMap[item.productId]; return p ? { ...p, quantity: item.quantity } : null })
    .filter(Boolean) as (Product & { quantity: number })[]

  const subtotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalCount = cartProducts.reduce((sum, p) => sum + p.quantity, 0)
  const freeShipping = subtotal >= 50
  const shipping = freeShipping ? 0 : 5.99

  // Sales tax calculation based on shipping state
  const currentAddr = showAddress ? (useNewAddr ? newAddr : addresses[selectedAddr]) : null
  const { rate: taxRate, amount: tax, stateAbbr: taxState } = calculateTax(subtotal, currentAddr?.state || '')

  async function handleCheckout() {
    if (!user) { router.push('/auth?tab=login'); return }
    if (!showAddress) { setShowAddress(true); return }

    const addr = useNewAddr ? newAddr : addresses[selectedAddr]
    if (!addr?.fullName || !addr?.street || !addr?.city || !addr?.state || !addr?.zip) {
      alert('Please fill in all address fields'); return
    }

    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: addr }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Checkout failed')
        setCheckingOut(false)
      }
    } catch {
      alert('Checkout failed')
      setCheckingOut(false)
    }
  }

  if (loading) return <main className="container page-stack"><h1 className="cart-title">Shopping Bag</h1><p>Loading...</p></main>

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
              <Link href={`/products/${p.slug}`}><img src={p.image} alt={p.name} className="cart-item-image" /></Link>
              <div className="cart-item-info">
                <Link href={`/products/${p.slug}`} className="cart-item-name cart-item-link">{p.name}</Link>
                <div className="cart-item-category">{p.category.replace('-', ' ')}</div>
              </div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => updateQuantity(p.id, p.quantity - 1)} disabled={p.quantity <= 1}>−</button>
                <span className="qty-value">{p.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(p.id, p.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-price">${(p.price * p.quantity).toFixed(2)}</div>
              <button className="cart-item-remove" onClick={() => removeItem(p.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-title">Order Summary</div>
          <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)} USD</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{freeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="cart-summary-row"><span>Tax{taxRate > 0 ? ` (${taxState} ${(taxRate * 100).toFixed(1)}%)` : ''}</span><span>{showAddress ? `$${tax.toFixed(2)}` : 'Calculated at checkout'}</span></div>
          <hr className="cart-summary-divider" />
          <div className="cart-summary-total">
            <span className="cart-summary-total-label">Total({totalCount})</span>
            <span><span className="cart-summary-total-price">${(subtotal + shipping + tax).toFixed(2)}</span><span className="cart-summary-currency">USD</span></span>
          </div>

          {showAddress && (
            <div className="cart-address-section">
              <h3>Shipping Address</h3>
              {addresses.length > 0 && !useNewAddr && (
                <div className="cart-addr-list">
                  {addresses.map((a, i) => (
                    <label key={i} className={`cart-addr-option ${selectedAddr === i ? 'cart-addr-option--active' : ''}`}>
                      <input type="radio" name="addr" checked={selectedAddr === i} onChange={() => setSelectedAddr(i)} />
                      <span>{a.fullName}, {a.street}, {a.city} {a.state} {a.zip}</span>
                    </label>
                  ))}
                  <button className="cart-addr-new-btn" onClick={() => setUseNewAddr(true)}>+ New Address</button>
                </div>
              )}
              {(useNewAddr || addresses.length === 0) && (
                <div className="cart-addr-form">
                  <input placeholder="Full Name" value={newAddr.fullName} onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })} required />
                  <input placeholder="Phone (optional)" value={newAddr.phone || ''} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
                  <input placeholder="Street Address" value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} required />
                  <div className="cart-addr-row">
                    <input placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} required />
                    <input placeholder="State" value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} required />
                    <input placeholder="ZIP" value={newAddr.zip} onChange={e => setNewAddr({ ...newAddr, zip: e.target.value })} required />
                  </div>
                  {addresses.length > 0 && <button className="cart-addr-new-btn" onClick={() => setUseNewAddr(false)}>Use saved address</button>}
                </div>
              )}
            </div>
          )}

          <button className="cart-checkout-btn" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'PROCESSING...' : showAddress ? 'PAY NOW' : 'CHECK OUT'}
          </button>
          {!freeShipping && <div className="cart-free-shipping">Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!</div>}
        </div>
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/product-types'
import { calculateTax } from '@/lib/tax-rates'
import './checkout.css'

interface Addr { id?: string; fullName: string; phone?: string; street: string; street2?: string; city: string; state: string; zip: string; country: string }

export default function CheckoutPage() {
  const { items } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [savedAddrs, setSavedAddrs] = useState<Addr[]>([])
  const [selectedSaved, setSelectedSaved] = useState<number>(0)
  const [useNew, setUseNew] = useState(false)
  const [form, setForm] = useState<Addr>({ fullName: '', phone: '', street: '', street2: '', city: '', state: '', zip: '', country: 'US' })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth?tab=login'); return }
    if (!authLoading && items.length === 0) { router.push('/cart'); return }
  }, [authLoading, user, items, router])

  // Load products and saved addresses
  useEffect(() => {
    if (items.length === 0) return
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/addresses').then(r => r.json()).catch(() => []),
    ]).then(([prodData, addrs]) => {
      const products = prodData.products || prodData || []
      const map: Record<string, Product> = {}
      products.forEach((p: Product) => { map[p.id] = p })
      setProductMap(map)
      setSavedAddrs(addrs)
      if (!addrs.length) setUseNew(true)
      setLoading(false)
    })
  }, [items])

  const cartProducts = items
    .map(item => { const p = productMap[item.productId]; return p ? { ...p, quantity: item.quantity } : null })
    .filter(Boolean) as (Product & { quantity: number })[]

  const subtotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalCount = cartProducts.reduce((sum, p) => sum + p.quantity, 0)
  const freeShipping = subtotal >= 50
  const shipping = freeShipping ? 0 : 5.99

  const currentAddr = useNew ? form : savedAddrs[selectedSaved]
  const { rate: taxRate, amount: tax, stateAbbr: taxState } = calculateTax(subtotal, currentAddr?.state || '')
  const total = subtotal + shipping + tax

  function trimSet(field: keyof Addr, val: string) {
    setForm(f => ({ ...f, [field]: val.trimStart() }))
  }

  async function handlePay() {
    const addr = useNew ? form : savedAddrs[selectedSaved]
    if (!addr) { setError('Please select or enter an address'); return }

    const trimmed = {
      fullName: addr.fullName.trim(),
      phone: (addr.phone || '').trim(),
      street: `${addr.street.trim()}${addr.street2 ? ', ' + addr.street2.trim() : ''}`,
      city: addr.city.trim(),
      state: addr.state.trim(),
      zip: addr.zip.trim(),
      country: addr.country || 'US',
    }

    if (!trimmed.fullName || !trimmed.street || !trimmed.city || !trimmed.state || !trimmed.zip) {
      setError('Please fill in all required address fields')
      return
    }

    setError('')
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: trimmed }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Checkout failed')
        setPaying(false)
      }
    } catch {
      setError('Checkout failed. Please try again.')
      setPaying(false)
    }
  }

  if (loading || authLoading) {
    return <main className="container checkout-page"><h1>Checkout</h1><p>Loading...</p></main>
  }

  return (
    <main className="container checkout-page">
      <Link href="/cart" className="btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
        <ArrowLeft size={14} /> Back to Cart
      </Link>
      <h1>Checkout</h1>

      <div className="checkout-layout">
        {/* Left: Shipping Address */}
        <div className="checkout-form">
          <h2>Shipping Address</h2>

          {savedAddrs.length > 0 && (
            <div className="checkout-saved-addrs">
              {savedAddrs.map((a, i) => (
                <label key={i} className={`checkout-saved-addr ${!useNew && selectedSaved === i ? 'checkout-saved-addr--active' : ''}`}>
                  <input type="radio" name="addr" checked={!useNew && selectedSaved === i} onChange={() => { setSelectedSaved(i); setUseNew(false) }} />
                  <span>{a.fullName}, {a.street}, {a.city} {a.state} {a.zip}</span>
                </label>
              ))}
              <button className="checkout-new-addr-btn" onClick={() => setUseNew(true)}>
                {useNew ? '✓ New address' : '+ Enter a new address'}
              </button>
            </div>
          )}

          {useNew && (
            <div className="checkout-form-fields">
              <input placeholder="Full Name *" autoComplete="name" value={form.fullName} onChange={e => trimSet('fullName', e.target.value)} />
              <input placeholder="Phone (optional)" autoComplete="tel" value={form.phone || ''} onChange={e => trimSet('phone', e.target.value)} />
              <input placeholder="Street Address *" autoComplete="address-line1" value={form.street} onChange={e => trimSet('street', e.target.value)} />
              <input placeholder="Apt, Suite, Unit (optional)" autoComplete="address-line2" value={form.street2 || ''} onChange={e => trimSet('street2', e.target.value)} />
              <div className="checkout-form-row">
                <input placeholder="City *" autoComplete="address-level2" value={form.city} onChange={e => trimSet('city', e.target.value)} />
                <input placeholder="State *" autoComplete="address-level1" value={form.state} onChange={e => trimSet('state', e.target.value)} />
                <input placeholder="ZIP *" autoComplete="postal-code" value={form.zip} onChange={e => trimSet('zip', e.target.value)} />
              </div>
            </div>
          )}

          {error && <p style={{ color: '#dc2626', fontSize: '.9rem', marginTop: '.5rem' }}>{error}</p>}
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="checkout-items">
            {cartProducts.map(p => (
              <div key={p.id} className="checkout-item">
                <img src={p.image} alt={p.name} className="checkout-item-img" />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{p.name}</span>
                  <span className="checkout-item-qty">Qty: {p.quantity}</span>
                </div>
                <span className="checkout-item-price">${(p.price * p.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="checkout-row"><span>Shipping</span><span>{freeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="checkout-row"><span>Tax{taxRate > 0 ? ` (${taxState} ${(taxRate * 100).toFixed(1)}%)` : ''}</span><span>${tax.toFixed(2)}</span></div>
            <div className="checkout-row checkout-row--total"><span>Total ({totalCount})</span><span>${total.toFixed(2)} USD</span></div>
          </div>

          <button className="checkout-pay-btn" onClick={handlePay} disabled={paying}>
            <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {paying ? 'PROCESSING...' : `PAY $${total.toFixed(2)}`}
          </button>

          {!freeShipping && (
            <div className="checkout-free-shipping">Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!</div>
          )}
        </div>
      </div>
    </main>
  )
}

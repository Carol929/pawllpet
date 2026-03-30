'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldCheck, Truck, RotateCcw, Package } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/product-types'
import { calculateTax } from '@/lib/tax-rates'
import { calculateShipping, calculateTotalWeight } from '@/lib/shipping-rates'
import { StateSelect, formatPhone } from '@/components/StateSelect'
import './checkout.css'

interface Addr {
  fullName: string; phone: string; street: string; street2: string
  city: string; state: string; zip: string; country: string
}

const emptyAddr: Addr = { fullName: '', phone: '', street: '', street2: '', city: '', state: '', zip: '', country: 'US' }

export default function CheckoutPage() {
  const { items } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [savedAddrs, setSavedAddrs] = useState<Addr[]>([])
  const [selectedSaved, setSelectedSaved] = useState<number>(0)
  const [useNew, setUseNew] = useState(false)
  const [form, setForm] = useState<Addr>({ ...emptyAddr })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  // Two-step flow
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth?tab=login'); return }
    if (!authLoading && items.length === 0) { router.push('/cart'); return }
  }, [authLoading, user, items, router])

  useEffect(() => {
    if (items.length === 0) return
    Promise.all([
      fetch(`/api/products?ids=${items.map(i => i.productId).join(',')}`).then(r => r.json()),
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

  // Calculate weight, shipping, tax only after address confirmed
  const currentAddr = useNew ? form : savedAddrs[selectedSaved]
  const totalWeight = calculateTotalWeight(cartProducts.map(p => ({ quantity: p.quantity, weight: p.weight || undefined })))
  const shippingInfo = calculateShipping(totalWeight, shippingMethod, subtotal)
  const standardInfo = calculateShipping(totalWeight, 'standard', subtotal)
  const expressInfo = calculateShipping(totalWeight, 'express', subtotal)
  const { rate: taxRate, amount: tax, stateAbbr: taxState } = addressConfirmed
    ? calculateTax(subtotal, currentAddr?.state || '')
    : { rate: 0, amount: 0, stateAbbr: '' }
  const total = subtotal + shippingInfo.cost + tax

  function setField(field: keyof Addr, val: string) {
    setForm(f => ({ ...f, [field]: val.trimStart() }))
  }

  function handleConfirmAddress() {
    const addr = useNew ? form : savedAddrs[selectedSaved]
    if (!addr) { setError('Please select or enter an address'); return }
    if (!addr.fullName?.trim() || !addr.street?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.zip?.trim()) {
      setError('Please fill in all required fields'); return
    }
    setError('')
    setAddressConfirmed(true)
  }

  function handleEditAddress() {
    setAddressConfirmed(false)
  }

  async function handlePay() {
    const addr = useNew ? form : savedAddrs[selectedSaved]
    if (!addr) return

    const trimmed = {
      fullName: addr.fullName.trim(),
      phone: addr.phone?.trim() || '',
      street: `${addr.street.trim()}${addr.street2?.trim() ? ', ' + addr.street2.trim() : ''}`,
      city: addr.city.trim(),
      state: addr.state.trim(),
      zip: addr.zip.trim(),
      country: addr.country || 'US',
    }

    setError('')
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: trimmed, shippingMethod }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Unable to start checkout. Please try again.')
        setPaying(false)
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
      setPaying(false)
    }
  }

  if (loading || authLoading) {
    return <main className="container checkout-page"><h1>Checkout</h1><p>Loading...</p></main>
  }

  return (
    <main className="container checkout-page">
      <Link href="/cart" className="checkout-back">
        <ArrowLeft size={14} /> Back to Cart
      </Link>
      <h1>Checkout</h1>

      <div className="checkout-layout">
        {/* Left: Address + Shipping */}
        <div className="checkout-form">
          <h2>Shipping Address</h2>

          {!addressConfirmed ? (
            <>
              {savedAddrs.length > 0 && (
                <div className="checkout-saved-addrs">
                  {savedAddrs.map((a, i) => (
                    <label key={i} className={`checkout-saved-addr ${!useNew && selectedSaved === i ? 'checkout-saved-addr--active' : ''}`}>
                      <input type="radio" name="addr" checked={!useNew && selectedSaved === i} onChange={() => { setSelectedSaved(i); setUseNew(false) }} />
                      <span>{a.fullName}, {a.street}, {a.city} {a.state} {a.zip}</span>
                    </label>
                  ))}
                  <button type="button" className="checkout-new-addr-btn" onClick={() => setUseNew(true)}>
                    {useNew ? '✓ New address' : '+ Enter a new address'}
                  </button>
                </div>
              )}

              {useNew && (
                <div className="checkout-form-fields">
                  <input placeholder="Full Name *" autoComplete="name" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
                  <input placeholder="Phone (xxx-xxx-xxxx)" autoComplete="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))} maxLength={12} />
                  <input placeholder="Street Address *" autoComplete="address-line1" value={form.street} onChange={e => setField('street', e.target.value)} />
                  <input placeholder="Apt, Suite, Unit (optional)" autoComplete="address-line2" value={form.street2} onChange={e => setField('street2', e.target.value)} />
                  <div className="checkout-form-row">
                    <input placeholder="City *" autoComplete="address-level2" value={form.city} onChange={e => setField('city', e.target.value)} />
                    <StateSelect value={form.state} onChange={val => setForm(f => ({ ...f, state: val }))} />
                    <input placeholder="ZIP *" autoComplete="postal-code" value={form.zip} onChange={e => setField('zip', e.target.value)} style={{ maxWidth: 100 }} />
                  </div>
                </div>
              )}

              {error && <p className="checkout-error">{error}</p>}

              <button className="checkout-confirm-btn" onClick={handleConfirmAddress}>
                Confirm Address →
              </button>
            </>
          ) : (
            <>
              {/* Confirmed Address Display */}
              <div className="checkout-confirmed-addr">
                <p><strong>{currentAddr?.fullName}</strong></p>
                <p>{currentAddr?.street}{currentAddr?.street2 ? `, ${currentAddr.street2}` : ''}</p>
                <p>{currentAddr?.city}, {currentAddr?.state} {currentAddr?.zip}</p>
                {currentAddr?.phone && <p>{currentAddr.phone}</p>}
                <button className="checkout-edit-addr" onClick={handleEditAddress}>Edit Address</button>
              </div>

              {/* Shipping Method Selection */}
              <h2 style={{ marginTop: '1.5rem' }}>Shipping Method</h2>
              <div className="checkout-shipping-options">
                <label className={`checkout-shipping-option ${shippingMethod === 'standard' ? 'checkout-shipping-option--active' : ''}`}>
                  <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                  <div className="checkout-shipping-info">
                    <Package size={18} />
                    <div>
                      <strong>{standardInfo.label}</strong>
                      <span>{standardInfo.estimate}</span>
                    </div>
                  </div>
                  <span className="checkout-shipping-price">{standardInfo.cost === 0 ? 'FREE' : `$${standardInfo.cost.toFixed(2)}`}</span>
                </label>
                <label className={`checkout-shipping-option ${shippingMethod === 'express' ? 'checkout-shipping-option--active' : ''}`}>
                  <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                  <div className="checkout-shipping-info">
                    <Truck size={18} />
                    <div>
                      <strong>{expressInfo.label}</strong>
                      <span>{expressInfo.estimate}</span>
                    </div>
                  </div>
                  <span className="checkout-shipping-price">${expressInfo.cost.toFixed(2)}</span>
                </label>
              </div>

              {error && <p className="checkout-error">{error}</p>}
            </>
          )}

          {/* Trust signals */}
          <div className="checkout-trust">
            <div className="checkout-trust-item"><ShieldCheck size={16} /> Secure checkout</div>
            <div className="checkout-trust-item"><Truck size={16} /> {shippingInfo.estimate}</div>
            <div className="checkout-trust-item"><RotateCcw size={16} /> 30-day returns</div>
          </div>
        </div>

        {/* Right: Summary */}
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
            <div className="checkout-row">
              <span>Shipping</span>
              <span>{addressConfirmed ? (shippingInfo.cost === 0 ? 'FREE' : `$${shippingInfo.cost.toFixed(2)}`) : '—'}</span>
            </div>
            <div className="checkout-row">
              <span>Tax{addressConfirmed && taxRate > 0 ? ` (${taxState} ${(taxRate * 100).toFixed(1)}%)` : ''}</span>
              <span>{addressConfirmed ? `$${tax.toFixed(2)}` : '—'}</span>
            </div>
            <div className="checkout-row checkout-row--total">
              <span>Total ({totalCount})</span>
              <span>{addressConfirmed ? `$${total.toFixed(2)} USD` : '—'}</span>
            </div>
          </div>

          {addressConfirmed ? (
            <button className="checkout-pay-btn" onClick={handlePay} disabled={paying}>
              <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {paying ? 'REDIRECTING TO PAYMENT...' : `PAY $${total.toFixed(2)}`}
            </button>
          ) : (
            <div className="checkout-pay-placeholder">
              Confirm your address to see shipping & tax
            </div>
          )}

          {subtotal < 80 && (
            <div className="checkout-free-shipping">Add <strong>${(80 - subtotal).toFixed(2)}</strong> more for free standard shipping!</div>
          )}
        </div>
      </div>
    </main>
  )
}

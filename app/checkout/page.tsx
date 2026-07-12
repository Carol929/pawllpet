'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, ShieldCheck, Truck, RotateCcw, Package } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Product } from '@/lib/product-types'
import { calculateTax } from '@/lib/tax-rates'
import { calculateTotalWeight, isShippingEligible, isPOBox, hasUnweighedItems } from '@/lib/shipping-rates'
import type { ShippingRateOption } from '@/lib/shipping'
import { StateSelect, formatPhone } from '@/components/StateSelect'
import './checkout.css'

interface Addr {
  fullName: string; phone: string; street: string; street2: string
  city: string; state: string; zip: string; country: string
}

const emptyAddr: Addr = { fullName: '', phone: '', street: '', street2: '', city: '', state: '', zip: '', country: 'US' }

function itemKey(productId: string, variantIndex?: number) {
  return variantIndex !== undefined ? `${productId}:${variantIndex}` : productId
}

export default function CheckoutPage() {
  const { items, loaded: cartLoaded } = useCart()
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

  // Shipping options fetched from /api/shipping/rates after address confirmed.
  // Replaces the previous hardcoded standard/express toggle.
  const [shippingOptions, setShippingOptions] = useState<ShippingRateOption[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  // Read selected item keys from cart page
  const [selectedKeys] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const raw = sessionStorage.getItem('checkout-selected')
      if (raw) return new Set<string>(JSON.parse(raw))
    } catch {}
    return new Set<string>()
  })

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth?tab=login'); return }
    // Only redirect to /cart once the cart has actually hydrated — otherwise a
    // hard refresh on /checkout bounces to /cart before localStorage loads,
    // losing the confirmed address and selected rate.
    if (!authLoading && cartLoaded && items.length === 0) { router.push('/cart'); return }
  }, [authLoading, user, items, router, cartLoaded])

  useEffect(() => {
    if (items.length === 0) return
    Promise.all([
      fetch(`/api/products?ids=${items.map(i => i.productId).join(',')}`).then(r => {
        if (!r.ok) throw new Error('products fetch failed')
        return r.json()
      }),
      fetch('/api/addresses').then(r => r.json()).catch(() => []),
    ]).then(([prodData, addrs]) => {
      const products = prodData.products || prodData || []
      const map: Record<string, Product> = {}
      products.forEach((p: Product) => { map[p.id] = p })
      setProductMap(map)
      setSavedAddrs(addrs)
      if (!addrs.length) setUseNew(true)
      setLoading(false)
    }).catch(() => {
      // Don't leave the page stuck on "Loading..." forever if products fail.
      setError('We could not load your cart. Please refresh and try again.')
      setLoading(false)
    })
  }, [items])

  // Filter to only selected items from cart
  const checkoutItems = selectedKeys.size > 0
    ? items.filter(item => selectedKeys.has(itemKey(item.productId, item.variantIndex)))
    : items

  const cartProducts = checkoutItems
    .map(item => {
      const p = productMap[item.productId]
      if (!p) return null
      // Prefer the current variant price/name from the DB over the values frozen
      // into the cart at add-time, so the displayed total matches what the
      // server will actually charge (which always re-prices from the DB).
      const liveVariant = p.variants && item.variantIndex !== undefined ? p.variants[item.variantIndex] : undefined
      const unitPrice = liveVariant?.price ?? item.variantPrice ?? p.price
      const variantName = liveVariant?.name ?? item.variantName
      return { ...p, quantity: item.quantity, unitPrice, variantName, variantIndex: item.variantIndex }
    })
    .filter(Boolean) as (Product & { quantity: number; unitPrice: number; variantName?: string; variantIndex?: number })[]

  const subtotal = cartProducts.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
  const totalCount = cartProducts.reduce((sum, p) => sum + p.quantity, 0)

  // Calculate weight, tax only after address confirmed.
  // Shipping cost comes from the selected option fetched from /api/shipping/rates.
  const currentAddr = useNew ? form : savedAddrs[selectedSaved]
  const totalWeight = calculateTotalWeight(cartProducts.map(p => ({ quantity: p.quantity, weight: p.weight || undefined })))
  const selectedOption = shippingOptions.find(o => o.id === selectedRateId) || shippingOptions[0] || null
  const shippingCost = selectedOption?.amount ?? 0
  const { rate: taxRate, amount: tax, stateAbbr: taxState } = addressConfirmed
    ? calculateTax(subtotal, currentAddr?.state || '')
    : { rate: 0, amount: 0, stateAbbr: '' }
  const total = subtotal + shippingCost + tax

  // Stable, value-based dependency keys for the shipping-rates effect below.
  // checkoutItems is a fresh array on every render (items.filter), and
  // form/savedAddrs are objects — depending on them directly re-ran the effect
  // every render, causing an infinite /api/shipping/rates refetch loop (which
  // exhausted the DB connection pool and tripped Shippo's 429 rate limit).
  // Serializing to strings makes the effect re-run only when the address or
  // item set actually changes.
  const ratesAddrKey = currentAddr
    ? [currentAddr.fullName, currentAddr.street, currentAddr.street2, currentAddr.city, currentAddr.state, currentAddr.zip].join('|')
    : ''
  const ratesItemsKey = checkoutItems.map(i => `${i.productId}:${i.quantity}`).join(',')

  function setField(field: keyof Addr, val: string) {
    setForm(f => ({ ...f, [field]: val.trimStart() }))
  }

  // Check for restricted states, PO Box, unweighed items
  const addrForCheck = useNew ? form : savedAddrs[selectedSaved]
  const stateEligibility = addrForCheck?.state ? isShippingEligible(addrForCheck.state) : { eligible: true }
  const poBoxDetected = addrForCheck ? isPOBox(addrForCheck.street || '') || isPOBox(addrForCheck.street2 || '') : false
  const missingWeights = hasUnweighedItems(cartProducts.map(p => ({ weight: p.weight || undefined })))

  function handleConfirmAddress() {
    const addr = useNew ? form : savedAddrs[selectedSaved]
    if (!addr) { setError('Please select or enter an address'); return }
    if (!addr.fullName?.trim() || !addr.street?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.zip?.trim()) {
      setError('Please fill in all required fields'); return
    }
    // Check restricted states
    const eligibility = isShippingEligible(addr.state)
    if (!eligibility.eligible) {
      setError(eligibility.reason || 'Shipping is not available to this location.'); return
    }
    // Check PO Box
    if (isPOBox(addr.street) || isPOBox(addr.street2 || '')) {
      setError('We currently cannot ship to PO Box, APO, or FPO addresses. Please enter a street address.'); return
    }
    setError('')
    setAddressConfirmed(true)
  }

  function handleEditAddress() {
    setAddressConfirmed(false)
    setShippingOptions([])
    setSelectedRateId(null)
  }

  // Fetch live shipping rates after address is confirmed.
  // Routes through /api/shipping/rates which uses Shippo or legacy based on
  // SHIPPING_PROVIDER. On Shippo failure the server falls back to legacy
  // automatically — frontend doesn't need to know which path ran.
  useEffect(() => {
    if (!addressConfirmed) return
    const addr = useNew ? form : savedAddrs[selectedSaved]
    if (!addr) return
    if (checkoutItems.length === 0) return

    let cancelled = false
    setShippingLoading(true)
    setShippingOptions([])
    setSelectedRateId(null)

    fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: {
          name: addr.fullName.trim(),
          street1: addr.street.trim(),
          street2: addr.street2?.trim() || undefined,
          city: addr.city.trim(),
          state: addr.state.trim(),
          zip: addr.zip.trim(),
          phone: addr.phone?.trim() || undefined,
        },
        items: checkoutItems.map(item => ({
          productId: item.productId,
          variantId: undefined,
          quantity: item.quantity,
        })),
        subtotal,
      }),
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Could not load shipping rates')
        return r.json()
      })
      .then((data: { options: ShippingRateOption[]; provider: string }) => {
        if (cancelled) return
        setShippingOptions(data.options)
        // Pre-select cheapest (options come back sorted cheapest-first from server)
        setSelectedRateId(data.options[0]?.id ?? null)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load shipping rates')
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Depend on serialized keys (not the array/object references) so this runs
    // only when the address or items actually change — see ratesAddrKey above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressConfirmed, ratesAddrKey, ratesItemsKey, subtotal])

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
        body: JSON.stringify({
          items: checkoutItems.map(item => {
            const p = productMap[item.productId]
            const variantId = p?.variants && item.variantIndex !== undefined
              ? p.variants[item.variantIndex]?.id
              : undefined
            return { productId: item.productId, quantity: item.quantity, variantId }
          }),
          shippingAddress: trimmed,
          // Send the selected rate ID plus its carrier/service. The server
          // re-quotes for the real cart + destination and matches on these, so
          // the price can't be tampered with and a cheap rate id can't be
          // replayed for a heavier parcel.
          shippingRateId: selectedRateId,
          shippingCarrier: selectedOption?.carrier,
          shippingService: selectedOption?.service,
        }),
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

              <p style={{ fontSize: '.8rem', color: '#888', marginTop: '.5rem' }}>
                Shipping available to contiguous US (48 states) only. Alaska, Hawaii, PO Box, APO/FPO addresses are not supported at this time.
              </p>

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

              {/* Shipping Method Selection — populated from /api/shipping/rates */}
              <h2 style={{ marginTop: '1.5rem' }}>Shipping Method</h2>
              <div className="checkout-shipping-options">
                {shippingLoading && <p style={{ padding: '.75rem', color: '#666' }}>Loading shipping rates...</p>}
                {!shippingLoading && shippingOptions.length === 0 && !error && (
                  <p style={{ padding: '.75rem', color: '#666' }}>No shipping options available for this address.</p>
                )}
                {!shippingLoading && shippingOptions.map(opt => {
                  const isExpress = opt.estimatedDays && opt.estimatedDays.max <= 3
                  const estimate = opt.estimatedDays
                    ? `${opt.estimatedDays.min}-${opt.estimatedDays.max} business days`
                    : ''
                  return (
                    <label
                      key={opt.id}
                      className={`checkout-shipping-option ${selectedRateId === opt.id ? 'checkout-shipping-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedRateId === opt.id}
                        onChange={() => setSelectedRateId(opt.id)}
                      />
                      <div className="checkout-shipping-info">
                        {isExpress ? <Truck size={18} /> : <Package size={18} />}
                        <div>
                          <strong>{opt.displayName}</strong>
                          <span>{estimate}</span>
                        </div>
                      </div>
                      <span className="checkout-shipping-price">
                        {opt.amount === 0 ? 'FREE' : `$${opt.amount.toFixed(2)}`}
                      </span>
                    </label>
                  )
                })}
              </div>

              {error && <p className="checkout-error">{error}</p>}
            </>
          )}

          {/* Trust signals */}
          <div className="checkout-trust">
            <div className="checkout-trust-item"><ShieldCheck size={16} /> Secure checkout</div>
            <div className="checkout-trust-item">
              <Truck size={16} />
              {selectedOption?.estimatedDays
                ? `${selectedOption.estimatedDays.min}-${selectedOption.estimatedDays.max} business days`
                : '5-7 business days'}
            </div>
            <div className="checkout-trust-item"><RotateCcw size={16} /> 30-day returns</div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="checkout-items">
            {cartProducts.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="checkout-item">
                <Image src={p.image} alt={p.name} width={56} height={56} sizes="56px" className="checkout-item-img" />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{p.name}</span>
                  {p.variantName && <span className="checkout-item-variant">{p.variantName}</span>}
                  <span className="checkout-item-qty">Qty: {p.quantity}</span>
                </div>
                <span className="checkout-item-price">${(p.unitPrice * p.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="checkout-row">
              <span>Shipping</span>
              <span>{addressConfirmed && selectedOption ? (shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`) : '—'}</span>
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

          {addressConfirmed && missingWeights ? (
            <div className="checkout-pay-placeholder" style={{ background: '#fff8e1', color: '#8b6914' }}>
              Some items are missing weight info. Please contact support@pawllpet.com — we can&apos;t calculate shipping without weights.
            </div>
          ) : null}

          {addressConfirmed ? (
            <button
              className="checkout-pay-btn"
              onClick={handlePay}
              disabled={paying || !selectedOption || shippingLoading || missingWeights}
            >
              <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {paying
                ? 'REDIRECTING TO PAYMENT...'
                : shippingLoading
                  ? 'LOADING SHIPPING...'
                  : missingWeights
                    ? 'SHIPPING UNAVAILABLE'
                    : !selectedOption
                      ? 'SHIPPING UNAVAILABLE'
                      : `PAY $${total.toFixed(2)}`}
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

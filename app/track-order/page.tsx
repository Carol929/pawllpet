'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { Search, Package, Truck, CheckCircle, Clock, CreditCard } from 'lucide-react'

interface OrderData { id: string; status: string; total: number; createdAt: string; trackingNumber?: string; carrier?: string; items: { id: string; name: string; quantity: number; price: number }[] }

// pending → paid → processing (label bought) → shipped (tracking added) → delivered.
// 'processing' was missing here, so Shippo-labelled orders rendered an empty timeline.
const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered']
const statusIcons = { pending: Clock, paid: CreditCard, processing: Package, shipped: Truck, delivered: CheckCircle }

// Minimal carrier tracking-link builder. Kept inline (not imported from
// lib/shipping) so this client page doesn't pull the server-side Shippo client
// into the browser bundle. Mirrors getCarrierTrackingUrl's carrier cases.
function carrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const t = encodeURIComponent(trackingNumber)
  switch (carrier.toLowerCase()) {
    case 'usps': return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`
    case 'ups': return `https://www.ups.com/track?tracknum=${t}`
    case 'fedex': return `https://www.fedex.com/fedextrack/?trknbr=${t}`
    case 'dhl':
    case 'dhl_express': return `https://www.dhl.com/en/express/tracking.html?AWB=${t}`
    default: return `https://tools.goshippo.com/track/${encodeURIComponent(carrier)}/${t}`
  }
}

export default function TrackOrderPage() {
  const { locale } = useLocale()
  const { user, loading: authLoading } = useAuth()
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true); setError(''); setOrder(null)
    try {
      const res = await fetch(`/api/orders/${query.trim()}`)
      if (res.ok) { setOrder(await res.json()) }
      else if (res.status === 401) { setError(locale === 'zh' ? '请先登录以查询您的订单' : 'Please sign in to look up your order') }
      else { setError(locale === 'zh' ? '未找到该订单（请确认订单号，并用下单时的账号登录）' : 'Order not found — check the ID and sign in with the account you ordered with') }
    } catch { setError(locale === 'zh' ? '查询失败' : 'Search failed') }
    setSearching(false)
  }

  const statusLabel: Record<string, { en: string; zh: string }> = {
    pending: { en: 'Pending Payment', zh: '待付款' }, paid: { en: 'Payment Received', zh: '已付款' },
    processing: { en: 'Processing', zh: '备货中' },
    shipped: { en: 'Shipped', zh: '已发货' }, delivered: { en: 'Delivered', zh: '已送达' },
    cancelled: { en: 'Cancelled', zh: '已取消' },
  }

  const currentStep = order ? statusSteps.indexOf(order.status) : -1

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '订单追踪' : 'Track Your Order'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '登录后输入订单号查询状态，或在账户页查看全部订单' : 'Sign in, then enter your order ID — or see all your orders in your account'}</p>

      {!authLoading && !user ? (
        <div className="track-signin-prompt">
          <p>{locale === 'zh' ? '订单与您的账户关联，请先登录再查询。' : 'Orders are tied to your account — please sign in to track one.'}</p>
          <Link href="/auth?tab=login&redirect=%2Ftrack-order" className="btn-primary">{locale === 'zh' ? '登录' : 'Sign In'}</Link>
        </div>
      ) : (
        <div className="track-search">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={locale === 'zh' ? '输入订单号...' : 'Enter order ID...'} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button className="btn-primary" onClick={handleSearch} disabled={searching}><Search size={16} /> {searching ? '...' : locale === 'zh' ? '查询' : 'Search'}</button>
        </div>
      )}

      {error && <p className="track-error">{error}</p>}

      {order && (
        <div className="track-result">
          <div className="track-header">
            <div>
              <h2>#{order.id.slice(-8).toUpperCase()}</h2>
              <p>{locale === 'zh' ? '下单时间' : 'Placed on'}: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="track-total">${order.total.toFixed(2)}</div>
          </div>

          {order.status !== 'cancelled' && (
            <div className="track-timeline">
              {statusSteps.map((step, i) => {
                const Icon = statusIcons[step as keyof typeof statusIcons]
                const active = i <= currentStep
                return (
                  <div key={step} className={`track-step ${active ? 'track-step--active' : ''}`}>
                    <div className="track-step-icon"><Icon size={20} /></div>
                    <span>{(statusLabel[step] as Record<string, string>)?.[locale] || statusLabel[step]?.en || step}</span>
                    {i < statusSteps.length - 1 && <div className={`track-step-line ${i < currentStep ? 'track-step-line--active' : ''}`} />}
                  </div>
                )
              })}
            </div>
          )}

          {order.trackingNumber && (
            <div className="track-tracking">
              <Truck size={16} /> {locale === 'zh' ? '物流单号' : 'Tracking #'}:{' '}
              {order.carrier ? (
                <a href={carrierTrackingUrl(order.carrier, order.trackingNumber)} target="_blank" rel="noopener noreferrer"><strong>{order.trackingNumber}</strong></a>
              ) : (
                <strong>{order.trackingNumber}</strong>
              )}
            </div>
          )}

          <div className="track-items">
            <h3>{locale === 'zh' ? '订单商品' : 'Items'}</h3>
            {order.items.map(item => (
              <div key={item.id} className="track-item">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

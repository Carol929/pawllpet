'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react'

interface OrderData { id: string; status: string; total: number; createdAt: string; trackingNumber?: string; items: { id: string; name: string; quantity: number; price: number }[] }

const statusSteps = ['pending', 'paid', 'shipped', 'delivered']
const statusIcons = { pending: Clock, paid: Package, shipped: Truck, delivered: CheckCircle }

export default function TrackOrderPage() {
  const { locale } = useLocale()
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
      else { setError(locale === 'zh' ? '未找到该订单' : 'Order not found') }
    } catch { setError(locale === 'zh' ? '查询失败' : 'Search failed') }
    setSearching(false)
  }

  const statusLabel: Record<string, { en: string; zh: string }> = {
    pending: { en: 'Pending Payment', zh: '待付款' }, paid: { en: 'Payment Received', zh: '已付款' },
    shipped: { en: 'Shipped', zh: '已发货' }, delivered: { en: 'Delivered', zh: '已送达' },
    cancelled: { en: 'Cancelled', zh: '已取消' },
  }

  const currentStep = order ? statusSteps.indexOf(order.status) : -1

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '订单追踪' : 'Track Your Order'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '输入订单号查询订单状态' : 'Enter your order ID to check the status'}</p>

      <div className="track-search">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder={locale === 'zh' ? '输入订单号...' : 'Enter order ID...'} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="btn-primary" onClick={handleSearch} disabled={searching}><Search size={16} /> {searching ? '...' : locale === 'zh' ? '查询' : 'Search'}</button>
      </div>

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
                    <span>{statusLabel[step]?.[locale] || step}</span>
                    {i < statusSteps.length - 1 && <div className={`track-step-line ${i < currentStep ? 'track-step-line--active' : ''}`} />}
                  </div>
                )
              })}
            </div>
          )}

          {order.trackingNumber && (
            <div className="track-tracking">
              <Truck size={16} /> {locale === 'zh' ? '物流单号' : 'Tracking #'}: <strong>{order.trackingNumber}</strong>
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

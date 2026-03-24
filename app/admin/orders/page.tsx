'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Truck } from 'lucide-react'

interface OrderItem { id: string; name: string; image: string; price: number; quantity: number }
interface Order { id: string; status: string; total: number; subtotal: number; shipping: number; createdAt: string; trackingNumber?: string; user: { fullName: string; email: string }; items: OrderItem[]; shippingAddress: { fullName?: string; street?: string; city?: string; state?: string; zip?: string } }

const statusOptions = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']
const statusColors: Record<string, string> = { pending: '#f59e0b', paid: '#3b82f6', shipped: '#8b5cf6', delivered: '#16a34a', cancelled: '#dc2626' }

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [updating, setUpdating] = useState(false)

  function load() {
    const params = new URLSearchParams({ page: String(page), status })
    if (search) params.set('search', search)
    fetch(`/api/admin/orders?${params}`).then(r => r.json()).then(d => {
      setOrders(d.orders || []); setTotal(d.total || 0); setPages(d.pages || 1)
    })
  }
  useEffect(load, [page, status, search])

  async function updateOrder(id: string, data: Record<string, string>) {
    setUpdating(true)
    await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setUpdating(false)
    load()
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, ...data } : null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1><Package size={22} /> Orders ({total})</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input placeholder="Search order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-tabs">
          {statusOptions.map(s => (
            <button key={s} className={`admin-tab ${status === s ? 'admin-tab--active' : ''}`} onClick={() => { setStatus(s); setPage(1) }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="admin-detail">
          <button className="btn-secondary btn-sm" onClick={() => setSelected(null)}>← Back</button>
          <h2>Order #{selected.id.slice(-8).toUpperCase()}</h2>
          <div className="admin-detail-grid">
            <div>
              <h3>Customer</h3>
              <p>{selected.user.fullName} ({selected.user.email})</p>
              <h3>Shipping Address</h3>
              <p>{selected.shippingAddress?.fullName}<br/>{selected.shippingAddress?.street}<br/>{selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.zip}</p>
              <h3>Items</h3>
              {selected.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt="" className="order-item-img" />
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="admin-detail-totals">
                <div>Subtotal: ${selected.subtotal.toFixed(2)}</div>
                <div>Shipping: {selected.shipping === 0 ? 'FREE' : `$${selected.shipping.toFixed(2)}`}</div>
                <div><strong>Total: ${selected.total.toFixed(2)}</strong></div>
              </div>
            </div>
            <div>
              <h3>Status</h3>
              <select value={selected.status} onChange={e => updateOrder(selected.id, { status: e.target.value })} disabled={updating}>
                {statusOptions.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <h3 style={{ marginTop: '1rem' }}>Tracking Number</h3>
              <div className="admin-tracking-input">
                <input value={trackingInput || selected.trackingNumber || ''} onChange={e => setTrackingInput(e.target.value)} placeholder="Enter tracking #" />
                <button className="btn-primary btn-sm" onClick={() => updateOrder(selected.id, { trackingNumber: trackingInput })} disabled={updating}>
                  <Truck size={14} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => { setSelected(o); setTrackingInput(o.trackingNumber || '') }} className="admin-table-row--clickable">
                  <td>#{o.id.slice(-8).toUpperCase()}</td>
                  <td>{o.user.fullName}</td>
                  <td><span className="admin-badge" style={{ background: statusColors[o.status] || '#888' }}>{o.status}</span></td>
                  <td>${o.total.toFixed(2)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No orders found</td></tr>}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

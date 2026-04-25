'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Truck, AlertTriangle } from 'lucide-react'

interface OrderItem { id: string; name: string; image: string; price: number; quantity: number }
interface Order {
  id: string; status: string; total: number; subtotal: number; shipping: number; createdAt: string
  trackingNumber?: string
  cancellationReason?: string | null
  cancellationRequestedAt?: string | null
  cancelledAt?: string | null
  resolution?: string | null
  refundAmount?: number | null
  adminNote?: string | null
  user: { fullName: string; email: string }
  items: OrderItem[]
  shippingAddress: { fullName?: string; street?: string; city?: string; state?: string; zip?: string }
}

const statusOptions = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancellation_requested', 'cancelled']
const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#16a34a',
  cancellation_requested: '#ea580c',
  cancelled: '#dc2626',
}

const resolutionOptions = [
  { value: 'full_refund', label: 'Full refund (100%)' },
  { value: 'partial_50', label: 'Partial refund (50%)' },
  { value: 'reship', label: 'No refund - reship replacement' },
  { value: 'no_action', label: 'No refund - no action' },
  { value: 'other', label: 'Other (custom)' },
]

function statusLabel(s: string): string {
  if (s === 'cancellation_requested') return 'Cancellation Requested'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

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

  // Cancellation form state
  const [resolution, setResolution] = useState('full_refund')
  const [refundAmountInput, setRefundAmountInput] = useState('')
  const [adminNoteInput, setAdminNoteInput] = useState('')
  const [adminReasonInput, setAdminReasonInput] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)

  function load() {
    const params = new URLSearchParams({ page: String(page), status })
    if (search) params.set('search', search)
    fetch(`/api/admin/orders?${params}`).then(r => r.json()).then(d => {
      setOrders(d.orders || []); setTotal(d.total || 0); setPages(d.pages || 1)
    })
  }
  useEffect(load, [page, status, search])

  // Auto-fill refund amount when resolution changes
  useEffect(() => {
    if (!selected) return
    if (resolution === 'full_refund') setRefundAmountInput(selected.total.toFixed(2))
    else if (resolution === 'partial_50') setRefundAmountInput((selected.total * 0.5).toFixed(2))
    else if (resolution === 'reship' || resolution === 'no_action') setRefundAmountInput('0.00')
    // For 'other', leave whatever the admin typed
  }, [resolution, selected])

  function openOrder(o: Order) {
    setSelected(o)
    setTrackingInput(o.trackingNumber || '')
    setResolution(o.resolution || 'full_refund')
    setRefundAmountInput(o.refundAmount != null ? o.refundAmount.toFixed(2) : o.total.toFixed(2))
    setAdminNoteInput(o.adminNote || '')
    setAdminReasonInput('')
    setCancelError(null)
  }

  async function updateOrder(id: string, data: Record<string, unknown>) {
    setUpdating(true)
    setCancelError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setCancelError(result.error || 'Update failed')
        return
      }
      load()
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, ...result } : null)
      }
    } finally {
      setUpdating(false)
    }
  }

  async function confirmCancellation() {
    if (!selected) return
    const refundNum = Number(refundAmountInput)
    if (!Number.isFinite(refundNum) || refundNum < 0) {
      setCancelError('Refund amount must be a number >= 0')
      return
    }
    const payload: Record<string, unknown> = {
      status: 'cancelled',
      resolution,
      refundAmount: refundNum,
      adminNote: adminNoteInput.trim(),
    }
    // For admin-initiated (no existing user reason) require admin to provide one
    if (!selected.cancellationReason && !adminReasonInput.trim()) {
      setCancelError('A reason is required to cancel this order.')
      return
    }
    if (adminReasonInput.trim()) {
      payload.cancellationReason = adminReasonInput.trim()
    }
    await updateOrder(selected.id, payload)
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
              {s === 'all' ? 'All' : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="admin-detail">
          <button className="btn-secondary btn-sm" onClick={() => setSelected(null)}>← Back</button>
          <h2>Order #{selected.id.slice(-8).toUpperCase()}</h2>

          {selected.status === 'cancellation_requested' && (
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #b91c1c', borderRadius: 8, padding: '1rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                <AlertTriangle size={18} color="#b91c1c" />
                <strong style={{ color: '#b91c1c' }}>Cancellation Requested</strong>
                {selected.cancellationRequestedAt && (
                  <span style={{ fontSize: '.85rem', color: '#666' }}>
                    on {new Date(selected.cancellationRequestedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '.9rem', color: '#444', lineHeight: 1.5 }}>
                <strong>Customer&apos;s reason:</strong>
                <div style={{ background: '#fff', padding: '.6rem', borderRadius: 6, marginTop: '.4rem', whiteSpace: 'pre-wrap' }}>
                  {selected.cancellationReason || '(no reason provided)'}
                </div>
              </div>
            </div>
          )}

          {selected.status === 'cancelled' && selected.resolution && (
            <div style={{ background: '#f8f6f2', borderLeft: '4px solid #6b7280', borderRadius: 8, padding: '1rem', margin: '1rem 0', fontSize: '.9rem' }}>
              <div><strong>Resolution:</strong> {resolutionOptions.find(r => r.value === selected.resolution)?.label || selected.resolution}</div>
              {typeof selected.refundAmount === 'number' && <div style={{ marginTop: '.3rem' }}><strong>Refund amount:</strong> ${selected.refundAmount.toFixed(2)}</div>}
              {selected.cancelledAt && <div style={{ marginTop: '.3rem', color: '#666' }}>Finalized {new Date(selected.cancelledAt).toLocaleString()}</div>}
              {selected.cancellationReason && (
                <div style={{ marginTop: '.5rem' }}>
                  <strong>Reason:</strong>
                  <div style={{ background: '#fff', padding: '.5rem', borderRadius: 6, marginTop: '.3rem', whiteSpace: 'pre-wrap' }}>{selected.cancellationReason}</div>
                </div>
              )}
              {selected.adminNote && (
                <div style={{ marginTop: '.5rem' }}>
                  <strong>Admin note:</strong>
                  <div style={{ background: '#fff', padding: '.5rem', borderRadius: 6, marginTop: '.3rem', whiteSpace: 'pre-wrap' }}>{selected.adminNote}</div>
                </div>
              )}
            </div>
          )}

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
              <select value={selected.status} onChange={e => updateOrder(selected.id, { status: e.target.value })} disabled={updating || selected.status === 'cancellation_requested'}>
                {statusOptions.filter(s => s !== 'all').map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              {selected.status === 'cancellation_requested' && (
                <p style={{ fontSize: '.8rem', color: '#666', marginTop: '.4rem' }}>Use the cancellation form below to finalize.</p>
              )}

              <h3 style={{ marginTop: '1rem' }}>Tracking Number</h3>
              <div className="admin-tracking-input">
                <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="Enter tracking #" />
                <button className="btn-primary btn-sm" onClick={() => updateOrder(selected.id, { trackingNumber: trackingInput })} disabled={updating}>
                  <Truck size={14} /> Save
                </button>
              </div>

              {/* Cancellation form: shown for cancellation_requested OR for any non-cancelled order (admin-initiated) */}
              {selected.status !== 'cancelled' && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #fecaca', borderRadius: 8, background: '#fffafa' }}>
                  <h3 style={{ margin: '0 0 .75rem', color: '#b91c1c' }}>
                    {selected.status === 'cancellation_requested' ? 'Process Cancellation' : 'Cancel This Order'}
                  </h3>

                  {!selected.cancellationReason && (
                    <div style={{ marginBottom: '.75rem' }}>
                      <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>
                        Reason (required) *
                      </label>
                      <textarea
                        value={adminReasonInput}
                        onChange={e => setAdminReasonInput(e.target.value)}
                        rows={2}
                        placeholder="Why is this order being cancelled?"
                        style={{ width: '100%', padding: '.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.85rem', fontFamily: 'inherit' }}
                        disabled={updating}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '.75rem' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>Resolution</label>
                    <select value={resolution} onChange={e => setResolution(e.target.value)} disabled={updating} style={{ width: '100%' }}>
                      {resolutionOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: '.75rem' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>Refund amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={refundAmountInput}
                      onChange={e => setRefundAmountInput(e.target.value)}
                      style={{ width: '100%', padding: '.4rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                      disabled={updating}
                    />
                    <p style={{ fontSize: '.75rem', color: '#666', margin: '.3rem 0 0' }}>
                      Refund must be issued manually in Stripe Dashboard. This is for record-keeping only.
                    </p>
                  </div>

                  <div style={{ marginBottom: '.75rem' }}>
                    <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>Admin note (sent to customer)</label>
                    <textarea
                      value={adminNoteInput}
                      onChange={e => setAdminNoteInput(e.target.value)}
                      rows={3}
                      placeholder="Optional message included in the customer's email"
                      style={{ width: '100%', padding: '.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.85rem', fontFamily: 'inherit' }}
                      disabled={updating}
                    />
                  </div>

                  {cancelError && (
                    <p style={{ color: '#b91c1c', fontSize: '.85rem', margin: '0 0 .5rem' }}>{cancelError}</p>
                  )}

                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    style={{ background: '#b91c1c', width: '100%' }}
                    onClick={confirmCancellation}
                    disabled={updating}
                  >
                    {updating ? 'Processing...' : 'Confirm Cancellation & Email Customer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => openOrder(o)} className="admin-table-row--clickable">
                  <td>#{o.id.slice(-8).toUpperCase()}</td>
                  <td>{o.user.fullName}</td>
                  <td>
                    <span className="admin-badge" style={{ background: statusColors[o.status] || '#888' }}>{statusLabel(o.status)}</span>
                    {o.status === 'cancellation_requested' && <AlertTriangle size={14} color="#b91c1c" style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                  </td>
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

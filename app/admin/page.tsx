'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Eye, FileEdit, AlertTriangle, ShoppingCart, DollarSign, Users } from 'lucide-react'

interface Stats { total: number; live: number; draft: number; lowStock: number; orderCount: number; revenue: number; customerCount: number }
interface RecentOrder { id: string; status: string; total: number; createdAt: string; user: { fullName: string } }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, live: 0, draft: 0, lowStock: 0, orderCount: 0, revenue: 0, customerCount: 0 })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products?limit=1000').then(r => r.json()),
      fetch('/api/admin/orders?page=1').then(r => r.json()).catch(() => ({ orders: [], total: 0 })),
      fetch('/api/admin/customers?page=1').then(r => r.json()).catch(() => ({ total: 0 })),
    ]).then(([prodData, orderData, custData]) => {
      const products = prodData.products || []
      const orders = orderData.orders || []
      // Mirror the products list: stock lives in variants for variant products,
      // so aggregate those instead of reading the (often 0) base stock field.
      const effectiveStock = (p: { stock: number; variants?: { stock: number }[] }) =>
        p.variants && p.variants.length > 0 ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : p.stock
      setStats({
        total: prodData.total || 0,
        live: products.filter((p: { status: string }) => p.status === 'live').length,
        draft: products.filter((p: { status: string }) => p.status === 'draft').length,
        lowStock: products.filter((p: { stock: number; variants?: { stock: number }[] }) => effectiveStock(p) <= 5).length,
        orderCount: orderData.total || 0,
        // All-time revenue comes from the server aggregate, not this page's ≤20 orders.
        revenue: orderData.revenue || 0,
        customerCount: custData.total || 0,
      })
      setRecentOrders(orders.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending', paid: 'Paid', processing: 'Processing', shipped: 'Shipped',
    delivered: 'Delivered', cancelled: 'Cancelled', cancellation_requested: 'Cancellation requested',
  }
  const statusLabel = (s: string) => STATUS_LABELS[s] || s.replace(/_/g, ' ')

  // KPIs first, then catalog figures. Low Stock renders as an alert only when > 0.
  const cards = [
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: '#16a34a' },
    { label: 'Total Orders', value: stats.orderCount, icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Customers', value: stats.customerCount, icon: Users, color: '#8b5cf6' },
    { label: 'Total Products', value: stats.total, icon: Package, color: '#1f2e44' },
    { label: 'Live', value: stats.live, icon: Eye, color: '#16a34a' },
    { label: 'Draft', value: stats.draft, icon: FileEdit, color: '#d97706' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: '#d97706', alert: stats.lowStock > 0 },
  ]

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-subtitle">Overview of your store</p>
        </div>
        <div className="admin-header-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn" aria-label="View store (opens in new tab)">View store</a>
        </div>
      </div>

      {loading ? (
        <div className="admin-skeleton-stats" role="status" aria-busy="true">
          <span className="sr-only">Loading dashboard…</span>
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="admin-skeleton-card" aria-hidden="true" />)}
        </div>
      ) : (
        <>
          <div className="admin-stats">
            {cards.map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className={`admin-stat-card ${card.alert ? 'admin-stat-card--alert' : ''}`}>
                  <h3>
                    <span className="admin-stat-icon" style={{ background: `${card.color}22`, color: card.color }}>
                      <Icon size={18} />
                    </span>
                    {card.label}
                  </h3>
                  <div className="stat-value">{card.value}</div>
                </div>
              )
            })}
          </div>

          <div className="admin-section-head">
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className="admin-section-link">View all →</Link>
          </div>
          <div className="admin-table-wrapper">
            {recentOrders.length > 0 ? (
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="num">Total</th><th>Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><Link href="/admin/orders" style={{ color: 'var(--gold-ink)', fontWeight: 600 }}>#{o.id.slice(-8).toUpperCase()}</Link></td>
                      <td>{o.user.fullName}</td>
                      <td><span className={`admin-badge admin-badge--${o.status}`}>{statusLabel(o.status)}</span></td>
                      <td className="num">${o.total.toFixed(2)}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty"><p>No orders yet.</p></div>
            )}
          </div>
        </>
      )}
    </>
  )
}

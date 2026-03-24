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
      setStats({
        total: prodData.total || 0,
        live: products.filter((p: { status: string }) => p.status === 'live').length,
        draft: products.filter((p: { status: string }) => p.status === 'draft').length,
        lowStock: products.filter((p: { stock: number }) => p.stock <= 5).length,
        orderCount: orderData.total || 0,
        revenue: orders.reduce((s: number, o: { total: number; status: string }) => o.status !== 'cancelled' ? s + o.total : s, 0),
        customerCount: custData.total || 0,
      })
      setRecentOrders(orders.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const statusColors: Record<string, string> = { pending: '#f59e0b', paid: '#3b82f6', shipped: '#8b5cf6', delivered: '#16a34a', cancelled: '#dc2626' }

  const cards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: '#1f2e44' },
    { label: 'Live', value: stats.live, icon: Eye, color: '#16a34a' },
    { label: 'Draft', value: stats.draft, icon: FileEdit, color: '#d97706' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: '#dc2626' },
    { label: 'Total Orders', value: stats.orderCount, icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: '#16a34a' },
    { label: 'Customers', value: stats.customerCount, icon: Users, color: '#8b5cf6' },
  ]

  return (
    <>
      <div className="admin-header"><h1>Dashboard</h1></div>
      {loading ? <div className="admin-loading">Loading...</div> : (
        <>
          <div className="admin-stats">
            {cards.map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className="admin-stat-card">
                  <h3><Icon size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: card.color }} />{card.label}</h3>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                </div>
              )
            })}
          </div>

          {recentOrders.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '.75rem' }}>Recent Orders</h2>
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><Link href="/admin/orders" style={{ color: '#D4B28C' }}>#{o.id.slice(-8).toUpperCase()}</Link></td>
                      <td>{o.user.fullName}</td>
                      <td><span className="admin-badge" style={{ background: statusColors[o.status] || '#888' }}>{o.status}</span></td>
                      <td>${o.total.toFixed(2)}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}

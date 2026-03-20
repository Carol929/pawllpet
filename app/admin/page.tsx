'use client'

import { useEffect, useState } from 'react'
import { Package, Eye, FileEdit, AlertTriangle } from 'lucide-react'

interface Stats {
  total: number
  live: number
  draft: number
  lowStock: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, live: 0, draft: 0, lowStock: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/products?limit=1000')
      .then(r => r.json())
      .then(data => {
        const products = data.products || []
        setStats({
          total: data.total || 0,
          live: products.filter((p: { status: string }) => p.status === 'live').length,
          draft: products.filter((p: { status: string }) => p.status === 'draft').length,
          lowStock: products.filter((p: { stock: number }) => p.stock <= 5).length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: '#1f2e44' },
    { label: 'Live', value: stats.live, icon: Eye, color: '#16a34a' },
    { label: 'Draft', value: stats.draft, icon: FileEdit, color: '#d97706' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: '#dc2626' },
  ]

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
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
      )}
    </>
  )
}

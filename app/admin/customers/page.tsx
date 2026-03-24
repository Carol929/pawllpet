'use client'

import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'

interface Customer { id: string; fullName: string; email: string; phone?: string; petType?: string; createdAt: string; _count: { orders: number } }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    fetch(`/api/admin/customers?${params}`).then(r => r.json()).then(d => {
      setCustomers(d.customers || []); setTotal(d.total || 0); setPages(d.pages || 1)
    })
  }, [page, search])

  return (
    <div>
      <div className="admin-page-header">
        <h1><Users size={22} /> Customers ({total})</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Pet Type</th><th>Orders</th><th>Joined</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.fullName}</td>
              <td>{c.email}</td>
              <td>{c.phone || '—'}</td>
              <td>{c.petType || '—'}</td>
              <td>{c._count.orders}</td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {!customers.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No customers found</td></tr>}
        </tbody>
      </table>

      {pages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'

interface ProductItem {
  id: string
  name: string
  slug: string
  status: string
  price: number
  stock: number
  description: string
  categoryId: string | null
  petType: string
  category: { name: string } | null
  categories: { id: string; name: string }[]
  variants: { price: number; stock: number }[]
  images: { url: string }[]
  _count: { variants: number }
}

function displayPrice(p: ProductItem) {
  if (p.price > 0) return p.price
  if (p.variants.length > 0) return Math.min(...p.variants.map(v => v.price))
  return 0
}

function displayStock(p: ProductItem) {
  if (p.variants.length > 0) return p.variants.reduce((sum, v) => sum + v.stock, 0)
  return p.stock
}

function isIncomplete(p: ProductItem) {
  return !p.description || !p.categoryId || !p.petType || !p.category
}

const statusTabs = ['all', 'live', 'draft', 'archived']

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (status !== 'all') params.set('status', status)

    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, search, status])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setToast({ msg: 'Product deleted', type: 'success' })
      fetchProducts()
    } else {
      setToast({ msg: 'Failed to delete', type: 'error' })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h1>Products ({total})</h1>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-toolbar">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              className="admin-search"
              style={{ paddingLeft: 34 }}
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="admin-tabs">
            {statusTabs.map(tab => (
              <button
                key={tab}
                className={`admin-tab ${status === tab ? 'active' : ''}`}
                onClick={() => { setStatus(tab); setPage(1) }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <Package size={48} strokeWidth={1} />
            <p>No products found</p>
            <Link href="/admin/products/new" className="admin-btn admin-btn-primary" style={{ marginTop: 8 }}>
              <Plus size={16} /> Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Variants</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt="" className="product-thumb" />
                      ) : (
                        <div className="product-thumb" style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="#ccc" />
                        </div>
                      )}
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                      {isIncomplete(p) && <span className="badge badge-incomplete" title="Missing required fields">Incomplete</span>}
                    </td>
                    <td>{p.categories?.length > 0 ? p.categories.map(c => c.name).join(', ') : p.category?.name}</td>
                    <td>${displayPrice(p).toFixed(2)}{p.price === 0 && p.variants.length > 0 && <span style={{ fontSize: '.75rem', color: '#6b7280' }}> (variant)</span>}</td>
                    <td>{displayStock(p)}</td>
                    <td>{p._count.variants}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link href={`/admin/products/${p.id}/edit`} className="admin-btn admin-btn-sm">
                          <Pencil size={14} />
                        </Link>
                        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

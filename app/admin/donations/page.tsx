'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HandHeart,
  Percent,
  PiggyBank,
  ShoppingCart,
  Upload,
  Pencil,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react'

interface Donation {
  id: string
  organization: string
  amount: number
  donatedAt: string
  note: string | null
  link: string | null
  imageUrl: string | null
}

interface GivingStats {
  pledged: number
  donated: number
  orderCount: number
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const emptyForm = {
  organization: '',
  amount: '',
  donatedAt: new Date().toISOString().slice(0, 10),
  link: '',
  imageUrl: '',
  note: '',
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<GivingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const refresh = useCallback(async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        fetch('/api/admin/donations'),
        fetch('/api/giving'),
      ])
      if (donationsRes.ok) {
        const d = await donationsRes.json()
        setDonations(d.donations || [])
      }
      if (statsRes.ok) {
        const s = await statsRes.json()
        setStats({ pledged: s.pledged, donated: s.donated, orderCount: s.orderCount })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateField = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const resetForm = () => {
    setForm({ ...emptyForm, donatedAt: new Date().toISOString().slice(0, 10) })
    setEditingId(null)
  }

  const startEdit = (d: Donation) => {
    setEditingId(d.id)
    setForm({
      organization: d.organization,
      amount: String(d.amount),
      donatedAt: d.donatedAt.slice(0, 10),
      link: d.link || '',
      imageUrl: d.imageUrl || '',
      note: d.note || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.organization.trim()) return showToast('Organization is required', 'error')
    if (!Number.isFinite(amount) || amount <= 0)
      return showToast('Amount must be greater than 0', 'error')

    setSaving(true)
    try {
      const payload = {
        organization: form.organization.trim(),
        amount,
        donatedAt: form.donatedAt,
        link: form.link.trim(),
        imageUrl: form.imageUrl.trim(),
        note: form.note.trim(),
      }
      const res = await fetch(
        editingId ? `/api/admin/donations/${editingId}` : '/api/admin/donations',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return showToast(data.error || 'Save failed', 'error')
      showToast(editingId ? 'Donation updated' : 'Donation recorded', 'success')
      resetForm()
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(d: Donation) {
    if (
      !window.confirm(
        `Delete the ${usd(d.amount)} donation to "${d.organization}"? This cannot be undone.`,
      )
    )
      return
    const res = await fetch(`/api/admin/donations/${d.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return showToast(data.error || 'Delete failed', 'error')
    }
    showToast('Donation deleted', 'success')
    refresh()
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return showToast(data.error || 'Upload failed', 'error')
      updateField('imageUrl', data.url)
      showToast('Photo uploaded', 'success')
    } finally {
      setUploading(false)
    }
  }

  const remaining = stats ? Math.max(0, stats.pledged - stats.donated) : 0

  const cards = stats
    ? [
        {
          label: 'Pledged (1% of orders)',
          value: usd(stats.pledged),
          icon: Percent,
          color: '#D4B28C',
        },
        { label: 'Donated so far', value: usd(stats.donated), icon: HandHeart, color: '#16a34a' },
        {
          label: 'Remaining to donate',
          value: usd(remaining),
          icon: PiggyBank,
          color: '#1f2e44',
          alert: remaining > 0,
        },
        {
          label: 'Orders contributing',
          value: stats.orderCount.toLocaleString(),
          icon: ShoppingCart,
          color: '#6366f1',
        },
      ]
    : []

  return (
    <div>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <div>
          <h1>Donations</h1>
          <p className="admin-subtitle">
            PawLL Gives Back — the 1% pledge is computed automatically; record each payout here.
            Shown publicly on /giving.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-skeleton-stats" role="status" aria-busy="true">
          <span className="sr-only">Loading donations…</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-skeleton-card" aria-hidden="true" />
          ))}
        </div>
      ) : (
        <>
          {stats && (
            <div className="admin-stats">
              {cards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className={`admin-stat-card ${card.alert ? 'admin-stat-card--alert' : ''}`}
                  >
                    <h3>
                      <span
                        className="admin-stat-icon"
                        style={{ background: `${card.color}22`, color: card.color }}
                      >
                        <Icon size={18} />
                      </span>
                      {card.label}
                    </h3>
                    <div className="stat-value">{card.value}</div>
                  </div>
                )
              })}
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-section">
              <h2>{editingId ? 'Edit Donation' : 'Record a Donation'}</h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Organization *</label>
                  <input
                    required
                    value={form.organization}
                    onChange={(e) => updateField('organization', e.target.value)}
                    placeholder="e.g. Homeward Trails Animal Rescue"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Amount (USD) *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="e.g. 120.00"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Date Donated *</label>
                  <input
                    required
                    type="date"
                    value={form.donatedAt}
                    onChange={(e) => updateField('donatedAt', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Organization Link</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => updateField('link', e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="admin-form-group full">
                  <label>Photo (receipt or visit — shown publicly)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => updateField('imageUrl', e.target.value)}
                      placeholder="https://… or upload →"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleUpload}
                    />
                  </div>
                </div>
                <div className="admin-form-group full">
                  <label>Note (shown publicly)</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => updateField('note', e.target.value)}
                    placeholder="e.g. Quarterly donation — toys and beds for the cat room"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update Donation' : 'Add Donation'}
                </button>
                {editingId && (
                  <button type="button" className="admin-btn" onClick={resetForm}>
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="admin-section-head">
            <h2>Donation History</h2>
            <a
              href="/giving"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-section-link"
            >
              View public page →
            </a>
          </div>
          <div className="admin-table-wrapper admin-table-wrapper--scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Organization</th>
                  <th className="num">Amount</th>
                  <th>Note</th>
                  <th>Photo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.donatedAt).toLocaleDateString()}</td>
                    <td>
                      {d.organization}
                      {d.link && (
                        <a
                          href={d.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: 6, verticalAlign: 'middle' }}
                          aria-label={`Visit ${d.organization}`}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </td>
                    <td className="num">{usd(d.amount)}</td>
                    <td
                      style={{
                        maxWidth: 280,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.note || '—'}
                    </td>
                    <td>
                      {d.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail, arbitrary host */
                        <img
                          src={d.imageUrl}
                          alt=""
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => startEdit(d)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>{' '}
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDelete(d)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!donations.length && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}
                    >
                      No donations recorded yet — the pledge above keeps accumulating until you make
                      one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

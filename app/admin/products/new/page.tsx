'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Plus, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface Category { id: string; name: string; slug: string }
interface Variant { name: string; price: number; stock: number; sku: string; imageIndex: number | null }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewProduct() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])

  const [form, setForm] = useState({
    name: '', subtitle: '', slug: '', description: '', categoryId: '', petType: '',
    brand: '', material: '', price: 0, compareAtPrice: 0, stock: 0, weight: 1,
    status: 'draft', isNew: false, isBestSeller: false, isDrop: false, isBundle: false,
  })

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const updateField = (field: string, value: string | number | boolean) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name') next.slug = slugify(value as string)
      return next
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) setImageUrls(prev => [...prev, data.url])
        else setToast({ msg: data.error || 'Upload failed', type: 'error' })
      } catch {
        setToast({ msg: 'Upload failed', type: 'error' })
      }
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { name: '', price: 0, stock: 0, sku: '', imageIndex: null }])
  }

  const updateVariant = (index: number, field: string, value: string | number | null) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const handleDragStart = (i: number) => setDragIdx(i)
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    setVariants(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIdx(i)
  }
  const handleDragEnd = () => setDragIdx(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const errors: string[] = []
    if (!form.name.trim()) errors.push('Product name is required')
    if (!form.description.trim()) errors.push('Description is required')
    if (!form.categoryId) errors.push('Category is required')
    if (!form.petType) errors.push('Pet type is required')
    if (Number(form.price) <= 0 && variants.filter(v => v.name).length === 0) errors.push('Price must be greater than 0 (or add variants with prices)')
    if (errors.length > 0) {
      setToast({ msg: errors.join('. '), type: 'error' })
      setTimeout(() => setToast(null), 5000)
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
          stock: Number(form.stock),
          imageUrls,
          variants: variants.filter(v => v.name).map(v => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
            sku: v.sku || null,
          })),
        }),
      })

      if (res.ok) {
        setToast({ msg: 'Product created!', type: 'success' })
        setTimeout(() => router.push('/admin/products'), 1000)
      } else {
        const err = await res.json()
        setToast({ msg: err.error || 'Failed to create', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Failed to create product', type: 'error' })
    }
    setSaving(false)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/products" className="admin-btn admin-btn-sm"><ArrowLeft size={16} /></Link>
          <h1>Add Product</h1>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="admin-form-section">
          <h2>Basic Information</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Product Name *</label>
              <input required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Dog Fetch Toys" />
            </div>
            <div className="admin-form-group">
              <label>Slug</label>
              <input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated" />
            </div>
            <div className="admin-form-group full">
              <label>Short Description (shown on product cards)</label>
              <input value={form.subtitle} onChange={e => updateField('subtitle', e.target.value)} placeholder="e.g. Cozy plush bed for cats and small dogs" />
            </div>
            <div className="admin-form-group full">
              <label>Full Description *</label>
              <textarea required value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Product description..." />
            </div>
            <div className="admin-form-group">
              <label>Category *</label>
              <select required value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Pet Type *</label>
              <select required value={form.petType} onChange={e => updateField('petType', e.target.value)}>
                <option value="">Select pet type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Brand</label>
              <input value={form.brand} onChange={e => updateField('brand', e.target.value)} placeholder="e.g. PawLL" />
            </div>
            <div className="admin-form-group">
              <label>Material</label>
              <input value={form.material} onChange={e => updateField('material', e.target.value)} placeholder="e.g. TPR, Cotton" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="admin-form-section">
          <h2>Images</h2>
          <div className="admin-images">
            {imageUrls.map((url, i) => (
              <div key={i} className="admin-image-item">
                <img src={url} alt={`Product image ${i + 1}`} />
                <button type="button" className="admin-image-remove" onClick={() => removeImage(i)}><X size={12} /></button>
              </div>
            ))}
            <label className="admin-image-upload">
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="admin-form-section">
          <h2>Pricing & Inventory</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Price ($) *</label>
              <input type="number" step="0.01" min="0" required value={form.price} onChange={e => updateField('price', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Compare at Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={e => updateField('compareAtPrice', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Stock</label>
              <input type="number" min="0" value={form.stock} onChange={e => updateField('stock', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Weight (lb)</label>
              <input type="number" min="0" step="0.1" value={form.weight} onChange={e => updateField('weight', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => updateField('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="admin-form-section">
          <h2>Badges</h2>
          <div className="admin-checkbox-group">
            {['isNew', 'isBestSeller', 'isDrop', 'isBundle'].map(field => (
              <label key={field} className="admin-checkbox">
                <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => updateField(field, e.target.checked)} />
                {field === 'isNew' ? 'New Arrival' : field === 'isBestSeller' ? 'Best Seller' : field === 'isDrop' ? 'Limited Drop' : 'Bundle'}
              </label>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="admin-form-section">
          <h2>Variants</h2>
          <p style={{ fontSize: '.85rem', color: '#6b7280', margin: '0 0 1rem' }}>Add variants for different types, sizes, or flavors.</p>
          <div className="admin-variants-scroll">
            {variants.map((v, i) => (
              <div key={i} className={`admin-variant-row ${dragIdx === i ? 'admin-variant-row--dragging' : ''}`}
                draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}>
                <div className="admin-variant-grip" title="Drag to reorder"><GripVertical size={16} /></div>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="e.g. Large, Bone" />
                </div>
                <div className="admin-form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" min="0" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                </div>
                <div className="admin-form-group admin-variant-image-picker">
                  <label>Image</label>
                  <div className="admin-variant-image-select">
                    <select value={v.imageIndex !== null ? v.imageIndex : ''} onChange={e => updateVariant(i, 'imageIndex', e.target.value !== '' ? Number(e.target.value) : null)}>
                      <option value="">—</option>
                      {imageUrls.map((url, imgIdx) => (
                        <option key={imgIdx} value={imgIdx}>Image {imgIdx + 1}</option>
                      ))}
                    </select>
                    {v.imageIndex !== null && imageUrls[v.imageIndex] && (
                      <img src={imageUrls[v.imageIndex]} alt="" className="admin-variant-thumb" />
                    )}
                  </div>
                </div>
                <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" style={{ marginBottom: 4 }} onClick={() => removeVariant(i)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="admin-btn" onClick={addVariant} style={{ marginTop: 8 }}>
            <Plus size={16} /> Add Variant
          </button>
        </div>
      </form>
    </>
  )
}

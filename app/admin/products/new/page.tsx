'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Plus, GripVertical, Crop } from 'lucide-react'
import Link from 'next/link'
import ImageCropper from '@/components/admin/ImageCropper'

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [petDog, setPetDog] = useState(false)
  const [petCat, setPetCat] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'lb' | 'g'>('g')

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

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [recropIndex, setRecropIndex] = useState<number | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setPendingFiles(Array.from(files))
    e.target.value = ''
  }

  const handleCropConfirm = async (blobs: Blob[]) => {
    const replacingIndex = recropIndex
    setPendingFiles([])
    setRecropIndex(null)
    setUploading(true)

    for (let b = 0; b < blobs.length; b++) {
      const fd = new FormData()
      fd.append('file', new File([blobs[b]], `product-${Date.now()}.webp`, { type: 'image/webp' }))
      try {
        const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) {
          if (replacingIndex !== null && b === 0) {
            // Replace the existing image at that index
            setImageUrls(prev => prev.map((u, i) => i === replacingIndex ? data.url : u))
          } else {
            setImageUrls(prev => [...prev, data.url])
          }
        } else {
          setToast({ msg: data.error || 'Upload failed', type: 'error' })
        }
      } catch {
        setToast({ msg: 'Upload failed', type: 'error' })
      }
    }
    setUploading(false)
  }

  const handleRecrop = async (index: number) => {
    const url = imageUrls[index]
    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('load failed'))
        img.src = url
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
      })
      const file = new File([blob], `recrop-${index}.png`, { type: 'image/png' })
      setRecropIndex(index)
      setPendingFiles([file])
    } catch {
      setToast({ msg: 'Failed to load image for processing', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
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

  const [dragImgIdx, setDragImgIdx] = useState<number | null>(null)
  const handleImgDragStart = (i: number) => setDragImgIdx(i)
  const handleImgDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragImgIdx === null || dragImgIdx === i) return
    setImageUrls(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragImgIdx, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragImgIdx(i)
  }
  const handleImgDragEnd = () => setDragImgIdx(null)

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

    // Compute petType from checkboxes
    const computedPetType = petDog && petCat ? 'Both' : petDog ? 'Dog' : petCat ? 'Cat' : ''

    // Validate required fields
    const errors: string[] = []
    if (!form.name.trim()) errors.push('Product name is required')
    if (!form.description.trim()) errors.push('Description is required')
    if (selectedCategoryIds.length === 0) errors.push('At least one category is required')
    if (!computedPetType) errors.push('At least one pet type is required')
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
          petType: computedPetType,
          categoryId: selectedCategoryIds[0],
          categoryIds: selectedCategoryIds,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
          stock: Number(form.stock),
          weight: weightUnit === 'g' ? Number(form.weight) / 453.592 : Number(form.weight),
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
              <label>Categories * <span style={{ fontWeight: 400, fontSize: '.8rem', color: '#6b7280' }}>(select all that apply)</span></label>
              <div className="admin-checkbox-group">
                {categories.map(c => (
                  <label key={c.id} className="admin-checkbox">
                    <input type="checkbox" checked={selectedCategoryIds.includes(c.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedCategoryIds(prev => [...prev, c.id])
                        else setSelectedCategoryIds(prev => prev.filter(id => id !== c.id))
                      }} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-form-group">
              <label>Pet Type * <span style={{ fontWeight: 400, fontSize: '.8rem', color: '#6b7280' }}>(select all that apply)</span></label>
              <div className="admin-checkbox-group">
                <label className="admin-checkbox">
                  <input type="checkbox" checked={petDog} onChange={e => setPetDog(e.target.checked)} /> 🐶 Dog
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" checked={petCat} onChange={e => setPetCat(e.target.checked)} /> 🐱 Cat
                </label>
              </div>
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
              <div key={i} className={`admin-image-item ${dragImgIdx === i ? 'admin-image-item--dragging' : ''}`}
                draggable onDragStart={() => handleImgDragStart(i)} onDragOver={e => handleImgDragOver(e, i)} onDragEnd={handleImgDragEnd}
                style={{ cursor: 'grab' }}>
                <img src={url} alt={`Product image ${i + 1}`} />
                <span className="admin-image-order">{i + 1}</span>
                <button type="button" className="admin-image-crop" onClick={() => handleRecrop(i)} title="Re-crop/pad"><Crop size={12} /></button>
                <button type="button" className="admin-image-remove" onClick={() => removeImage(i)}><X size={12} /></button>
              </div>
            ))}
            <label className="admin-image-upload">
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleImageSelect} disabled={uploading} />
            </label>
          </div>
          {pendingFiles.length > 0 && (
            <ImageCropper
              files={pendingFiles}
              onConfirm={handleCropConfirm}
              onCancel={() => { setPendingFiles([]); setRecropIndex(null) }}
            />
          )}
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
              <label>Weight</label>
              <div className="admin-weight-input">
                <input type="number" min="0" step={weightUnit === 'g' ? '1' : '0.1'} value={form.weight} onChange={e => updateField('weight', e.target.value)} />
                <div className="admin-unit-toggle">
                  <button type="button" className={weightUnit === 'g' ? 'active' : ''} onClick={() => {
                    if (weightUnit === 'lb') { updateField('weight', Math.round(Number(form.weight) * 453.592)); setWeightUnit('g') }
                  }}>g</button>
                  <button type="button" className={weightUnit === 'lb' ? 'active' : ''} onClick={() => {
                    if (weightUnit === 'g') { updateField('weight', Math.round(Number(form.weight) / 453.592 * 100) / 100); setWeightUnit('lb') }
                  }}>lb</button>
                </div>
              </div>
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

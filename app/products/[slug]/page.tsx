'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Check } from 'lucide-react'
import { Product } from '@/lib/products'

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [item, setItem] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setItem(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <main className="container page-stack"><p>Loading...</p></main>
  if (!item) return <main className="container page-stack"><h1>Product not found</h1></main>

  const images = item.images?.length ? item.images : [item.image]
  const displayPrice = selectedVariant !== null && item.variants?.[selectedVariant]
    ? item.variants[selectedVariant].price
    : item.price

  function handleAdd() {
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    addItem(item!.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <main className="container page-stack">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div>
          <img
            src={images[selectedImage]}
            alt={item.name}
            style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 16, background: '#f8f4ef' }}
          />
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                    border: selectedImage === i ? '2px solid #1f2e44' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>{item.name}</h1>
          <p style={{ color: '#888', textTransform: 'capitalize', marginBottom: '1rem' }}>
            {item.category.replace('-', ' ')} &bull; {item.petType}
            {item.brand && <> &bull; {item.brand}</>}
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            ${displayPrice.toFixed(2)}
            {item.compareAtPrice && item.compareAtPrice > displayPrice && (
              <span style={{ fontSize: '1rem', color: '#999', textDecoration: 'line-through', marginLeft: 8 }}>
                ${item.compareAtPrice.toFixed(2)}
              </span>
            )}
          </p>

          {item.variants && item.variants.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '.5rem' }}>Type</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {item.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    style={{
                      padding: '.5rem 1rem', borderRadius: 8, cursor: 'pointer',
                      border: selectedVariant === i ? '2px solid #1f2e44' : '1px solid #d1d5db',
                      background: selectedVariant === i ? '#f0ebe4' : '#fff',
                      fontWeight: selectedVariant === i ? 600 : 400,
                    }}
                  >
                    {v.name} - ${v.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>{item.description}</p>

          {item.material && <p style={{ color: '#888', fontSize: '.9rem', marginBottom: '.5rem' }}>Material: {item.material}</p>}
          {item.stock !== undefined && <p style={{ color: item.stock > 0 ? '#16a34a' : '#dc2626', fontSize: '.9rem', marginBottom: '1.5rem' }}>{item.stock > 0 ? `In stock (${item.stock})` : 'Out of stock'}</p>}

          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleAdd} style={{ minWidth: 180, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}>
              {added ? <><Check size={16} /> Added!</> : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

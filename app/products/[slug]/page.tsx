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

  const isOutOfStock = item.stock !== undefined && item.stock <= 0
  const needsVariant = item.variants && item.variants.length > 0 && selectedVariant === null

  function handleAdd() {
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    if (isOutOfStock || needsVariant) return
    addItem(item!.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <main className="container page-stack">
      <div className="pdp-layout">
        <div>
          <div className="pdp-main-image-wrapper">
            <img
              src={images[selectedImage]}
              alt={item.name}
              className="pdp-main-image"
            />
          </div>
          {images.length > 1 && (
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setSelectedImage(i)}
                  className={`pdp-thumbnail ${selectedImage === i ? 'pdp-thumbnail-active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="pdp-title">{item.name}</h1>
          <p className="pdp-meta">
            {item.category.replace('-', ' ')} &bull; {item.petType}
            {item.brand && <> &bull; {item.brand}</>}
          </p>
          <p className="pdp-price">
            ${displayPrice.toFixed(2)}
            {item.compareAtPrice && item.compareAtPrice > displayPrice && (
              <span className="pdp-compare-price">
                ${item.compareAtPrice.toFixed(2)}
              </span>
            )}
          </p>

          {item.variants && item.variants.length > 0 && (
            <div className="pdp-variants">
              <p className="pdp-variants-label">Type</p>
              <div className="pdp-variants-list">
                {item.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    className={`pdp-variant-btn ${selectedVariant === i ? 'pdp-variant-btn-active' : ''}`}
                  >
                    {v.name} - ${v.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="pdp-description">{item.description}</p>

          {item.material && <p className="pdp-material">Material: {item.material}</p>}
          {item.stock !== undefined && <p className={`pdp-stock ${item.stock > 0 ? 'pdp-stock-in' : 'pdp-stock-out'}`}>{item.stock > 0 ? `In stock (${item.stock})` : 'Out of stock'}</p>}

          <div className="hero-buttons">
            <button className="btn-primary pdp-add-btn" onClick={handleAdd} disabled={isOutOfStock || needsVariant}>
              {isOutOfStock ? 'Out of Stock' : needsVariant ? 'Select a variant' : added ? <><Check size={16} /> Added!</> : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

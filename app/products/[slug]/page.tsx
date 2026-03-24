'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Check, ChevronLeft, ChevronRight, Share2, Truck } from 'lucide-react'
import { Product } from '@/lib/product-types'

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

  if (loading) {
    return (
      <main className="container page-stack">
        <div className="pdp-skeleton">
          <div className="pdp-skeleton-image" />
          <div className="pdp-skeleton-info">
            <div className="pdp-skeleton-line pdp-skeleton-line--title" />
            <div className="pdp-skeleton-line pdp-skeleton-line--price" />
            <div className="pdp-skeleton-line pdp-skeleton-line--btn" />
          </div>
        </div>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="container page-stack">
        <div className="pdp-not-found">
          <h1>Product not found</h1>
          <Link href="/" className="btn-secondary">Back to Shop</Link>
        </div>
      </main>
    )
  }

  const images = item.images?.length ? item.images : [item.image]
  const displayPrice = selectedVariant !== null && item.variants?.[selectedVariant]
    ? item.variants[selectedVariant].price
    : item.price
  const freeShipping = displayPrice >= 29

  function handleAdd() {
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    addItem(item!.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function prevImage() {
    setSelectedImage(i => (i === 0 ? images.length - 1 : i - 1))
  }

  function nextImage() {
    setSelectedImage(i => (i === images.length - 1 ? 0 : i + 1))
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: item!.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <main className="container page-stack">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <Link href="/">
          <ChevronLeft size={16} />
          <span>Explore More Products</span>
        </Link>
      </nav>

      {/* Product Layout */}
      <div className="pdp-layout">
        {/* Image Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image-wrapper">
            <img
              src={images[selectedImage]}
              alt={item.name}
              className="pdp-main-image"
            />
            {images.length > 1 && (
              <>
                <button className="pdp-nav-btn pdp-nav-btn--prev" onClick={prevImage} aria-label="Previous image">
                  <ChevronLeft size={20} />
                </button>
                <button className="pdp-nav-btn pdp-nav-btn--next" onClick={nextImage} aria-label="Next image">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${selectedImage === i ? 'pdp-thumb--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pdp-info">
          <div className="pdp-info-header">
            <h1 className="pdp-title">{item.name}</h1>
            <button className="pdp-share-btn" onClick={handleShare} aria-label="Share product">
              <Share2 size={18} />
            </button>
          </div>

          <div className="pdp-price-row">
            <span className="pdp-price">${displayPrice.toFixed(2)}</span>
            {item.compareAtPrice && item.compareAtPrice > displayPrice && (
              <span className="pdp-compare-price">${item.compareAtPrice.toFixed(2)}</span>
            )}
          </div>

          {freeShipping && (
            <div className="pdp-badge pdp-badge--shipping">
              <Truck size={14} />
              <span>Free shipping over $29.00</span>
            </div>
          )}

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="pdp-section">
              <p className="pdp-section-label">Type</p>
              <div className="pdp-variants">
                {item.variants.map((v, i) => (
                  <button
                    key={v.id}
                    className={`pdp-variant-btn ${selectedVariant === i ? 'pdp-variant-btn--active' : ''}`}
                    onClick={() => setSelectedVariant(i)}
                  >
                    {v.name} - ${v.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            className={`pdp-add-btn ${added ? 'pdp-add-btn--added' : ''}`}
            onClick={handleAdd}
            disabled={item.stock === 0}
          >
            {added ? <><Check size={18} /> Added to Cart</> : item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Stock & Material */}
          <div className="pdp-meta">
            {item.stock !== undefined && item.stock > 0 && (
              <span className="pdp-stock pdp-stock--in">In stock ({item.stock})</span>
            )}
            {item.brand && <span className="pdp-meta-item">Brand: {item.brand}</span>}
            {item.material && <span className="pdp-meta-item">Material: {item.material}</span>}
            <span className="pdp-meta-item">{item.category.replace('-', ' ')} &bull; {item.petType}</span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="pdp-description">
        <h2 className="pdp-description-title">Product Details</h2>
        <p className="pdp-description-text">{item.description}</p>
      </div>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { Check, ChevronLeft, ChevronRight, Share2, Truck, ShieldCheck, RotateCcw, Package } from 'lucide-react'
import { Product } from '@/lib/product-types'

function parseDescription(desc: string) {
  // Split by • bullet points and filter empty
  const parts = desc.split('•').map(s => s.trim()).filter(Boolean)
  if (parts.length <= 1) return { intro: desc, bullets: [] }
  return { intro: parts[0], bullets: parts.slice(1) }
}

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { addItem } = useCart()
  const { user } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [item, setItem] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description')

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
  const freeShipping = displayPrice >= 50

  function handleAdd() {
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    addItem(item!.id, quantity)
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
              <span>Free shipping over $50.00</span>
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

          {/* Quantity */}
          <div className="pdp-quantity">
            <span className="pdp-section-label">Quantity</span>
            <div className="pdp-qty-selector">
              <button className="pdp-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
              <span className="pdp-qty-value">{quantity}</span>
              <button className="pdp-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

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

      {/* Tabs Section */}
      <div className="pdp-tabs-section">
        <div className="pdp-tabs">
          <button className={`pdp-tab ${activeTab === 'description' ? 'pdp-tab--active' : ''}`} onClick={() => setActiveTab('description')}>
            {locale === 'zh' ? '商品描述' : 'Description'}
          </button>
          <button className={`pdp-tab ${activeTab === 'details' ? 'pdp-tab--active' : ''}`} onClick={() => setActiveTab('details')}>
            {locale === 'zh' ? '商品详情' : 'Details'}
          </button>
          <button className={`pdp-tab ${activeTab === 'shipping' ? 'pdp-tab--active' : ''}`} onClick={() => setActiveTab('shipping')}>
            {locale === 'zh' ? '配送 & 退货' : 'Shipping & Returns'}
          </button>
        </div>

        <div className="pdp-tab-content">
          {activeTab === 'description' && (() => {
            const { intro, bullets } = parseDescription(item.description)
            return (
              <div className="pdp-desc-content">
                <p className="pdp-desc-intro">{intro}</p>
                {bullets.length > 0 && (
                  <ul className="pdp-desc-bullets">
                    {bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            )
          })()}

          {activeTab === 'details' && (
            <table className="pdp-details-table">
              <tbody>
                <tr><td>{locale === 'zh' ? '分类' : 'Category'}</td><td>{item.category.replace('-', ' ')}</td></tr>
                <tr><td>{locale === 'zh' ? '适用宠物' : 'Pet Type'}</td><td>{item.petType}</td></tr>
                {item.brand && <tr><td>{locale === 'zh' ? '品牌' : 'Brand'}</td><td>{item.brand}</td></tr>}
                {item.material && <tr><td>{locale === 'zh' ? '材质' : 'Material'}</td><td>{item.material}</td></tr>}
                {item.stock !== undefined && <tr><td>{locale === 'zh' ? '库存' : 'Stock'}</td><td>{item.stock > 0 ? `${item.stock} available` : 'Out of stock'}</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'shipping' && (
            <div className="pdp-shipping-content">
              <div className="pdp-shipping-item">
                <Truck size={20} />
                <div>
                  <strong>{locale === 'zh' ? '免费配送' : 'Free Shipping'}</strong>
                  <p>{locale === 'zh' ? '订单满 $65 免费配送' : 'Free shipping on orders over $65'}</p>
                </div>
              </div>
              <div className="pdp-shipping-item">
                <Package size={20} />
                <div>
                  <strong>{locale === 'zh' ? '预计送达' : 'Estimated Delivery'}</strong>
                  <p>{locale === 'zh' ? '5-7 个工作日' : '5-7 business days'}</p>
                </div>
              </div>
              <div className="pdp-shipping-item">
                <RotateCcw size={20} />
                <div>
                  <strong>{locale === 'zh' ? '退换政策' : 'Returns Policy'}</strong>
                  <p>{locale === 'zh' ? '30 天无理由退换' : '30-day hassle-free returns'}</p>
                </div>
              </div>
              <div className="pdp-shipping-item">
                <ShieldCheck size={20} />
                <div>
                  <strong>{locale === 'zh' ? '品质保证' : 'Quality Guarantee'}</strong>
                  <p>{locale === 'zh' ? '所有产品均经过严格质检' : 'All products undergo strict quality checks'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

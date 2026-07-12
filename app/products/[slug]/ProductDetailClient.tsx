'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { Check, ChevronLeft, ChevronRight, Share2, Truck, ShieldCheck, RotateCcw, Package, Star, Heart, PawPrint } from 'lucide-react'
import { Product } from '@/lib/product-types'
import { useProducts } from '@/lib/use-products'
import { ProductGrid } from '@/components/ProductGrid'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { useWishlist } from '@/lib/wishlist-context'
import { recordView } from '@/lib/recently-viewed'

function parseDescription(desc: string) {
  // Split by • bullet points and filter empty
  const parts = desc.split('•').map(s => s.trim()).filter(Boolean)
  if (parts.length <= 1) return { intro: desc, bullets: [] }
  return { intro: parts[0], bullets: parts.slice(1) }
}

export function ProductDetailClient({ product }: { product: Product }) {
  const item = product
  const slug = product.slug
  const { addItem } = useCart()
  const { user } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description')
  const [showSticky, setShowSticky] = useState(false)
  const { toggle, isWished } = useWishlist()

  // Reveal auth-dependent UI only after mount so the server HTML (which has no
  // auth context → user is null) matches the first client render, avoiding a
  // hydration mismatch now that this page is server-rendered.
  useEffect(() => setMounted(true), [])

  // Reveal the mobile sticky add-to-cart once the buy box scrolls out of view.
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 460)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reviews
  interface ReviewData { id: string; rating: number; title?: string; body?: string; createdAt: string; user: { name: string; avatar?: string } }
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Pet match
  const [petNames, setPetNames] = useState<string[]>([])
  const [petMatch, setPetMatch] = useState(false)
  useEffect(() => {
    if (!user) return
    fetch('/api/pets').then(r => r.json()).then((pets: { name: string; type: string }[]) => {
      if (pets.length > 0) {
        const matching = pets.filter(p => item.petType === 'Both' || p.type === item.petType)
        if (matching.length > 0) { setPetMatch(true); setPetNames(matching.map(p => p.name)) }
      }
    }).catch(() => {})
  }, [user, item.petType])

  // Related products
  const { products: relatedAll } = useProducts({ category: item.category, limit: '5' })
  const related = relatedAll.filter(p => p.id !== item.id).slice(0, 4)

  // Record the view + load reviews (client-only side effects).
  useEffect(() => {
    recordView(product.id)
    fetch(`/api/products/${slug}/reviews`).then(r => r.json()).then(setReviews).catch(() => {})
  }, [slug, product.id])

  const images = item.images?.length ? item.images : [item.image]
  const displayPrice = selectedVariant !== null && item.variants?.[selectedVariant]
    ? item.variants[selectedVariant].price
    : item.price
  const freeShipping = displayPrice >= 80

  // Compute effective stock based on variant selection
  const effectiveStock = (() => {
    if (item.variants && item.variants.length > 0) {
      if (selectedVariant !== null) return item.variants[selectedVariant]?.stock ?? 0
      return item.variants.reduce((sum, v) => sum + v.stock, 0)
    }
    return item.stock ?? 0
  })()

  function handleAdd() {
    if (!user) {
      router.push(`/auth?tab=login&redirect=${encodeURIComponent(`/products/${slug}`)}`)
      return
    }
    const variant = selectedVariant !== null && item.variants?.[selectedVariant]
      ? { index: selectedVariant, name: item.variants[selectedVariant].name, price: item.variants[selectedVariant].price }
      : undefined
    addItem(item.id, quantity, variant)
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
      navigator.share({ title: item.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <main className="container page-stack">
      {/* Breadcrumb trail */}
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">{locale === 'zh' ? '首页' : 'Home'}</Link>
        <span className="pdp-breadcrumb-sep" aria-hidden="true">/</span>
        <Link href={`/shop?category=${encodeURIComponent(item.category)}`}>{item.category.replace(/-/g, ' ')}</Link>
        <span className="pdp-breadcrumb-sep" aria-hidden="true">/</span>
        <span className="pdp-breadcrumb-current" aria-current="page">{item.name}</span>
      </nav>

      {/* Product Layout */}
      <div className="pdp-layout">
        {/* Image Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image-wrapper">
            <Image
              src={images[selectedImage]}
              alt={item.name}
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              priority
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
                  <Image src={img} alt="" width={64} height={64} sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pdp-info">
          <div className="pdp-info-header">
            <h1 className="pdp-title">{item.name}</h1>
            <div className="pdp-header-actions">
              {mounted && user && (
                <button className={`pdp-wishlist-btn ${isWished(item.id) ? 'pdp-wishlist-btn--active' : ''}`} onClick={() => toggle(item.id)}>
                  <Heart size={18} fill={isWished(item.id) ? '#e74c3c' : 'none'} />
                </button>
              )}
              <button className="pdp-share-btn" onClick={handleShare} aria-label="Share product">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {(item.rating > 0 || reviews.length > 0) && (
            <button
              className="pdp-rating-row"
              onClick={() => { setActiveTab('reviews'); document.querySelector('.pdp-tabs-section')?.scrollIntoView({ behavior: 'smooth' }) }}
              aria-label={`${item.rating > 0 ? `Rated ${item.rating.toFixed(1)} out of 5, ` : ''}${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'} — read reviews`}
            >
              <span className="pdp-rating-stars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={15} fill={n <= Math.round(item.rating) ? '#D4B28C' : 'none'} color="#D4B28C" />
                ))}
              </span>
              <span className="pdp-rating-text">
                {item.rating > 0 ? `${item.rating.toFixed(1)} · ` : ''}{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </button>
          )}

          {petMatch && (
            <div className="pdp-pet-match">
              <PawPrint size={14} /> {locale === 'zh' ? `适合 ${petNames.join(' & ')}！` : `Great for ${petNames.join(' & ')}!`}
            </div>
          )}

          <div className="pdp-price-row">
            <span className="pdp-price">${displayPrice.toFixed(2)}</span>
            {item.compareAtPrice && item.compareAtPrice > displayPrice && (
              <span className="pdp-compare-price">${item.compareAtPrice.toFixed(2)}</span>
            )}
          </div>

          {freeShipping && (
            <div className="pdp-badge pdp-badge--shipping">
              <Truck size={14} />
              <span>Free shipping over $80.00</span>
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
                    onClick={() => { setSelectedVariant(i); if (v.imageIndex != null) setSelectedImage(v.imageIndex) }}
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

          {/* Add to Cart + Wishlist */}
          <div className="pdp-cart-row">
            <button
              className={`pdp-add-btn ${added ? 'pdp-add-btn--added' : ''}`}
              onClick={handleAdd}
              disabled={effectiveStock === 0}
            >
              {added ? <><Check size={18} /> Added to Cart</> : effectiveStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            {mounted && user && (
              <button
                className={`pdp-wishlist-inline ${isWished(item.id) ? 'pdp-wishlist-inline--active' : ''}`}
                onClick={() => toggle(item.id)}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={isWished(item.id) ? '#e74c3c' : 'none'} />
              </button>
            )}
          </div>

          {/* Stock & Material */}
          <div className="pdp-meta">
            {effectiveStock > 0 && (
              <span className="pdp-stock pdp-stock--in">In stock ({effectiveStock})</span>
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
          <button className={`pdp-tab ${activeTab === 'reviews' ? 'pdp-tab--active' : ''}`} onClick={() => setActiveTab('reviews')}>
            {locale === 'zh' ? '评价' : 'Reviews'} ({reviews.length})
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
                  <p>{locale === 'zh' ? '订单满 $80 免费配送' : 'Free shipping on orders over $80'}</p>
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

          {activeTab === 'reviews' && (
            <div className="pdp-reviews">
              {/* Review Summary */}
              <div className="pdp-review-summary">
                <div className="pdp-review-avg">
                  <Star size={20} fill="#D4B28C" color="#D4B28C" />
                  <span>{item.rating > 0 ? item.rating.toFixed(1) : '—'}</span>
                </div>
                <span className="pdp-review-count">{reviews.length} {locale === 'zh' ? '条评价' : reviews.length === 1 ? 'review' : 'reviews'}</span>
              </div>

              {/* Write Review Form */}
              {mounted && user && (
                <div className="pdp-review-form">
                  <h4>{locale === 'zh' ? '写评价' : 'Write a Review'}</h4>
                  <div className="pdp-review-stars">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className="pdp-star-btn" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                        <Star size={20} fill={n <= reviewForm.rating ? '#D4B28C' : 'none'} color="#D4B28C" />
                      </button>
                    ))}
                  </div>
                  <input placeholder={locale === 'zh' ? '标题（可选）' : 'Title (optional)'} value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} className="pdp-review-input" />
                  <textarea placeholder={locale === 'zh' ? '分享你的体验...' : 'Share your experience...'} value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} className="pdp-review-textarea" rows={3} />
                  <button className="btn-primary btn-sm" disabled={submittingReview} onClick={async () => {
                    setSubmittingReview(true)
                    try {
                      await fetch(`/api/products/${slug}/reviews`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reviewForm),
                      })
                      const updated = await fetch(`/api/products/${slug}/reviews`).then(r => r.json())
                      setReviews(updated)
                      setReviewForm({ rating: 5, title: '', body: '' })
                    } catch {}
                    setSubmittingReview(false)
                  }}>
                    {submittingReview ? '...' : locale === 'zh' ? '提交评价' : 'Submit Review'}
                  </button>
                </div>
              )}

              {/* Review List */}
              {reviews.length > 0 ? (
                <div className="pdp-review-list">
                  {reviews.map(r => (
                    <div key={r.id} className="pdp-review-item">
                      <div className="pdp-review-item-header">
                        <div className="pdp-review-item-stars">
                          {[1,2,3,4,5].map(n => <Star key={n} size={14} fill={n <= r.rating ? '#D4B28C' : 'none'} color="#D4B28C" />)}
                        </div>
                        <span className="pdp-review-item-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.title && <strong className="pdp-review-item-title">{r.title}</strong>}
                      {r.body && <p className="pdp-review-item-body">{r.body}</p>}
                      <span className="pdp-review-item-author">{r.user.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pdp-review-empty">{locale === 'zh' ? '暂无评价，成为第一个评价的人！' : 'No reviews yet. Be the first to review!'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pdp-related">
          <h2>{locale === 'zh' ? '猜你喜欢' : 'You May Also Like'}</h2>
          <ProductGrid items={related} />
        </section>
      )}

      {/* Recently viewed (excludes the current product) */}
      <RecentlyViewed excludeId={item.id} />

      {/* Sticky mobile add-to-cart — reuses the same add handler */}
      <div className={`pdp-sticky-cta ${showSticky ? 'pdp-sticky-cta--show' : ''}`}>
        <Image src={images[selectedImage]} alt="" width={42} height={42} sizes="42px" className="pdp-sticky-thumb" />
        <div className="pdp-sticky-info">
          <span className="pdp-sticky-name">{item.name}</span>
          <span className="pdp-sticky-price">${displayPrice.toFixed(2)}</span>
        </div>
        <button
          className={`pdp-sticky-btn ${added ? 'pdp-sticky-btn--added' : ''}`}
          onClick={handleAdd}
          disabled={effectiveStock === 0}
        >
          {added ? <><Check size={16} /> {locale === 'zh' ? '已加入' : 'Added'}</> : effectiveStock === 0 ? (locale === 'zh' ? '缺货' : 'Out') : (locale === 'zh' ? '加入购物车' : 'Add to Cart')}
        </button>
      </div>
    </main>
  )
}

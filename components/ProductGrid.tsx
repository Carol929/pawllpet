'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react'
import { Product } from '@/lib/product-types'
import { useLocale } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useReveal } from '@/lib/use-reveal'
import { QuickView } from '@/components/QuickView'

const ProductCard = memo(function ProductCard({ product, index = 0, onQuickView }: { product: Product; index?: number; onQuickView: (p: Product) => void }) {
  const { t, locale } = useLocale()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toggle, isWished } = useWishlist()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const { ref, visible } = useReveal<HTMLElement>()

  const inStock = product.stock === undefined || product.stock > 0
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price
  const salePct = onSale ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100) : 0

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    if (!user) {
      router.push(`/auth?tab=login&redirect=${encodeURIComponent(`/products/${product.slug}`)}`)
      return
    }
    addItem(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article
      ref={ref}
      className={`product-card reveal ${visible ? 'reveal--visible' : ''}`}
      style={{ transitionDelay: `${(index % 4) * 70}ms` }}
    >
      {/* Positioned container; the image link and the action buttons are
          siblings so interactive buttons aren't nested inside the <a>. */}
      <div className="product-image-wrapper">
        <div className="product-badges">
          {product.isNew && <span className="product-badge product-badge--new">NEW</span>}
          {product.isBestSeller && <span className="product-badge product-badge--best">BESTSELLER</span>}
          {onSale && salePct > 0 && <span className="product-badge product-badge--sale">-{salePct}%</span>}
        </div>
        <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={product.name}>
          <Image src={product.image} alt={product.name} width={320} height={320} sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw" className="product-image" />
        </Link>
        <button
          className="product-quickview-btn"
          onClick={() => onQuickView(product)}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={15} /> {locale === 'zh' ? '快速查看' : 'Quick View'}
        </button>
        {user && (
          <button
            className={`product-wishlist-btn ${isWished(product.id) ? 'product-wishlist-btn--active' : ''}`}
            onClick={() => toggle(product.id)}
            aria-label={isWished(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWished(product.id) ? '#e74c3c' : 'none'} />
          </button>
        )}
        {(!product.variants || product.variants.length === 0) && inStock && (
          <button
            className={`product-quick-add ${added ? 'product-quick-add--added' : ''}`}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        )}
      </div>
      <h3>{product.name}</h3>
      {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
      <div className="product-meta">
        <span>
          ${product.price.toFixed(2)}
          {onSale && <span className="pdp-compare-price" style={{ marginLeft: 6, fontSize: '.8rem' }}>${(product.compareAtPrice as number).toFixed(2)}</span>}
        </span>
        {product.rating > 0 && <span className="product-rating">★ {product.rating.toFixed(1)}</span>}
      </div>
      {lowStock && <p className="product-lowstock">Only {product.stock} left</p>}
      <Link href={`/products/${product.slug}`} className="btn-secondary">{t('home', 'viewDetails')}</Link>
    </article>
  )
})

export function ProductGrid({ items }: { items: Product[] }) {
  const { t } = useLocale()
  const [quickView, setQuickView] = useState<Product | null>(null)
  const openQuickView = useCallback((p: Product) => setQuickView(p), [])
  const closeQuickView = useCallback(() => setQuickView(null), [])

  if (items.length === 0) {
    return <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>{t('home', 'noProductsFound')}</p>
  }
  return (
    <>
      <div className="products-grid">
        {items.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} onQuickView={openQuickView} />
        ))}
      </div>
      {quickView && <QuickView product={quickView} onClose={closeQuickView} />}
    </>
  )
}

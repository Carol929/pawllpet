'use client'

import { useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, Heart } from 'lucide-react'
import { Product } from '@/lib/product-types'
import { useLocale } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useWishlist } from '@/lib/wishlist-context'

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { t } = useLocale()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toggle, isWished } = useWishlist()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    addItem(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card" key={product.id}>
      <Link href={`/products/${product.slug}`} className="product-image-wrapper product-image-link">
        <Image src={product.image} alt={product.name} width={320} height={320} sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw" className="product-image" />
        {user && (
          <button
            className={`product-wishlist-btn ${isWished(product.id) ? 'product-wishlist-btn--active' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id) }}
            aria-label="Add to wishlist"
          >
            <Heart size={16} fill={isWished(product.id) ? '#e74c3c' : 'none'} />
          </button>
        )}
        <button
          className={`product-quick-add ${added ? 'product-quick-add--added' : ''}`}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>
      </Link>
      <h3>{product.name}</h3>
      {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
      <div className="product-meta">
        <span>${product.price.toFixed(2)}</span>
        {product.rating > 0 && <span className="product-rating">★ {product.rating.toFixed(1)}</span>}
      </div>
      <Link href={`/products/${product.slug}`} className="btn-secondary">{t('home', 'viewDetails')}</Link>
    </article>
  )
})

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="products-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

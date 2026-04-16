'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useLocale } from '@/lib/i18n'
import './wishlist.css'

interface WishlistProduct {
  id: string
  slug: string
  name: string
  subtitle?: string
  price: number
  image: string
  rating: number
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const { toggle, isWished } = useWishlist()
  const { addItem } = useCart()
  const { locale } = useLocale()
  const en = locale !== 'zh'

  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(data => { setProducts(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading])

  function handleRemove(productId: string) {
    toggle(productId)
    setProducts(prev => prev.filter(p => p.id !== productId))
  }

  function handleAddToCart(productId: string) {
    addItem(productId)
    setAddedIds(prev => new Set(prev).add(productId))
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(productId); return n }), 1500)
  }

  if (authLoading || loading) {
    return (
      <main className="container page-stack">
        <h1>{en ? 'My Wishlist' : '我的心愿单'}</h1>
        <p>{en ? 'Loading...' : '加载中...'}</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="container page-stack">
        <h1>{en ? 'My Wishlist' : '我的心愿单'}</h1>
        <div className="wishlist-empty">
          <Heart size={48} />
          <p>{en ? 'Sign in to view your wishlist' : '登录后查看你的心愿单'}</p>
          <Link href="/auth?tab=login" className="btn-primary">{en ? 'Sign In' : '登录'}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <Link href="/shop" className="wishlist-back">
        <ArrowLeft size={14} /> {en ? 'Continue Shopping' : '继续购物'}
      </Link>
      <h1>{en ? 'My Wishlist' : '我的心愿单'} ({products.length})</h1>

      {products.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={48} />
          <p>{en ? 'Your wishlist is empty' : '你的心愿单是空的'}</p>
          <p className="wishlist-empty-sub">{en ? 'Browse our shop and tap the heart icon to save items you love!' : '浏览商店，点击爱心图标收藏你喜欢的商品！'}</p>
          <Link href="/shop" className="btn-primary">{en ? 'Shop Now' : '去购物'} →</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map(product => (
            <div key={product.id} className="wishlist-item">
              <Link href={`/products/${product.slug}`} className="wishlist-item-image">
                <Image src={product.image} alt={product.name} width={200} height={200} className="wishlist-img" />
              </Link>
              <div className="wishlist-item-info">
                <Link href={`/products/${product.slug}`} className="wishlist-item-name">{product.name}</Link>
                {product.subtitle && <p className="wishlist-item-subtitle">{product.subtitle}</p>}
                <div className="wishlist-item-meta">
                  <span className="wishlist-item-price">${product.price.toFixed(2)}</span>
                  {product.rating > 0 && <span className="wishlist-item-rating">★ {product.rating.toFixed(1)}</span>}
                </div>
              </div>
              <div className="wishlist-item-actions">
                <button
                  className={`wishlist-add-cart ${addedIds.has(product.id) ? 'wishlist-add-cart--added' : ''}`}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <ShoppingCart size={16} />
                  {addedIds.has(product.id) ? (en ? 'Added!' : '已加入!') : (en ? 'Add to Cart' : '加入购物车')}
                </button>
                <button className="wishlist-remove" onClick={() => handleRemove(product.id)} aria-label="Remove from wishlist">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

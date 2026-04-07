'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'
import { Product } from '@/lib/products'
import { useLocale } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

function ProductCard({ product }: { product: Product }) {
  const { t } = useLocale()
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  const hasVariants = product.variants && product.variants.length > 0

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    if (hasVariants) {
      router.push(`/products/${product.slug}`)
      return
    }
    addItem(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card" key={product.id}>
      <div className="product-image-wrapper">
        <Image src={product.image} alt={product.name} width={320} height={320} className="product-image" />
        <button
          className={`product-quick-add ${added ? 'product-quick-add--added' : ''}`}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>
      </div>
      <h3 className="product-card-name">{product.name}</h3>
      <div className="product-meta">
        <span>${product.price.toFixed(2)}</span>
        <span>★ {product.rating}</span>
      </div>
      <Link href={`/products/${product.slug}`} className="btn-secondary">{t('home', 'viewDetails')}</Link>
    </article>
  )
}

export function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No products found.</p>
  }
  return (
    <div className="products-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

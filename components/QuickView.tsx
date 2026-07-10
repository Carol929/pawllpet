'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Check, ShoppingCart, Star } from 'lucide-react'
import { Product } from '@/lib/product-types'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'

/**
 * Quick-view modal — lets a shopper inspect a product, pick a variant, and add
 * to cart without leaving the grid. Uses the Product data already in hand (no
 * extra fetch). Add-to-cart reuses the shared cart context; the server still
 * re-validates price/variant/stock at checkout.
 */
export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const { locale } = useLocale()
  const router = useRouter()
  const zh = locale === 'zh'

  const images = product.images?.length ? product.images : [product.image]
  const hasVariants = !!product.variants && product.variants.length > 0
  const [imgIdx, setImgIdx] = useState(0)
  const [variantIdx, setVariantIdx] = useState<number | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const overlayMouseDown = useRef(false)
  const price = hasVariants && variantIdx !== null ? product.variants![variantIdx].price : product.price
  const onSale = !!product.compareAtPrice && product.compareAtPrice > price
  // Availability mirrors the PDP: for variant products, check the selected
  // variant's stock (or any in-stock variant before selection).
  const inStock = hasVariants
    ? (variantIdx !== null
        ? (product.variants![variantIdx].stock ?? 0) > 0
        : product.variants!.some((v) => (v.stock ?? 0) > 0))
    : (product.stock === undefined || product.stock > 0)

  // Lock body scroll, focus the panel, ESC to close, and trap Tab within.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const focusablesSelector = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    // Focus the first real control (the close button), not the tabIndex=-1 panel,
    // so Shift+Tab wraps correctly instead of leaking to the page behind.
    const initial = panelRef.current?.querySelector<HTMLElement>(focusablesSelector)
    ;(initial ?? panelRef.current)?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(focusablesSelector)
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      // Treat the panel container itself as a boundary so focus can't escape.
      if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (active === last || active === panelRef.current)) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      // Return focus to whatever opened the modal (the quick-view trigger).
      prevFocused?.focus?.()
    }
  }, [onClose])

  function handleAdd() {
    if (!user) {
      router.push(`/auth?tab=login&redirect=${encodeURIComponent(`/products/${product.slug}`)}`)
      return
    }
    if (hasVariants && variantIdx === null) return
    const variant = hasVariants && variantIdx !== null
      ? { index: variantIdx, name: product.variants![variantIdx].name, price: product.variants![variantIdx].price }
      : undefined
    addItem(product.id, qty, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const needsVariant = hasVariants && variantIdx === null

  return (
    <div
      className="qv-overlay"
      onMouseDown={(e) => { overlayMouseDown.current = e.target === e.currentTarget }}
      onClick={(e) => { if (e.target === e.currentTarget && overlayMouseDown.current) onClose() }}
    >
      <div
        className="qv-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button className="qv-close" onClick={onClose} aria-label={zh ? '关闭' : 'Close'}><X size={20} /></button>

        <div className="qv-gallery">
          <div className="qv-main-img">
            <Image src={images[imgIdx]} alt={product.name} width={420} height={420} className="qv-img" />
          </div>
          {images.length > 1 && (
            <div className="qv-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`qv-thumb ${imgIdx === i ? 'qv-thumb--active' : ''}`} onClick={() => setImgIdx(i)} aria-label={`Image ${i + 1}`}>
                  <Image src={img} alt="" width={56} height={56} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="qv-info">
          <h2 className="qv-title">{product.name}</h2>
          {product.subtitle && <p className="qv-subtitle">{product.subtitle}</p>}
          <div className="qv-price-row">
            <span className="qv-price">${price.toFixed(2)}</span>
            {onSale && <span className="pdp-compare-price">${(product.compareAtPrice as number).toFixed(2)}</span>}
            {product.rating > 0 && <span className="qv-rating"><Star size={14} fill="#D4B28C" color="#D4B28C" /> {product.rating.toFixed(1)}</span>}
          </div>

          {hasVariants && (
            <div className="qv-variants">
              {product.variants!.map((v, i) => {
                const soldOut = (v.stock ?? 0) === 0
                return (
                  <button
                    key={v.id ?? i}
                    className={`pdp-variant-btn ${variantIdx === i ? 'pdp-variant-btn--active' : ''}`}
                    onClick={() => { setVariantIdx(i); if (v.imageIndex != null && v.imageIndex < images.length) setImgIdx(v.imageIndex) }}
                    disabled={soldOut}
                  >
                    {v.name} - ${v.price.toFixed(2)}{soldOut ? (zh ? '（缺货）' : ' (Sold out)') : ''}
                  </button>
                )
              })}
            </div>
          )}

          <div className="qv-actions">
            <div className="pdp-qty-selector">
              <button className="pdp-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
              <span className="pdp-qty-value">{qty}</span>
              <button className="pdp-qty-btn" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button
              className={`qv-add ${added ? 'qv-add--added' : ''}`}
              onClick={handleAdd}
              disabled={!inStock || needsVariant}
            >
              {added ? <><Check size={16} /> {zh ? '已加入' : 'Added'}</>
                : !inStock ? (zh ? '缺货' : 'Out of stock')
                : needsVariant ? (zh ? '请选择规格' : 'Select an option')
                : <><ShoppingCart size={16} /> {zh ? '加入购物车' : 'Add to Cart'}</>}
            </button>
          </div>

          <Link href={`/products/${product.slug}`} className="qv-details-link" onClick={onClose}>
            {zh ? '查看完整详情' : 'View full details'} →
          </Link>
        </div>
      </div>
    </div>
  )
}

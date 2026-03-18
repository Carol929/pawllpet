'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/catalog'
import { useLocale } from '@/lib/i18n'

export function ProductGrid({ items }: { items: Product[] }) {
  const { t } = useLocale()

  return (
    <div className="products-grid">
      {items.map((product) => (
        <article className="product-card" key={product.id}>
          <Image src={product.image} alt={product.name} width={320} height={320} className="product-image" />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <div className="product-meta">
            <span>${product.price.toFixed(2)}</span>
            <span>★ {product.rating}</span>
          </div>
          <Link href={`/products/${product.slug}`} className="btn-secondary">{t('home', 'viewDetails')}</Link>
        </article>
      ))}
    </div>
  )
}

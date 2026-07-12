import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/products'
import { ProductDetailClient } from './ProductDetailClient'

// Prisma reads aren't fetch, so Next can't detect this route as dynamic and would
// cache it indefinitely (frozen price/stock/JSON-LD until redeploy). Force it
// dynamic so product data + structured data always reflect the live DB.
export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
const absolute = (u: string) => (u.startsWith('http') ? u : `${siteUrl}${u}`)

// Dedupe the DB lookup across generateMetadata + the page render (same request).
const getProduct = cache((slug: string) => getProductBySlug(slug))

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product not found' }
  const description = (product.subtitle || product.description || `Shop ${product.name} at PawLL.`)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      type: 'website',
      images: product.image ? [{ url: absolute(product.image) }] : [],
    },
    twitter: { card: 'summary_large_image', title: product.name, description },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean).map(absolute)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: (product.subtitle || product.description || '').replace(/\s+/g, ' ').trim().slice(0, 500) || undefined,
    image: images,
    sku: product.id,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(product.price > 0
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price.toFixed(2),
            availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${siteUrl}/products/${product.slug}`,
          },
        }
      : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} />
    </>
  )
}

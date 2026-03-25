import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

  const staticPages = [
    '', '/shop', '/about', '/faq', '/contact', '/help-center',
    '/new-arrivals', '/best-sellers', '/shop-by-pet', '/shop-by-need',
    '/mystery-boxes', '/bundles', '/limited-drops', '/rewards',
    '/privacy-policy', '/terms-conditions', '/returns-policy',
    '/shipping-policy', '/exchange-policy', '/track-order',
  ].map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  let productPages: MetadataRoute.Sitemap = []
  try {
    const { products } = await getProducts()
    productPages = products.map(p => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  } catch {
    // DB not available at build time
  }

  return [...staticPages, ...productPages]
}

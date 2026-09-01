import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { blogPosts } from '@/lib/static-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

  const entry = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly') => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  })

  const commercePages = [
    '/shop', '/new-arrivals', '/best-sellers', '/shop-by-pet', '/shop-by-need',
    '/mystery-boxes', '/bundles', '/limited-drops',
  ].map(p => entry(p, 0.8, 'weekly'))

  const contentPages = [
    '/about', '/blog', '/faq', '/contact', '/help-center',
    '/rewards', '/pet-quiz', '/store-locator', '/track-order',
  ].map(p => entry(p, 0.6, 'weekly'))

  const blogPostPages = blogPosts.map(post => entry(`/blog/${post.slug}`, 0.6, 'monthly'))

  const policyPages = [
    '/privacy-policy', '/terms-conditions', '/returns-policy', '/shipping-policy',
    '/exchange-policy', '/cookie-policy', '/product-safety', '/accessibility',
  ].map(p => entry(p, 0.4, 'monthly'))

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

  return [
    entry('', 1, 'daily'),
    ...commercePages,
    ...productPages,
    ...contentPages,
    ...blogPostPages,
    ...policyPages,
  ]
}

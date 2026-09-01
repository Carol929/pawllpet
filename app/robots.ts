import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/auth/', '/cart', '/checkout/', '/account', '/search', '/wishlist'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

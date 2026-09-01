import { getProducts } from '@/lib/products'

// Google Merchant Center product feed (RSS 2.0 + g: namespace). Free listings
// on the Google Shopping tab pull from this — register the feed URL in
// Merchant Center under Products → Feeds. Shipping/tax are configured
// account-level in Merchant Center, not per item.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
const absolute = (u: string) => (u.startsWith('http') ? u : `${siteUrl}${u}`)

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const { products } = await getProducts()

  const items = products
    .filter(p => p.price > 0 && p.image)
    .map(p => {
      const description = (p.subtitle || p.description || p.name).replace(/\s+/g, ' ').trim().slice(0, 5000)
      const inStock = (p.stock ?? 0) > 0 || (p.variants?.some(v => v.stock > 0) ?? false)
      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(`${siteUrl}/products/${p.slug}`)}</g:link>
      <g:image_link>${escapeXml(absolute(p.image))}</g:image_link>
      <g:price>${p.price.toFixed(2)} USD</g:price>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(p.brand || 'PawLL')}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`
    })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>PawLL Pet</title>
    <link>${siteUrl}</link>
    <description>Premium pet supplies for dogs and cats</description>
${items.join('\n')}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}

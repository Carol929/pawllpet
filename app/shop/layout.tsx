import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Shop All Pet Supplies',
  description: 'Browse the full PawLL catalog: dog and cat toys, beds, leashes, bowls, apparel, and more. US shipping, free over $80.',
  alternates: { canonical: '/shop' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Best Sellers',
  description: 'The pet supplies PawLL customers love most: top-rated toys, beds, leashes, and bowls.',
  alternates: { canonical: '/best-sellers' },
}

export default function BestSellersLayout({ children }: { children: React.ReactNode }) {
  return children
}

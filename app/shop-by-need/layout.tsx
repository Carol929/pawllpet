import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Shop by Need',
  description: 'Shop PawLL by what your pet needs: play, rest, walks, mealtime, and more.',
  alternates: { canonical: '/shop-by-need' },
}

export default function ShopByNeedLayout({ children }: { children: React.ReactNode }) {
  return children
}

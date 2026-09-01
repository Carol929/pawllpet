import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Shop by Pet',
  description: 'Find the right PawLL gear for your dog or cat: toys, beds, apparel, and accessories by pet type.',
  alternates: { canonical: '/shop-by-pet' },
}

export default function ShopByPetLayout({ children }: { children: React.ReactNode }) {
  return children
}

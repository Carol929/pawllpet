import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Product Safety',
  description: 'How PawLL tests and sources materials to keep pet products safe.',
  alternates: { canonical: '/product-safety' },
}

export default function ProductSafetyLayout({ children }: { children: React.ReactNode }) {
  return children
}

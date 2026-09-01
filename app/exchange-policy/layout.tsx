import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Exchange Policy',
  description: 'How to exchange a PawLL product for a different size or style.',
  alternates: { canonical: '/exchange-policy' },
}

export default function ExchangePolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}

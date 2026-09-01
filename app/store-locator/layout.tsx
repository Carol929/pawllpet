import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Store Locator',
  description: 'Find where to shop PawLL products.',
  alternates: { canonical: '/store-locator' },
}

export default function StoreLocatorLayout({ children }: { children: React.ReactNode }) {
  return children
}

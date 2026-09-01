import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Bundles & Sets',
  description: 'Save with PawLL bundles: curated sets of toys, beds, and accessories for dogs and cats.',
  alternates: { canonical: '/bundles' },
}

export default function BundlesLayout({ children }: { children: React.ReactNode }) {
  return children
}

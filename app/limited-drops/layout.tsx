import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Limited Drops',
  description: 'Limited-edition PawLL releases: small-batch pet products that do not restock.',
  alternates: { canonical: '/limited-drops' },
}

export default function LimitedDropsLayout({ children }: { children: React.ReactNode }) {
  return children
}

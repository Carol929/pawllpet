import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'The latest drops at PawLL: fresh toys, beds, and accessories for dogs and cats.',
  alternates: { canonical: '/new-arrivals' },
}

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return children
}

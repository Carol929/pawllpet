import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track the status of your PawLL order from checkout to your door.',
  alternates: { canonical: '/track-order' },
}

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children
}

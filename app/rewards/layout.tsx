import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'PawLL Rewards',
  description: 'Earn points on every PawLL order and redeem them for discounts on pet supplies.',
  alternates: { canonical: '/rewards' },
}

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return children
}

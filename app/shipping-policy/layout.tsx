import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'PawLL shipping: US-domestic delivery from Virginia, rates, and timelines.',
  alternates: { canonical: '/shipping-policy' },
}

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}

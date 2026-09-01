import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How PawLL uses cookies on pawllpet.com.',
  alternates: { canonical: '/cookie-policy' },
}

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}

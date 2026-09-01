import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that govern shopping at pawllpet.com.',
  alternates: { canonical: '/terms-conditions' },
}

export default function TermsConditionsLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'PawLL accessibility statement: how we keep pawllpet.com usable for everyone.',
  alternates: { canonical: '/accessibility' },
}

export default function AccessibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}

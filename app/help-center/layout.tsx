import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Help Center',
  description: 'PawLL Help Center: shipping, returns, order tracking, and product guides in one place.',
  alternates: { canonical: '/help-center' },
}

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children
}

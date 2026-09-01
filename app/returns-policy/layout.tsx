import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Returns Policy',
  description: 'How returns work at PawLL: eligibility windows, process, and refunds.',
  alternates: { canonical: '/returns-policy' },
}

export default function ReturnsPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}

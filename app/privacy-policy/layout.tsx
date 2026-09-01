import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How PawLL collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the PawLL team. We are happy to help with orders, products, and anything pet.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Mystery Boxes',
  description: 'PawLL mystery boxes: curated surprise bundles of premium pet products at a better price.',
  alternates: { canonical: '/mystery-boxes' },
}

export default function MysteryBoxesLayout({ children }: { children: React.ReactNode }) {
  return children
}

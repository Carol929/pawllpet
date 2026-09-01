import type { Metadata } from 'next'

// The page itself is a client component, so the SEO metadata lives on this
// thin layout (same pattern as app/giving/layout.tsx).
export const metadata: Metadata = {
  title: 'Pet Quiz',
  description: 'Take the PawLL pet quiz and get product picks matched to your dog or cat.',
  alternates: { canonical: '/pet-quiz' },
}

export default function PetQuizLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from 'next'

// The page itself is a client component (it uses the locale context and
// fetches live totals), so the SEO metadata lives on this thin layout.
export const metadata: Metadata = {
  title: 'PawLL Gives Back — 1% for Shelter Pets',
  description:
    'PawLL pledges 1% of every order to animal shelters and rescues. Track our running pledge, see every donation we make, and meet the shelter pets you help.',
  openGraph: {
    title: 'PawLL Gives Back — 1% for Shelter Pets',
    description:
      'Every PawLL order sets aside 1% for shelter animals. See the live tally and our donation log.',
    images: [
      {
        url: '/shelter/shelter-cats-1.jpg',
        width: 1200,
        height: 900,
        alt: 'Shelter cats supported by PawLL',
      },
    ],
  },
}

export default function GivingLayout({ children }: { children: React.ReactNode }) {
  return children
}

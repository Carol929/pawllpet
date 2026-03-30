import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'
import { AdminRouteGuard } from '@/components/AdminRouteGuard'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

export const metadata: Metadata = {
  title: { default: 'PawLL Pet | Premium Pet Supplies', template: '%s | PawLL Pet' },
  description: 'Shop premium pet supplies for dogs and cats. Toys, beds, leashes, bowls, and mystery boxes. Free shipping over $50.',
  keywords: ['pet supplies', 'dog toys', 'cat accessories', 'pet beds', 'pet bowls', 'pet leashes', 'mystery boxes', 'PawLL Pet'],
  authors: [{ name: 'PawLL Pet' }],
  creator: 'PawLL LLC',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PawLL Pet',
    title: 'PawLL Pet | Premium Pet Supplies',
    description: 'Shop premium pet supplies for dogs and cats. Free shipping over $50.',
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: 'PawLL Pet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawLL Pet | Premium Pet Supplies',
    description: 'Shop premium pet supplies for dogs and cats. Free shipping over $50.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>
        {/* Skip to content — accessibility */}
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <Providers>
          <AdminRouteGuard
            header={<Header />}
            footer={<Footer />}
          >
            <div id="main-content">
              {children}
            </div>
          </AdminRouteGuard>
        </Providers>
      </body>
    </html>
  )
}

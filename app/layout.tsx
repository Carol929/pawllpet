import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'
import { AdminRouteGuard } from '@/components/AdminRouteGuard'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Analytics } from '@/components/Analytics'

// The site names "Inter" in CSS but never bundled it, so it silently rendered
// in system-ui. next/font self-hosts it (no external request, no layout shift).
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

export const metadata: Metadata = {
  title: { default: 'PawLL Pet | Premium Pet Supplies', template: '%s | PawLL Pet' },
  description: 'PawLL (pawllpet.com) is your US shop for premium dog and cat supplies — toys, beds, leashes, bowls, and mystery boxes. Free shipping over $80.',
  keywords: ['PawLL', 'pawll', 'pawllpet', 'pet supplies', 'dog toys', 'cat accessories', 'pet beds', 'pet bowls', 'pet leashes', 'mystery boxes', 'PawLL Pet'],
  applicationName: 'PawLL',
  authors: [{ name: 'PawLL Pet' }],
  creator: 'PawLL LLC',
  metadataBase: new URL(siteUrl),
  // Google Search Console ownership check without touching DNS — set the env
  // var to the code from the "HTML tag" verification method.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PawLL Pet',
    title: 'PawLL Pet | Premium Pet Supplies',
    description: 'Shop premium pet supplies for dogs and cats. Free shipping over $80.',
    // og:image comes from app/opengraph-image.tsx (file convention overrides config)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawLL Pet | Premium Pet Supplies',
    description: 'Shop premium pet supplies for dogs and cats. Free shipping over $80.',
  },
  robots: { index: true, follow: true },
}

// Brand-entity signals for the "pawll" query: Organization ties the name, logo,
// and social profiles together; WebSite declares the internal search endpoint
// (eligible for a sitelinks search box on brand results).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'PawLL',
  alternateName: ['PawLL Pet', 'pawllpet', 'PawLL Pet Supplies'],
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [
    'https://www.instagram.com/pawllpet',
    'https://www.tiktok.com/@pawllpet',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'PawLL',
  alternateName: 'PawLL Pet',
  url: siteUrl,
  publisher: { '@id': `${siteUrl}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={inter.variable}>
      <head>
        {/* Fallback: scroll-reveal starts at opacity:0 and is shown by JS. If JS
            is disabled, reveal nothing stays hidden. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {/* Ambient aurora — decorative, behind everything */}
        <div className="aurora" aria-hidden="true" />
        {/* Skip to content — accessibility */}
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <ScrollProgress />
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
        <Analytics />
      </body>
    </html>
  )
}

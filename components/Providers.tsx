'use client'

import dynamic from 'next/dynamic'
import { SessionProvider } from 'next-auth/react'
import { LocaleProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ScrollToTop } from '@/components/ScrollToTop'

const NewsletterPopup = dynamic(() => import('@/components/NewsletterPopup').then(m => m.NewsletterPopup), { ssr: false })
const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(m => m.CookieConsent), { ssr: false })
const BackToTop = dynamic(() => import('@/components/BackToTop').then(m => m.BackToTop), { ssr: false })

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <NewsletterPopup />
              <CookieConsent />
              <BackToTop />
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </SessionProvider>
  )
}

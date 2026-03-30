'use client'

import { SessionProvider } from 'next-auth/react'
import { LocaleProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { ScrollToTop } from '@/components/ScrollToTop'
import { NewsletterPopup } from '@/components/NewsletterPopup'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <NewsletterPopup />
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </SessionProvider>
  )
}

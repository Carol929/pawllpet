'use client'

import { SessionProvider } from 'next-auth/react'
import { LocaleProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { ScrollToTop } from '@/components/ScrollToTop'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            {children}
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </SessionProvider>
  )
}

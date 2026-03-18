'use client'

import { LocaleProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LocaleProvider>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function AdminRouteGuard({
  children,
  header,
  footer,
}: {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  )
}

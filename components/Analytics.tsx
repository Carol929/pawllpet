'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const CONSENT_KEY = 'pawll-cookie-consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? JSON.parse(raw).analytics === true : false
  } catch {
    return false
  }
}

/**
 * Consent-gated Google Analytics 4. Loads nothing unless
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set AND the visitor opted into analytics
 * cookies (the CookieConsent banner writes the choice to localStorage and
 * fires 'pawll-consent-changed', so tracking starts/stops without a reload).
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setEnabled(hasAnalyticsConsent())
    const onChange = () => setEnabled(hasAnalyticsConsent())
    window.addEventListener('pawll-consent-changed', onChange)
    return () => window.removeEventListener('pawll-consent-changed', onChange)
  }, [])

  // App Router navigations don't reload the page — report them as page_views.
  // On first load window.gtag is still undefined here, so the initial
  // page_view comes from the gtag config call alone (no double count).
  useEffect(() => {
    if (enabled && window.gtag) {
      window.gtag('event', 'page_view', { page_path: pathname })
    }
  }, [pathname, enabled])

  if (!GA_ID || !enabled) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, Settings, Shield, X } from 'lucide-react'

const STORAGE_KEY = 'pawll-cookie-consent'

interface CookiePrefs {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>({ essential: true, analytics: false, marketing: false })

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  function save(p: CookiePrefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setShow(false)
  }

  function acceptAll() {
    save({ essential: true, analytics: true, marketing: true })
  }

  function essentialOnly() {
    save({ essential: true, analytics: false, marketing: false })
  }

  function savePrefs() {
    save(prefs)
  }

  // CCPA: Do Not Sell handler
  function doNotSell() {
    save({ essential: true, analytics: false, marketing: false })
  }

  if (!show) return null

  return (
    <div className="cc-banner">
      <div className="cc-content">
        <div className="cc-header">
          <Cookie size={20} />
          <h3>We Value Your Privacy</h3>
        </div>

        <p className="cc-text">
          We use cookies to enhance your shopping experience, analyze site traffic, and personalize content.
          You can choose which cookies to allow. Essential cookies are always active as they are necessary for the site to function.
          {' '}<Link href="/privacy-policy" className="cc-link">Privacy Policy</Link>
        </p>

        {showPrefs && (
          <div className="cc-prefs">
            <label className="cc-pref-item">
              <div>
                <strong><Shield size={14} /> Essential Cookies</strong>
                <span>Required for login, cart, language preferences. Cannot be disabled.</span>
              </div>
              <input type="checkbox" checked disabled />
            </label>
            <label className="cc-pref-item">
              <div>
                <strong>Analytics Cookies</strong>
                <span>Help us understand how visitors use our site to improve the experience.</span>
              </div>
              <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs({ ...prefs, analytics: e.target.checked })} />
            </label>
            <label className="cc-pref-item">
              <div>
                <strong>Marketing Cookies</strong>
                <span>Used to deliver relevant ads and track campaign effectiveness.</span>
              </div>
              <input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs({ ...prefs, marketing: e.target.checked })} />
            </label>
          </div>
        )}

        <div className="cc-actions">
          {showPrefs ? (
            <>
              <button className="cc-btn cc-btn--primary" onClick={savePrefs}>Save Preferences</button>
              <button className="cc-btn cc-btn--secondary" onClick={() => setShowPrefs(false)}>Back</button>
            </>
          ) : (
            <>
              <button className="cc-btn cc-btn--primary" onClick={acceptAll}>Accept All</button>
              <button className="cc-btn cc-btn--secondary" onClick={essentialOnly}>Essential Only</button>
              <button className="cc-btn cc-btn--outline" onClick={() => setShowPrefs(true)}>
                <Settings size={14} /> Manage Preferences
              </button>
            </>
          )}
        </div>

        <button className="cc-dns" onClick={doNotSell}>
          Do Not Sell or Share My Personal Information
        </button>
      </div>

      <button className="cc-close" onClick={essentialOnly} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  )
}

/** Re-open cookie preferences (called from footer link) */
export function resetCookieConsent() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, PawPrint } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const STORAGE_KEY = 'pawll-newsletter-dismissed'

/**
 * First-order offer popup: sends visitors to create an account; the promo
 * code (10% off first order of $50+, managed in Stripe) is emailed after
 * they verify their address — see app/api/auth/verify-email/route.ts.
 * Evergreen: no expiry. Never shown to signed-in users.
 */
export function NewsletterPopup() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (user) return // account holders already have their code
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [user])

  function dismiss() {
    setShow(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!show || user) return null

  return (
    <div className="nl-overlay" onClick={dismiss}>
      <div className="nl-popup" onClick={e => e.stopPropagation()}>
        <button className="nl-close" onClick={dismiss} aria-label="Close"><X size={20} /></button>

        {/* Decorative paw prints */}
        <div className="nl-decor nl-decor--1"><PawPrint size={24} /></div>
        <div className="nl-decor nl-decor--2"><PawPrint size={18} /></div>
        <div className="nl-decor nl-decor--3"><PawPrint size={28} /></div>
        <div className="nl-decor nl-decor--4"><PawPrint size={16} /></div>

        <div className="nl-content">
          <div className="nl-badge">NEW HERE?</div>
          <h2 className="nl-title">Get 10% OFF</h2>
          <p className="nl-subtitle">Your First Order of $50+</p>
          <p className="nl-desc">Create a free PawLL account and we&apos;ll email you a 10% off code for your first order over $50 — plus early access to new drops.</p>

          <div className="nl-form">
            <Link href="/auth?tab=signup" className="nl-btn" onClick={dismiss}>
              CREATE ACCOUNT &amp; GET 10% OFF
            </Link>
          </div>

          <p className="nl-privacy">Code arrives by email after you verify your address. One use, first order only.</p>
        </div>
      </div>
    </div>
  )
}

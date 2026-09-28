'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, PawPrint } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const STORAGE_KEY = 'pawll-newsletter-dismissed'

/**
 * First-order offer popup: sends visitors to create an account. The perk
 * (10% off the first order of $50+) is applied automatically at checkout —
 * no promo code — see the first-order block in app/api/checkout/route.ts.
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
          <p className="nl-desc">Create a free PawLL account and 10% off your first order over $50 is applied automatically at checkout — no code needed, and it stacks with promo codes.</p>

          <div className="nl-form">
            <Link href="/auth?tab=signup" className="nl-btn" onClick={dismiss}>
              CREATE ACCOUNT &amp; GET 10% OFF
            </Link>
          </div>

          <p className="nl-privacy">Discount activates once you verify your email. First order only.</p>
        </div>
      </div>
    </div>
  )
}

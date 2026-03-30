'use client'

import { useState, useEffect } from 'react'
import { X, PawPrint } from 'lucide-react'

const STORAGE_KEY = 'pawll-newsletter-dismissed'

export function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    localStorage.setItem(STORAGE_KEY, 'true')
    setTimeout(() => setShow(false), 2500)
  }

  if (!show) return null

  return (
    <div className="nl-overlay" onClick={dismiss}>
      <div className="nl-popup" onClick={e => e.stopPropagation()}>
        <button className="nl-close" onClick={dismiss}><X size={20} /></button>

        {/* Decorative paw prints */}
        <div className="nl-decor nl-decor--1"><PawPrint size={24} /></div>
        <div className="nl-decor nl-decor--2"><PawPrint size={18} /></div>
        <div className="nl-decor nl-decor--3"><PawPrint size={28} /></div>
        <div className="nl-decor nl-decor--4"><PawPrint size={16} /></div>

        <div className="nl-content">
          <div className="nl-badge">WELCOME GIFT</div>
          <h2 className="nl-title">Get 15% OFF</h2>
          <p className="nl-subtitle">your first order</p>
          <p className="nl-desc">Join the PawLL family! Subscribe to our newsletter for exclusive deals, new drops, and pet care tips.</p>

          {!submitted ? (
            <form className="nl-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="nl-input"
              />
              <button type="submit" className="nl-btn">GET 15% OFF</button>
            </form>
          ) : (
            <div className="nl-success">
              <PawPrint size={24} />
              <p>Welcome to the pack! Check your email for your discount code.</p>
            </div>
          )}

          <p className="nl-privacy">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  )
}

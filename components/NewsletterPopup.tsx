'use client'

import { useState, useEffect } from 'react'
import { X, PawPrint } from 'lucide-react'

const STORAGE_KEY = 'pawll-newsletter-dismissed'

export function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || sending) return
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      setTimeout(() => setShow(false), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
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
          <div className="nl-badge">GRAND OPENING</div>
          <h2 className="nl-title">Get 25% OFF</h2>
          <p className="nl-subtitle">Grand Opening Special</p>
          <p className="nl-desc">Celebrate our grand opening! Subscribe for your exclusive 25% discount, plus new drops and pet care tips.</p>
          <p className="nl-expire">Offer expires 5/31/2026</p>

          {!submitted ? (
            <form className="nl-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="nl-input"
                disabled={sending}
              />
              <button type="submit" className="nl-btn" disabled={sending}>
                {sending ? 'SENDING...' : 'GET 25% OFF'}
              </button>
              {error && <p className="nl-error">{error}</p>}
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

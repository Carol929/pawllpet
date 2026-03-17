'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed to verify')
    else setMessage('Email verified. You can now log in.')

    setLoading(false)
  }

  async function resendCode() {
    setLoading(true)
    setError(null)
    setMessage(null)

    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed to resend code')
    else setMessage(data.message || 'Code sent')

    setLoading(false)
  }

  return (
    <main className="container page-stack">
      <h1>Verify your email</h1>
      <form onSubmit={verify} className="auth-form" style={{ maxWidth: 420 }}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>6-digit code</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
        <button className="btn-primary" type="submit" disabled={loading}>Confirm</button>
      </form>
      <button className="btn-secondary" onClick={resendCode} disabled={loading || !email}>Resend code</button>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {message && <p style={{ color: '#15803d' }}>{message}</p>}
      <Link href="/auth?tab=login">Back to login</Link>
    </main>
  )
}

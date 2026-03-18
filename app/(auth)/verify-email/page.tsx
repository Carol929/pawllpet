'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import '../auth/auth.css'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) setEmail(emailParam)
  }, [])

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
    if (!res.ok) {
      setError(data.error || 'Failed to verify')
    } else {
      setMessage(t('auth', 'emailVerified'))
      setTimeout(() => {
        router.push(`/set-password?email=${encodeURIComponent(email)}`)
      }, 1000)
    }

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
    else setMessage(data.message || t('auth', 'codeSent'))

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ marginBottom: '0.5rem' }}>{t('auth', 'verifyEmail')}</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '.9rem' }}>
          {t('auth', 'verifyEmailDesc')}
        </p>

        {error && <div className="auth-message auth-error">{error}</div>}
        {message && <div className="auth-message auth-success">{message}</div>}

        <form onSubmit={verify} className="auth-form">
          <div className="form-group">
            <label htmlFor="verifyEmail">{t('auth', 'email')}</label>
            <input
              id="verifyEmail" value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" required
            />
          </div>
          <div className="form-group">
            <label htmlFor="verifyCode">{t('auth', 'verificationCode')}</label>
            <input
              id="verifyCode" value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6} required
              className="code-input"
              placeholder="000000"
            />
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? t('auth', 'verifying') : t('auth', 'verify')}
          </button>
        </form>
        <button className="forgot-link" onClick={resendCode} disabled={loading || !email} style={{ marginTop: '1rem' }}>
          {t('auth', 'resendCode')}
        </button>

        <div className="auth-footer">
          <Link href="/auth?tab=login">← {t('auth', 'backToLogin')}</Link>
        </div>
      </div>
    </div>
  )
}

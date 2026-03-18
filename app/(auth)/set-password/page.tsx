'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import '../auth/auth.css'

export default function SetPasswordPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { login: setAuthUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) setEmail(emailParam)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('auth', 'passwordsMismatch'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set password')

      setAuthUser(data.user)
      router.push('/account')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ marginBottom: '0.5rem' }}>{t('auth', 'setPassword')}</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '.9rem' }}>
          {t('auth', 'setPasswordDesc')}
        </p>

        {error && <div className="auth-message auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPw">{t('auth', 'password')}</label>
            <input
              type="password" id="newPw"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              placeholder={t('auth', 'passwordPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPw">{t('auth', 'confirmPassword')}</label>
            <input
              type="password" id="confirmPw"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8}
              placeholder={t('auth', 'confirmPasswordPlaceholder')}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? t('auth', 'setting') : t('auth', 'setPasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}

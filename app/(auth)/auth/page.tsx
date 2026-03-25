'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import PasswordRequirements, { passwordMeetsAllRules } from '@/components/PasswordRequirements'
import './auth.css'

type Tab = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  )
}

function AuthPageInner() {
  const router = useRouter()
  const { t } = useLocale()
  const { login: setAuthUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Login state
  const [loginData, setLoginData] = useState({ usernameOrEmail: '', password: '' })

  // Signup state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    petType: '' as string,
    gender: '',
    phone: '',
    birthdayMonth: '',
    birthdayDay: '',
    birthdayYear: '',
  })

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState<'email' | 'code'>('email')
  const [forgotCode, setForgotCode] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')

  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'login' || tab === 'signup') setActiveTab(tab)
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      setAuthUser(data.user)
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const birthday = signupData.birthdayMonth && signupData.birthdayDay && signupData.birthdayYear
        ? `${signupData.birthdayYear}-${signupData.birthdayMonth.padStart(2, '0')}-${signupData.birthdayDay.padStart(2, '0')}`
        : undefined
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `${signupData.firstName} ${signupData.lastName}`.trim(),
          username: signupData.username || undefined,
          email: signupData.email,
          petType: signupData.petType || undefined,
          gender: signupData.gender || undefined,
          phone: signupData.phone || undefined,
          birthday,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      router.push(`/verify-email?email=${encodeURIComponent(signupData.email)}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send code')

      setSuccess(t('auth', 'codeSent'))
      setForgotStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-and-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')

      setAuthUser(data.user)
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/auth/google-callback' })
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    setError(null)
    setSuccess(null)
    if (tab === 'forgot') {
      setForgotStep('email')
      setForgotCode('')
      setForgotNewPassword('')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
            {t('auth', 'logIn')}
          </button>
          <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>
            {t('auth', 'signUp')}
          </button>
        </div>

        {error && <div className="auth-message auth-error">{error}</div>}
        {success && <div className="auth-message auth-success">{success}</div>}

        {/* Login */}
        {activeTab === 'login' && (
          <div className="auth-form-container">
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="loginEmail">{t('auth', 'emailOrUsername')}</label>
                <input
                  type="text" id="loginEmail"
                  value={loginData.usernameOrEmail}
                  onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                  required placeholder={t('auth', 'emailOrUsernamePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">{t('auth', 'password')}</label>
                <input
                  type="password" id="loginPassword"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required placeholder={t('auth', 'passwordPlaceholder')}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t('auth', 'loggingIn') : t('auth', 'logIn')}
              </button>
            </form>
            <button type="button" className="forgot-link" onClick={() => switchTab('forgot')}>
              {t('auth', 'forgotPassword')}
            </button>

            <div className="auth-divider"><span>OR</span></div>
            <button type="button" onClick={handleGoogleLogin} className="btn-google">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth', 'continueWithGoogle')}
            </button>
          </div>
        )}

        {/* Signup */}
        {activeTab === 'signup' && (
          <div className="auth-form-container">
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signupFirstName">First Name *</label>
                  <input
                    type="text" id="signupFirstName"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    required placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="signupLastName">Last Name *</label>
                  <input
                    type="text" id="signupLastName"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    required placeholder="Last name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signupUsername">Username *</label>
                <input
                  type="text" id="signupUsername"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  required placeholder="Choose a username"
                  minLength={3} maxLength={30}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">{t('auth', 'email')} *</label>
                <input
                  type="email" id="signupEmail"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required placeholder={t('auth', 'emailPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('auth', 'petType')}</label>
                <div className="pet-type-group">
                  {(['Dog', 'Cat', 'Both', 'None'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`pet-type-btn ${signupData.petType === type ? 'active' : ''}`}
                      onClick={() => setSignupData({ ...signupData, petType: signupData.petType === type ? '' : type })}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signupGender">{t('auth', 'gender')}</label>
                  <select
                    id="signupGender"
                    value={signupData.gender}
                    onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                  >
                    <option value="">{t('auth', 'selectGender')}</option>
                    <option value="Male">{t('auth', 'male')}</option>
                    <option value="Female">{t('auth', 'female')}</option>
                    <option value="Other">{t('auth', 'otherGender')}</option>
                    <option value="Prefer not to say">{t('auth', 'preferNotToSay')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('auth', 'birthday')}</label>
                  <div className="birthday-input-group">
                    <input
                      type="text" inputMode="numeric" maxLength={2}
                      placeholder="MM"
                      value={signupData.birthdayMonth}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                        setSignupData({ ...signupData, birthdayMonth: v })
                        if (v.length === 2) document.getElementById('signupBdayDay')?.focus()
                      }}
                      className="birthday-input"
                    />
                    <span className="birthday-sep">/</span>
                    <input
                      type="text" inputMode="numeric" maxLength={2}
                      id="signupBdayDay"
                      placeholder="DD"
                      value={signupData.birthdayDay}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                        setSignupData({ ...signupData, birthdayDay: v })
                        if (v.length === 2) document.getElementById('signupBdayYear')?.focus()
                      }}
                      className="birthday-input"
                    />
                    <span className="birthday-sep">/</span>
                    <input
                      type="text" inputMode="numeric" maxLength={4}
                      id="signupBdayYear"
                      placeholder="YYYY"
                      value={signupData.birthdayYear}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setSignupData({ ...signupData, birthdayYear: v })
                      }}
                      className="birthday-input birthday-input-year"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signupPhone">{t('auth', 'phone')}</label>
                <input
                  type="tel" id="signupPhone"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder={t('auth', 'phonePlaceholder')}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? t('auth', 'creatingAccount') : t('auth', 'signUp')}
              </button>
            </form>

            <div className="auth-divider"><span>OR</span></div>
            <button type="button" onClick={handleGoogleLogin} className="btn-google">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth', 'signUpWithGoogle')}
            </button>
          </div>
        )}

        {/* Forgot password */}
        {activeTab === 'forgot' && (
          <div className="auth-form-container">
            <h3 className="forgot-title">{t('auth', 'forgotPassword')}</h3>
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotSendCode} className="auth-form">
                <div className="form-group">
                  <label htmlFor="forgotEmail">{t('auth', 'email')}</label>
                  <input
                    type="email" id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required placeholder={t('auth', 'emailPlaceholder')}
                  />
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? t('auth', 'sending') : t('auth', 'sendCode')}
                </button>
              </form>
            )}
            {forgotStep === 'code' && (
              <form onSubmit={handleForgotVerify} className="auth-form">
                <div className="form-group">
                  <label htmlFor="forgotCode">{t('auth', 'verificationCode')}</label>
                  <input
                    type="text" id="forgotCode"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    required maxLength={6} placeholder="000000"
                    className="code-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="forgotNewPw">{t('auth', 'newPasswordOptional')}</label>
                  <input
                    type="password" id="forgotNewPw"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    minLength={8}
                    placeholder={t('auth', 'newPasswordPlaceholder')}
                  />
                  <PasswordRequirements password={forgotNewPassword} />
                </div>
                <button type="submit" className="btn-submit" disabled={loading || (forgotNewPassword.length > 0 && !passwordMeetsAllRules(forgotNewPassword))}>
                  {loading ? t('auth', 'verifying') : t('auth', 'verifyAndLogin')}
                </button>
              </form>
            )}
            <button type="button" className="forgot-link" onClick={() => switchTab('login')}>
              {t('auth', 'backToLogin')}
            </button>
          </div>
        )}

        <div className="auth-footer">
          <Link href="/">← {t('auth', 'backToHome')}</Link>
        </div>
      </div>
    </div>
  )
}

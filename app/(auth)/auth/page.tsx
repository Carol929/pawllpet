'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './auth.css'

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 登录表单状态
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
  })

  // 注册表单状态
  const [signupData, setSignupData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    petType: '' as 'Cat' | 'Dog' | 'Both' | 'None yet' | '',
  })

  // 从URL参数中获取tab
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'login' || tab === 'signup') {
      setActiveTab(tab)
    }
  }, [])

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // 登录成功，重定向到首页或用户想要访问的页面
      setSuccess('Login successful! Redirecting...')
      router.push('/account')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 处理注册
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // 验证密码确认
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: signupData.fullName,
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          phone: signupData.phone || undefined,
          petType: signupData.petType || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // 注册成功
      setSuccess('Registration successful! Please check your email to verify your account.')
      setSignupData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        petType: '',
      })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 处理Google登录
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/signin/google'
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Tab切换 */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* 错误和成功消息 */}
        {error && (
          <div className="auth-message auth-error">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-message auth-success">
            {success} <Link href="/verify-email">Verify Email</Link>
          </div>
        )}

        {/* 登录表单 */}
        {activeTab === 'login' && (
          <div className="auth-form-container">
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="loginUsernameOrEmail">Username or Email</label>
                <input
                  type="text"
                  id="loginUsernameOrEmail"
                  value={loginData.usernameOrEmail}
                  onChange={(e) =>
                    setLoginData({ ...loginData, usernameOrEmail: e.target.value })
                  }
                  required
                  placeholder="Enter your username or email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            {/* Google登录按钮 */}
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-google"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* 注册表单 */}
        {activeTab === 'signup' && (
          <div className="auth-form-container">
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signupFullName">Full Name *</label>
                <input
                  type="text"
                  id="signupFullName"
                  value={signupData.fullName}
                  onChange={(e) =>
                    setSignupData({ ...signupData, fullName: e.target.value })
                  }
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupUsername">Username *</label>
                <input
                  type="text"
                  id="signupUsername"
                  value={signupData.username}
                  onChange={(e) =>
                    setSignupData({ ...signupData, username: e.target.value })
                  }
                  required
                  minLength={3}
                  maxLength={20}
                  placeholder="Choose a username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">Email *</label>
                <input
                  type="email"
                  id="signupEmail"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupPassword">Password *</label>
                <input
                  type="password"
                  id="signupPassword"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({ ...signupData, confirmPassword: e.target.value })
                  }
                  required
                  placeholder="Confirm your password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupPhone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="signupPhone"
                  value={signupData.phone}
                  onChange={(e) =>
                    setSignupData({ ...signupData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupPetType">Pet Type (Optional)</label>
                <select
                  id="signupPetType"
                  value={signupData.petType}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      petType: e.target.value as 'Cat' | 'Dog' | 'Both' | 'None yet' | '',
                    })
                  }
                >
                  <option value="">Select pet type</option>
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                  <option value="Both">Both</option>
                  <option value="None yet">None yet</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            {/* Google登录按钮 */}
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-google"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* 返回首页链接 */}
        <div className="auth-footer">
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}


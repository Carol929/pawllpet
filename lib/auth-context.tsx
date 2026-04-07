'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export type AuthUser = {
  id: string
  fullName: string
  username: string
  email: string
  phone: string | null
  petType: string | null
  gender: string | null
  birthday: string | null
  avatarUrl: string | null
  role: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  hasPassword: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_CACHE_KEY = 'pawll-auth-cache'
const AUTH_CACHE_TTL = 30_000 // 30 seconds

function getCachedAuth(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) return null
    const { user, ts } = JSON.parse(raw)
    if (Date.now() - ts < AUTH_CACHE_TTL) return user
  } catch {}
  return null
}

function setCachedAuth(user: AuthUser | null) {
  try {
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    return getCachedAuth()
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return getCachedAuth() === null
  })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setCachedAuth(data)
      } else {
        setUser(null)
        setCachedAuth(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh() }, [])

  const login = useCallback((u: AuthUser) => {
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setUser(null)
    try { sessionStorage.removeItem(AUTH_CACHE_KEY) } catch {}
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

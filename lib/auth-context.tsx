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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
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
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

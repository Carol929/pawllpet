'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const { login: setAuthUser } = useAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    fetch('/api/auth/google-session')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to establish session')
        return res.json()
      })
      .then((data) => {
        setAuthUser(data.user)
        router.push('/account')
        router.refresh()
      })
      .catch((err) => {
        console.error('Google callback error:', err)
        router.push('/auth?tab=login')
      })
  }, [setAuthUser, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ fontSize: '1.1rem', color: '#666' }}>Signing you in...</p>
    </div>
  )
}

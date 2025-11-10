'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<{ role?: string } | null>(null)

  // 检查登录状态（暂时使用简单的localStorage检查，后续会替换为NextAuth.js）
  useEffect(() => {
    // 这里后续会替换为NextAuth.js的session检查
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        // 用户未登录
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  return (
    <>
      {/* Top Banner */}
      <div className="top-banner">
        <div className="container">
          <p>Free shipping over $50 • 30-day returns • Secure checkout</p>
        </div>
      </div>

      {/* Header */}
      <header className="site-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link href="/" className="logo" aria-label="PawLL Home">
            <Image src="/logo.svg" alt="PawLL" width={50} height={50} className="logo-img" />
          </Link>

          {/* Navigation */}
          <nav className="nav" aria-label="Primary">
            <ul className="nav-list">
              <li><Link href="/#home">Home</Link></li>
              <li><Link href="/#collections">Shop</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#support">Support</Link></li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Search Box */}
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search toys / apparel / leashes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn" type="button">🔍</button>
            </div>

            {/* Language Selector */}
            <div className="language-selector">
              <button className="lang-btn active" data-lang="en">EN</button>
              <button className="lang-btn" data-lang="zh">中文</button>
            </div>

            {/* Cart */}
            <Link href="#cart" className="cart-btn" aria-label="Cart">
              🛒
              <span className="cart-badge">0</span>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <>
                <Link href="/account" className="btn-login">Account</Link>
                {user.role === 'admin' && (
                  <Link href="/admin/users" className="btn-signup">Admin</Link>
                )}
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    setUser(null)
                    window.location.href = '/'
                  }}
                  className="btn-signup"
                  style={{ background: '#dc3545' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth?tab=login" className="btn-login">Log in</Link>
                <Link href="/auth?tab=signup" className="btn-signup">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}


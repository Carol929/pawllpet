'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'

const nav = [
  ['Shop All', '/shop'],
  ['New Arrivals', '/new-arrivals'],
  ['Best Sellers', '/best-sellers'],
  ['Limited Drops', '/limited-drops'],
  ['Bundles', '/bundles'],
  ['Mystery Boxes', '/mystery-boxes'],
]

export default function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <header className="site-header">
      <div className="top-banner">Free shipping over $65 • Earn Paw Points on every order</div>
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="PawLL Pet Home">
          <Image src="/logo.jpg" alt="PawLL Pet" width={72} height={72} priority />
        </Link>

        <nav className="nav-list">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <form className="header-search" onSubmit={handleSearch} role="search">
            <Search className="header-search-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              className="header-search-input"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <div className="header-auth">
            <Link href="/auth" className="btn-header btn-header-outline">Log In</Link>
            <Link href="/auth" className="btn-header btn-header-filled">Sign Up</Link>
          </div>

          <Link href="/cart" className="header-cart-btn" aria-label="Shopping cart">
            <ShoppingCart size={22} strokeWidth={1.8} />
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="mobile-auth">
            <Link href="/auth" className="btn-header btn-header-outline" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link href="/auth" className="btn-header btn-header-filled" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  )
}

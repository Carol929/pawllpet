'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, ChevronDown, Globe, User, LogOut, Package, Settings } from 'lucide-react'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'

type SubItem = { labelKey: string; href: string; color: string }
type NavItem = { labelKey: string; href: string; subs: SubItem[] }

const navItems: NavItem[] = [
  {
    labelKey: 'newArrivals', href: '/new-arrivals',
    subs: [
      { labelKey: 'allNew', href: '/new-arrivals', color: '#f5ebe0' },
      { labelKey: 'forDogs', href: '/new-arrivals?pet=dog', color: '#fce8d5' },
      { labelKey: 'forCats', href: '/new-arrivals?pet=cat', color: '#fde4e4' },
    ],
  },
  {
    labelKey: 'cats', href: '/shop?pet=cat',
    subs: [
      { labelKey: 'toys', href: '/shop?pet=cat&category=toys', color: '#fce8f0' },
      { labelKey: 'treats', href: '/shop?pet=cat&category=treats', color: '#f9e0ea' },
      { labelKey: 'grooming', href: '/shop?pet=cat&category=grooming', color: '#f5d8e4' },
      { labelKey: 'accessories', href: '/shop?pet=cat&category=accessories', color: '#fce8f0' },
      { labelKey: 'beds', href: '/shop?pet=cat&category=beds', color: '#f9e0ea' },
      { labelKey: 'apparel', href: '/shop?pet=cat&category=apparel', color: '#f5d8e4' },
      { labelKey: 'feeders', href: '/shop?pet=cat&category=feeders-bowls', color: '#fce8f0' },
      { labelKey: 'travel', href: '/shop?pet=cat&category=travel', color: '#f9e0ea' },
    ],
  },
  {
    labelKey: 'dogs', href: '/shop?pet=dog',
    subs: [
      { labelKey: 'toys', href: '/shop?pet=dog&category=toys', color: '#e3f0ee' },
      { labelKey: 'treats', href: '/shop?pet=dog&category=treats', color: '#dce8f0' },
      { labelKey: 'grooming', href: '/shop?pet=dog&category=grooming', color: '#d5e4ed' },
      { labelKey: 'accessories', href: '/shop?pet=dog&category=accessories', color: '#e3f0ee' },
      { labelKey: 'beds', href: '/shop?pet=dog&category=beds', color: '#dce8f0' },
      { labelKey: 'apparel', href: '/shop?pet=dog&category=apparel', color: '#d5e4ed' },
      { labelKey: 'feeders', href: '/shop?pet=dog&category=feeders-bowls', color: '#e3f0ee' },
      { labelKey: 'travel', href: '/shop?pet=dog&category=travel', color: '#dce8f0' },
    ],
  },
  {
    labelKey: 'mysteryBoxes', href: '/mystery-boxes',
    subs: [
      { labelKey: 'dogBox', href: '/mystery-boxes?type=dog', color: '#e3f0ee' },
      { labelKey: 'catBox', href: '/mystery-boxes?type=cat', color: '#fce8f0' },
      { labelKey: 'surpriseBox', href: '/mystery-boxes?type=surprise', color: '#fef3e2' },
    ],
  },
]

export default function Header() {
  const router = useRouter()
  const { locale, setLocale, t } = useLocale()
  const { user, loading: authLoading, logout } = useAuth()
  const { totalItems } = useCart()
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openUserMenu = useCallback(() => {
    if (userMenuTimer.current) { clearTimeout(userMenuTimer.current); userMenuTimer.current = null }
    setUserMenuOpen(true)
  }, [])

  const closeUserMenu = useCallback(() => {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 200)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className="site-header">
      <div className="top-banner">{t('header', 'topBanner')}</div>
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="PawLL Pet Home">
          <Image src="/logo.png" alt="PawLL Pet" width={200} height={200} priority />
        </Link>

        <nav className="nav-list">
          {navItems.map((item) => (
            <div
              key={item.labelKey}
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setOpenDropdown(item.labelKey)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="nav-dropdown-trigger"
                aria-haspopup="true"
                aria-expanded={openDropdown === item.labelKey}
              >
                {t('nav', item.labelKey as any)}
                <ChevronDown size={14} className={`nav-chevron ${openDropdown === item.labelKey ? 'nav-chevron--open' : ''}`} />
              </Link>
              {openDropdown === item.labelKey && (
                <div className="nav-dropdown-panel" role="menu">
                  {item.subs.map((sub) => (
                    <Link key={sub.href} href={sub.href} className="nav-dropdown-pill" style={{ background: sub.color }} role="menuitem">
                      {t('nav', sub.labelKey as any)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <form className="header-search" onSubmit={handleSearch} role="search">
            <Search className="header-search-icon" size={18} aria-hidden="true" />
            <input
              type="search" className="header-search-input"
              placeholder={t('header', 'searchPlaceholder')}
              value={query} onChange={(e) => setQuery(e.target.value)}
              aria-label={t('header', 'searchPlaceholder')}
            />
          </form>

          {/* Auth: logged in vs not */}
          {!authLoading && !user && (
            <div className="header-auth">
              <Link href="/auth?tab=login" className="btn-header btn-header-outline">{t('header', 'logIn')}</Link>
              <Link href="/auth?tab=signup" className="btn-header btn-header-filled">{t('header', 'signUp')}</Link>
            </div>
          )}

          {!authLoading && user && (
            <div
              className="user-menu-wrapper"
              onMouseEnter={openUserMenu}
              onMouseLeave={closeUserMenu}
            >
              <button className="user-menu-trigger" aria-haspopup="true" aria-expanded={userMenuOpen}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="user-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="user-avatar">{userInitial}</span>
                )}
                <span className="user-name-display">{user.fullName.split(' ')[0]}</span>
                <ChevronDown size={14} className={`nav-chevron ${userMenuOpen ? 'nav-chevron--open' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-dropdown-box">
                    <Link href="/account" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <User size={16} /> {t('userMenu', 'myAccount')}
                    </Link>
                    <Link href="/account#orders" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} /> {t('userMenu', 'orderHistory')}
                    </Link>
                    <Link href="/account#settings" className="user-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={16} /> {t('userMenu', 'settings')}
                    </Link>
                    <button className="user-menu-item user-menu-logout" role="menuitem" onClick={handleLogout}>
                      <LogOut size={16} /> {t('userMenu', 'logOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="lang-toggle" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')} aria-label={locale === 'en' ? 'Switch to Chinese' : 'Switch to English'}>
            <Globe size={15} />
            {locale === 'en' ? '中文' : 'EN'}
          </button>

          <Link href="/cart" className="header-cart-btn" aria-label={t('header', 'cartLabel')}>
            <ShoppingCart size={22} strokeWidth={1.8} />
            {totalItems > 0 && <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('header', 'closeMenu') : t('header', 'openMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {navItems.map((item) => (
              <div key={item.labelKey} className="mobile-dropdown-group">
                <button
                  className="mobile-dropdown-trigger"
                  onClick={() => setExpandedMobile(expandedMobile === item.labelKey ? null : item.labelKey)}
                  aria-expanded={expandedMobile === item.labelKey}
                >
                  {t('nav', item.labelKey as any)}
                  <ChevronDown size={16} className={`nav-chevron ${expandedMobile === item.labelKey ? 'nav-chevron--open' : ''}`} />
                </button>
                {expandedMobile === item.labelKey && (
                  <div className="mobile-dropdown-list">
                    {item.subs.map((sub) => (
                      <Link key={sub.href} href={sub.href} className="nav-dropdown-pill" style={{ background: sub.color }} onClick={() => setMobileMenuOpen(false)}>
                        {t('nav', sub.labelKey as any)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile auth / user section */}
          {!authLoading && !user && (
            <div className="mobile-auth">
              <Link href="/auth?tab=login" className="btn-header btn-header-outline" onClick={() => setMobileMenuOpen(false)}>{t('header', 'logIn')}</Link>
              <Link href="/auth?tab=signup" className="btn-header btn-header-filled" onClick={() => setMobileMenuOpen(false)}>{t('header', 'signUp')}</Link>
            </div>
          )}
          {!authLoading && user && (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="user-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="user-avatar">{userInitial}</span>
                )}
                <span>{user.fullName}</span>
              </div>
              <Link href="/account" className="mobile-user-link" onClick={() => setMobileMenuOpen(false)}>
                {t('userMenu', 'myAccount')}
              </Link>
              <button className="mobile-user-link mobile-logout-btn" onClick={handleLogout}>
                {t('userMenu', 'logOut')}
              </button>
            </div>
          )}

          <div className="mobile-lang">
            <button className="lang-toggle" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
              <Globe size={15} />
              {locale === 'en' ? '切换中文' : 'Switch to EN'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

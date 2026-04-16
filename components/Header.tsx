'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, ChevronDown, Globe, User, LogOut, Package, Settings, Heart } from 'lucide-react'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'

type SubItem = { labelKey: string; href: string; color: string; icon: string }
type NavItem = { labelKey: string; href: string; icon: string; subs: SubItem[] }

const navItems: NavItem[] = [
  {
    labelKey: 'newArrivals', href: '/new-arrivals', icon: '✨',
    subs: [
      { labelKey: 'allNew', href: '/new-arrivals', color: '', icon: '🆕' },
      { labelKey: 'forDogs', href: '/new-arrivals?pet=dog', color: '', icon: '🐕' },
      { labelKey: 'forCats', href: '/new-arrivals?pet=cat', color: '', icon: '🐈' },
    ],
  },
  {
    labelKey: 'cats', href: '/shop?pet=cat', icon: '🐱',
    subs: [
      { labelKey: 'toys', href: '/shop?pet=cat#toys', color: '', icon: '🧸' },
      { labelKey: 'accessories', href: '/shop?pet=cat#accessories', color: '', icon: '🎀' },
      { labelKey: 'beds', href: '/shop?pet=cat#beds', color: '', icon: '🛏️' },
      { labelKey: 'bowls', href: '/shop?pet=cat#bowls', color: '', icon: '🍽️' },
    ],
  },
  {
    labelKey: 'dogs', href: '/shop?pet=dog', icon: '🐶',
    subs: [
      { labelKey: 'toys', href: '/shop?pet=dog#toys', color: '', icon: '🦴' },
      { labelKey: 'accessories', href: '/shop?pet=dog#accessories', color: '', icon: '🦮' },
      { labelKey: 'beds', href: '/shop?pet=dog#beds', color: '', icon: '🛏️' },
      { labelKey: 'bowls', href: '/shop?pet=dog#bowls', color: '', icon: '🍽️' },
    ],
  },
]

export default function Header() {
  const router = useRouter()
  const { locale, setLocale, t } = useLocale()
  const { user, loading: authLoading, logout } = useAuth()
  const { totalItems, clearCart } = useCart()
  const { wishlistIds } = useWishlist()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll() // check initial position
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ slug: string; name: string; image: string; price: number }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSearchInput(val: string) {
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(val.trim())}&limit=5`)
        .then(r => r.json())
        .then(data => {
          const items = (data.products || data || []).slice(0, 5)
          setSuggestions(items)
          setShowSuggestions(items.length > 0)
        })
        .catch(() => {})
    }, 300)
  }

  function handleLogout() {
    logout()
    clearCart()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className={`site-header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="top-banner">{t('header', 'topBanner')}</div>
      <div className="container header-inner">
        <div className="logo-group">
          <Link href="/" className="logo" aria-label="PawLL Pet Home">
            <Image src="/logo.png" alt="PawLL Pet" width={200} height={200} priority />
          </Link>
          <Link href="/about" className="about-link">About Us</Link>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <div
              key={item.labelKey}
              className="nav-dropdown-wrapper"
              onMouseEnter={() => { if (dropdownTimer.current) clearTimeout(dropdownTimer.current); setOpenDropdown(item.labelKey) }}
              onMouseLeave={() => { dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 350) }}
            >
              <Link
                href={item.href}
                className="nav-dropdown-trigger"
                aria-haspopup="true"
                aria-expanded={openDropdown === item.labelKey}
              >
                {item.icon} {t('nav', item.labelKey as any)}
                <ChevronDown size={14} className={`nav-chevron ${openDropdown === item.labelKey ? 'nav-chevron--open' : ''}`} />
              </Link>
              {openDropdown === item.labelKey && (
                <div className="nav-dropdown-panel" role="menu">
                  {item.subs.map((sub) => (
                    <Link key={sub.href} href={sub.href} className="nav-dropdown-pill" style={{ background: sub.color }} role="menuitem">
                      {sub.icon} {t('nav', sub.labelKey as any)}
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
              value={query} onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              aria-label={t('header', 'searchPlaceholder')}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-autocomplete">
                {suggestions.map(s => (
                  <Link key={s.slug} href={`/products/${s.slug}`} className="search-suggestion" onClick={() => { setShowSuggestions(false); setQuery('') }}>
                    <img src={s.image} alt="" className="search-suggestion-img" />
                    <span className="search-suggestion-name">{s.name}</span>
                    <span className="search-suggestion-price">${s.price.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
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

          <div className="lang-dropdown-wrapper" onMouseEnter={() => { if (langMenuTimer.current) clearTimeout(langMenuTimer.current); setLangMenuOpen(true) }} onMouseLeave={() => { langMenuTimer.current = setTimeout(() => setLangMenuOpen(false), 300) }}>
            <button className="lang-toggle" aria-label="Language">
              <Globe size={15} />
              Language
            </button>
            {langMenuOpen && (
              <div className="lang-dropdown">
                {([['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어']] as const).map(([code, name]) => (
                  <button key={code} className={`lang-option ${locale === code ? 'lang-option--active' : ''}`} onClick={() => { setLocale(code as any); setLangMenuOpen(false) }}>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/wishlist" className="header-wishlist-btn" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.8} />
            {wishlistIds.size > 0 && <span className="wishlist-badge">{wishlistIds.size > 99 ? '99+' : wishlistIds.size}</span>}
          </Link>

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
                  {item.icon} {t('nav', item.labelKey as any)}
                  <ChevronDown size={16} className={`nav-chevron ${expandedMobile === item.labelKey ? 'nav-chevron--open' : ''}`} />
                </button>
                {expandedMobile === item.labelKey && (
                  <div className="mobile-dropdown-list">
                    {item.subs.map((sub) => (
                      <Link key={sub.href} href={sub.href} className="nav-dropdown-pill" style={{ background: sub.color }} onClick={() => setMobileMenuOpen(false)}>
                        {sub.icon} {t('nav', sub.labelKey as any)}
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
            <select className="mobile-lang-select" value={locale} onChange={e => setLocale(e.target.value as any)}>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>
      )}
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

function InstagramIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
}

function TikTokIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.1a8.16 8.16 0 005.58 2.19v-3.45a4.85 4.85 0 01-3.77-1.87 4.83 4.83 0 003.77-2.76z"/></svg>
}

export default function Footer() {
  const { locale } = useLocale()
  const en = locale === 'en'
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="site-footer">
      {/* Social Bar */}
      <div className="container footer-social-bar">
        <h3 className="footer-social-title">FOLLOW US ON</h3>
        <div className="footer-social-icons">
          <a href="https://www.instagram.com/pawllpet" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          <a href="https://www.tiktok.com/@pawllpet" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon /></a>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* Main Footer */}
      <div className="container footer-main">
        {/* Join Community + Contact */}
        <div className="footer-community">
          <h4>JOIN THE COMMUNITY</h4>
          <p>{en ? 'Be the first to catch our new releases, exclusive offers, and more.' : '第一时间获取新品发布、独家优惠等信息。'}</p>
          {subscribed ? (
            <p className="footer-subscribed">{en ? 'Thanks for subscribing!' : '感谢订阅！'}</p>
          ) : (
            <form className="footer-subscribe" onSubmit={handleSubscribe}>
              <input type="email" placeholder={en ? 'Your email address' : '输入邮箱地址'} value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit">Sign Me Up</button>
            </form>
          )}

          <div className="footer-contact-block">
            <h4>{en ? 'Contact Us' : '联系我们'}</h4>
            <p><strong>Email</strong><br />support@pawllpet.com</p>
            <Link href="/help-center" className="footer-help-link">{en ? 'Visit Help Center (FAQs)' : '访问帮助中心'}</Link>
          </div>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>SUPPORT</h4>
          <Link href="/faq">FAQ</Link>
          <Link href="/shipping-policy">{en ? 'Shipping Info' : '配送信息'}</Link>
          <Link href="/privacy-policy">{en ? 'Privacy Policy' : '隐私政策'}</Link>
          <Link href="/terms-conditions">{en ? 'Terms & Conditions' : '服务条款'}</Link>
          <Link href="/track-order">{en ? 'Track Your Order' : '订单追踪'}</Link>
          <Link href="/returns-policy">{en ? 'Returns' : '退货政策'}</Link>
          <Link href="/exchange-policy">{en ? 'Exchange' : '换货政策'}</Link>
          <button className="footer-link-btn" onClick={() => { localStorage.removeItem('pawll-cookie-consent'); window.location.reload() }}>
            {en ? 'Cookie Preferences' : 'Cookie 设置'}
          </button>
          <button className="footer-link-btn" onClick={() => { localStorage.setItem('pawll-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false })); alert(en ? 'Your preferences have been saved. We will not sell or share your personal information.' : '您的偏好已保存。我们不会出售或分享您的个人信息。') }}>
            {en ? 'Do Not Sell My Info' : '请勿出售我的信息'}
          </button>
        </div>

        {/* About Us */}
        <div className="footer-col">
          <h4>{en ? 'ABOUT US' : '关于我们'}</h4>
          <Link href="/about">{en ? 'About' : '关于'}</Link>
          <Link href="/contact">{en ? 'Contact Us' : '联系我们'}</Link>
        </div>

        {/* Shop */}
        <div className="footer-col">
          <h4>SHOP</h4>
          <Link href="/new-arrivals">{en ? 'New Arrivals' : '新品'}</Link>
          <Link href="/shop-by-pet">{en ? 'Shop by Pet' : '按宠物购物'}</Link>
          <Link href="/shop-by-need">{en ? 'Shop by Need' : '按需求购物'}</Link>
          <Link href="/mystery-boxes">{en ? 'Mystery Boxes' : '盲盒'}</Link>
          <Link href="/best-sellers">{en ? 'Best Sellers' : '热销商品'}</Link>
          <Link href="/pet-quiz">{en ? 'Pet Quiz 🎁' : '宠物问卷 🎁'}</Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} PawLL Pet. {en ? 'All rights reserved.' : '保留所有权利。'}</p>
      </div>
    </footer>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <Image src="/logo.png" alt="PawLL Pet" width={90} height={90} />
          </div>
          <p>{t('footer', 'tagline')}</p>
        </div>
        <div>
          <h4>{t('footer', 'shop')}</h4>
          <Link href="/shop">{t('footer', 'shopAll')}</Link>
          <Link href="/shop-by-pet">{t('footer', 'shopByPet')}</Link>
          <Link href="/shop-by-need">{t('footer', 'shopByNeed')}</Link>
        </div>
        <div>
          <h4>{t('footer', 'help')}</h4>
          <Link href="/faq">{t('footer', 'faq')}</Link>
          <Link href="/help-center">{t('footer', 'helpCenter')}</Link>
          <Link href="/track-order">{t('footer', 'trackOrder')}</Link>
          <Link href="/returns-policy">{t('footer', 'returns')}</Link>
        </div>
        <div>
          <h4>{t('footer', 'follow')}</h4>
          <a href="https://www.tiktok.com/@pawllpet?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer">
            TikTok @pawllpet
          </a>
          <a href="https://www.instagram.com/pawllpet?igsh=Y3B5aXl5eXN2M2Nx&utm_source=qr" target="_blank" rel="noreferrer">
            Instagram @pawllpet
          </a>
          <Link href="/contact">{t('footer', 'contact')}</Link>
        </div>
      </div>
    </footer>
  )
}

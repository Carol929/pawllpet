import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <Image src="/logo.svg" alt="PawLL Pet" width={42} height={42} />
            <h4>PawLL Pet</h4>
          </div>
          <p>Premium pet essentials with collectible drop energy.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/shop">Shop all</Link>
          <Link href="/shop-by-pet">Shop by pet</Link>
          <Link href="/shop-by-need">Shop by need</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link href="/faq">FAQ</Link>
          <Link href="/help-center">Help Center</Link>
          <Link href="/track-order">Track order</Link>
          <Link href="/returns-policy">Returns</Link>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="https://www.tiktok.com/@pawllpet?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer">
            TikTok @pawllpet
          </a>
          <a href="https://www.instagram.com/pawllpet?igsh=Y3B5aXl5eXN2M2Nx&utm_source=qr" target="_blank" rel="noreferrer">
            Instagram @pawllpet
          </a>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

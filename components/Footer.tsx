import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h4>PawLL Pet</h4>
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
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

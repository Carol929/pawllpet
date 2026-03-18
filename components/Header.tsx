import Image from 'next/image'
import Link from 'next/link'

const nav = [
  ['Shop All', '/shop'],
  ['New Arrivals', '/new-arrivals'],
  ['Best Sellers', '/best-sellers'],
  ['Limited Drops', '/limited-drops'],
  ['Bundles', '/bundles'],
  ['Mystery Boxes', '/mystery-boxes'],
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="top-banner">Free shipping over $65 • Earn Paw Points on every order</div>
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="PawLL Pet Home">
          <Image src="/logo.jpg" alt="PawLL Pet" width={58} height={58} priority />
        </Link>
        <nav className="nav-list">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/search">Search</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
    </header>
  )
}

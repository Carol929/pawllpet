import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Newsletter Section */}
      <div className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-icon">✉️</div>
            <h3>Join PawLL for new drops & exclusive deals</h3>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button className="newsletter-btn">Subscribe</button>
            </div>
            <p className="newsletter-disclaimer">You can unsubscribe anytime</p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-logo">
                <Image src="/logo.svg" alt="PawLL" width={40} height={40} />
              </div>
              <p>Category scope: PawLL does not sell any food or wash/care products.</p>
            </div>
            <div className="footer-section">
              <h4>Shop</h4>
              <ul>
                <li><Link href="#">Toys</Link></li>
                <li><Link href="#">Apparel</Link></li>
                <li><Link href="#">Leashes & Collars</Link></li>
                <li><Link href="#">New In</Link></li>
                <li><Link href="#">Bestsellers</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Information</h4>
              <ul>
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Size Guide</Link></li>
                <li><Link href="#">Shipping & Returns</Link></li>
                <li><Link href="#">FAQ</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <div className="contact-info">
                <p>Contact</p>
                <p>📧 pawll.pet.llc@gmail.com</p>
                <p>Mon-Fri 10:00-18:00</p>
              </div>
              <div className="social-links">
                <h5>Follow Us</h5>
                <div className="social-icons">
                  <a href="#" className="social-link">📷 @pawllpet</a>
                  <a href="#" className="social-link">🎵 @pawllpet</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>Free shipping over $50; 30-day returns (see policy).</p>
            <p>© 2025 PawLL. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}


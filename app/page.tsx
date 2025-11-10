import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">Closer with your pet— play happy, dress cute, walk safe.</h1>
            <p className="hero-description">
              PawLL focuses on toys, apparel, and leashes & collars. We do not sell any food or wash/care products—just trusted everyday essentials for you and your pet.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Shop Toys</button>
              <button className="btn-secondary">Shop Leashes</button>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop&crop=center"
              alt="Corgi jumping with frisbee"
              width={600}
              height={400}
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <div className="shield-icon"></div>
              </div>
              <h3>Safe Materials</h3>
              <p>Bite-tested, non-toxic fabrics & rubber</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <div className="heart-icon"></div>
              </div>
              <h3>Comfy Fit</h3>
              <p>Pet-friendly patterns, machine-washable, broad sizing</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <div className="lock-icon"></div>
              </div>
              <h3>Secure & Adjustable</h3>
              <p>Durable hardware, adjustable length, safer walks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="collections" id="collections">
        <div className="container">
          <h2 className="section-title">Featured Collections</h2>
          <div className="collections-grid">
            <div className="collection-card">
              <div className="collection-image">
                <Image
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center"
                  alt="Plush toys"
                  width={400}
                  height={300}
                />
              </div>
              <h3>Toys</h3>
              <p>Interactive, enrichment, chew-friendly</p>
              <Link href="#" className="explore-link">Explore →</Link>
            </div>
            <div className="collection-card">
              <div className="collection-image">
                <Image
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center"
                  alt="Dog in floral dress"
                  width={400}
                  height={300}
                />
              </div>
              <h3>Apparel</h3>
              <p>Seasonal wear, raincoats, festive fits</p>
              <Link href="#" className="explore-link">Explore →</Link>
            </div>
            <div className="collection-card">
              <div className="collection-image">
                <Image
                  src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop&crop=center"
                  alt="Dog with leash"
                  width={400}
                  height={300}
                />
              </div>
              <h3>Leashes & Collars</h3>
              <p>Anti-pull, reflective, everyday walks</p>
              <Link href="#" className="explore-link">Explore →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bestsellers">
        <div className="container">
          <h2 className="section-title">Bestsellers</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">
                <Image
                  src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop&crop=center"
                  alt="PawLL Reflective Adjustable Leash"
                  width={300}
                  height={300}
                />
              </div>
              <h3>PawLL Reflective Adjustable Leash</h3>
              <p>Light yet sturdy comfort</p>
              <div className="product-price">$29.99</div>
              <button className="btn-add-cart">Add to Cart</button>
            </div>
            <div className="product-card">
              <div className="product-image">
                <Image
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop&crop=center"
                  alt="Durable Puzzle Toy Ball"
                  width={300}
                  height={300}
                />
              </div>
              <h3>Durable Puzzle Toy Ball</h3>
              <p>Hidden treat channel (feature only; PawLL does not sell food)</p>
              <div className="product-price">$18.99</div>
              <button className="btn-add-cart">Add to Cart</button>
            </div>
            <div className="product-card">
              <div className="product-image">
                <Image
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop&crop=center"
                  alt="Cozy Pet Hoodie"
                  width={300}
                  height={300}
                />
              </div>
              <h3>Cozy Pet Hoodie</h3>
              <p>Soft fleece, machine-washable</p>
              <div className="product-price">$24.99</div>
              <button className="btn-add-cart">Add to Cart</button>
            </div>
            <div className="product-card">
              <div className="product-image">
                <Image
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop&crop=center"
                  alt="Chew-Proof Rope Toy"
                  width={300}
                  height={300}
                />
              </div>
              <h3>Chew-Proof Rope Toy</h3>
              <p>Interactive tug & dental health</p>
              <div className="product-price">$14.99</div>
              <button className="btn-add-cart">Add to Cart</button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container about-inner">
          <div className="about-content">
            <h2>About PawLL</h2>
            <p>
              At PawLL, pets are family. We focus on the everyday essentials—toys, apparel, leashes & collars—not food or wash products. We make every moment together warmer and easier.
            </p>
          </div>
          <div className="about-image">
            <Image
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop&crop=center"
              alt="Cute puppy"
              width={500}
              height={400}
              className="about-img"
            />
          </div>
        </div>
      </section>
    </>
  )
}


'use client'

import { useLocale } from '@/lib/i18n'
import { Heart, Shield, Leaf, Users, Home, HandHeart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const { locale } = useLocale()
  const en = locale !== 'zh'

  return (
    <main className="container page-stack">
      {/* Hero */}
      <section className="about-hero">
        <h1 className="about-hero-title">
          {en ? 'Every Paw Deserves Love' : '每一只爪子都值得被爱'}
        </h1>
        <p className="about-hero-slogan">
          {en
            ? 'Premium pet essentials, designed with care — because they give us everything, and they deserve the best.'
            : '用心设计的优质宠物用品 —— 因为它们给了我们一切，它们值得最好的。'}
        </p>
      </section>

      {/* Our Mission */}
      <section className="about-section">
        <h2>{en ? 'Our Mission' : '我们的使命'}</h2>
        <p>
          {en
            ? 'At PawLL, we believe pet ownership is a journey of love, joy, and responsibility. Our mission is to create high-quality, thoughtfully designed products that bring comfort to pets and happiness to their families. Every item we offer is selected with safety, durability, and style in mind.'
            : 'PawLL 相信养宠物是一段充满爱、快乐和责任的旅程。我们的使命是打造高品质、用心设计的产品，为宠物带来舒适，为家庭带来幸福。我们提供的每件商品都经过安全性、耐用性和美观性的严格筛选。'}
        </p>
        <p>
          {en
            ? 'Founded in Arlington, Virginia, PawLL started from a simple idea: pets are family, and family deserves the best. From cozy beds to durable toys, every product reflects our commitment to quality and our love for animals.'
            : '创立于弗吉尼亚州阿灵顿，PawLL 源于一个简单的想法：宠物是家人，家人值得最好的。从舒适的窝到耐用的玩具，每件产品都体现了我们对品质的承诺和对动物的热爱。'}
        </p>
      </section>

      {/* Values */}
      <section className="about-section">
        <h2>{en ? 'What We Stand For' : '我们的价值观'}</h2>
        <div className="info-cards">
          <div className="info-card">
            <Heart size={28} />
            <h3>{en ? 'Designed with Love' : '用心设计'}</h3>
            <p>{en ? 'Every product is thoughtfully crafted for pet comfort and owner aesthetics.' : '每件产品都为宠物舒适和主人审美精心打造。'}</p>
          </div>
          <div className="info-card">
            <Shield size={28} />
            <h3>{en ? 'Safety First' : '安全优先'}</h3>
            <p>{en ? 'All materials are safety-tested to ensure they\'re harmless for pets and families.' : '所有材料均经过安全测试，确保对宠物和家庭无害。'}</p>
          </div>
          <div className="info-card">
            <Leaf size={28} />
            <h3>{en ? 'Sustainability' : '可持续发展'}</h3>
            <p>{en ? 'We\'re committed to eco-friendly materials and reducing our environmental footprint.' : '我们致力于使用环保材料，减少对环境的影响。'}</p>
          </div>
          <div className="info-card">
            <Users size={28} />
            <h3>{en ? 'Community' : '社区'}</h3>
            <p>{en ? 'Building a community of pet lovers who share our passion for animal welfare.' : '建立一个拥有共同动物福利热情的宠物爱好者社区。'}</p>
          </div>
        </div>
      </section>

      {/* Shelter Partnership */}
      <section className="about-section about-shelter">
        <div className="about-shelter-header">
          <HandHeart size={36} />
          <h2>{en ? 'Giving Back: Our Shelter Partnerships' : '回馈社会：我们的救助站合作'}</h2>
        </div>
        <p>
          {en
            ? 'We believe every animal deserves a loving home. That\'s why PawLL partners with local shelters and rescue organizations in the Virginia area to help pets in need find their forever families.'
            : '我们相信每只动物都应该有一个温暖的家。PawLL 与弗吉尼亚地区的动物救助站和救援组织合作，帮助需要帮助的宠物找到永远的家。'}
        </p>

        <div className="about-shelter-grid">
          <div className="about-shelter-card">
            <Home size={24} />
            <h3>{en ? 'Shelter Visits & Volunteering' : '走访救助站与志愿服务'}</h3>
            <p>{en
              ? 'Our team regularly visits local shelters to volunteer, provide supplies, and spend time with animals awaiting adoption.'
              : '我们的团队定期走访当地救助站，提供志愿服务和物资，陪伴等待领养的动物。'}</p>
          </div>
          <div className="about-shelter-card">
            <Heart size={24} />
            <h3>{en ? 'Adoption Support' : '领养支持'}</h3>
            <p>{en
              ? 'We support adoption events and help connect shelters with potential pet parents. Adopt, don\'t shop — and when you do shop, shop PawLL.'
              : '我们支持领养活动，帮助救助站与潜在的宠物家长建立联系。领养代替购买 —— 当你需要购物时，选择 PawLL。'}</p>
          </div>
          <div className="about-shelter-card">
            <HandHeart size={24} />
            <h3>{en ? 'Product Donations' : '产品捐赠'}</h3>
            <p>{en
              ? 'A portion of our proceeds goes toward donating toys, beds, and supplies to shelters across Virginia.'
              : '我们将部分收益用于向弗吉尼亚各地的救助站捐赠玩具、宠物床和用品。'}</p>
          </div>
        </div>

        <div className="about-shelter-partners">
          <h3>{en ? 'Shelters We Support' : '我们支持的救助站'}</h3>
          <ul>
            <li><strong>Animal Welfare League of Arlington (AWLA)</strong> — Arlington, VA</li>
            <li><strong>Lucky Dog Animal Rescue</strong> — Arlington, VA</li>
            <li><strong>Homeward Trails Animal Rescue</strong> — Fairfax, VA</li>
            <li><strong>Humane Rescue Alliance</strong> — Washington, D.C.</li>
          </ul>
          <p className="about-shelter-note">
            {en
              ? 'Want to partner with us or suggest a shelter? Reach out at support@pawllpet.com'
              : '想与我们合作或推荐救助站？请联系 support@pawllpet.com'}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>{en ? 'Join the PawLL Family' : '加入 PawLL 大家庭'}</h2>
        <p>{en
          ? 'Every purchase helps us support shelters and create better products for pets everywhere.'
          : '每一次购买都帮助我们支持救助站，为各地的宠物创造更好的产品。'}</p>
        <Link href="/shop" className="btn-primary">{en ? 'Shop Now' : '立即购物'} →</Link>
      </section>
    </main>
  )
}

'use client'

import { useLocale } from '@/lib/i18n'
import { Heart, Shield, Leaf, Users, Home, HandHeart, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  const { locale } = useLocale()
  const en = locale !== 'zh'

  return (
    <main className="container page-stack">
      {/* Hero */}
      <section className="about-hero">
        <h1 className="about-hero-title">Eco love for every paw.</h1>
        <p className="about-hero-slogan">
          {en
            ? 'Rooted in sustainability, we let every pet\'s joy live in harmony with the Earth. PawLL designs eco-friendly essentials where pets and the planet thrive together.'
            : '根植于可持续发展，让每只宠物的快乐与地球和谐共生。PawLL 设计环保宠物用品，让宠物与地球共同繁荣。'}
        </p>
      </section>

      {/* Mission */}
      <section className="about-section">
        <h2>{en ? 'Our Mission' : '我们的使命'}</h2>
        <p>
          {en
            ? 'At PawLL, we believe that caring for our pets and caring for our planet go hand in hand. Every product we create starts with a simple question: can we make this better for pets and gentler on the Earth? From sustainably sourced materials to eco-conscious packaging, we\'re building a future where loving your pet means loving the world they live in.'
            : 'PawLL 相信，关爱宠物与关爱地球可以并行不悖。我们创造的每件产品都始于一个简单的问题：能否让它对宠物更好，对地球更温柔？从可持续采购的材料到环保包装，我们正在构建一个未来 —— 爱你的宠物，就是爱它们生活的世界。'}
        </p>
        <p>
          {en
            ? 'Founded in Arlington, Virginia, PawLL was born from a love for animals and a commitment to sustainability. We design eco-friendly essentials — cozy beds, durable toys, and thoughtful accessories — that bring joy to pets without costing the Earth.'
            : '创立于弗吉尼亚州阿灵顿，PawLL 源于对动物的热爱和对可持续发展的承诺。我们设计环保宠物用品 —— 舒适的窝、耐用的玩具和贴心的配饰 —— 为宠物带来快乐，同时不以牺牲地球为代价。'}
        </p>
      </section>

      {/* Values */}
      <section className="about-section">
        <h2>{en ? 'What We Stand For' : '我们的价值观'}</h2>
        <div className="info-cards">
          <div className="info-card">
            <Leaf size={28} />
            <h3>{en ? 'Eco-Friendly Design' : '环保设计'}</h3>
            <p>{en ? 'Every product is crafted with sustainable materials and minimal environmental impact in mind.' : '每件产品都采用可持续材料精心制作，尽量减少对环境的影响。'}</p>
          </div>
          <div className="info-card">
            <Shield size={28} />
            <h3>{en ? 'Safety First' : '安全优先'}</h3>
            <p>{en ? 'All materials are rigorously tested to ensure they\'re safe and non-toxic for pets and families.' : '所有材料均经过严格测试，确保对宠物和家庭安全无毒。'}</p>
          </div>
          <div className="info-card">
            <Heart size={28} />
            <h3>{en ? 'Designed with Love' : '用心设计'}</h3>
            <p>{en ? 'We pour care into every detail — because pets give us everything, and they deserve the best.' : '我们用心打磨每一个细节 —— 因为宠物给了我们一切，它们值得最好的。'}</p>
          </div>
          <div className="info-card">
            <Users size={28} />
            <h3>{en ? 'Community' : '社区'}</h3>
            <p>{en ? 'Building a community of eco-conscious pet lovers who believe in making a difference, one paw at a time.' : '建立一个环保宠物爱好者社区，相信每一个小小的改变都能带来大大的不同。'}</p>
          </div>
        </div>
      </section>

      {/* Shelter Partnership */}
      <section className="about-section about-shelter">
        <div className="about-shelter-header">
          <HandHeart size={36} />
          <h2>{en ? 'Giving Back: Homeward Trails Animal Rescue' : '回馈社会：Homeward Trails 动物救助'}</h2>
        </div>
        <p>
          {en
            ? 'We believe every animal deserves a loving home. PawLL proudly partners with Homeward Trails Animal Rescue in Fairfax, Virginia — a dedicated organization that rescues animals from high-kill shelters and provides them with foster care until they find their forever families.'
            : '我们相信每只动物都应该有一个温暖的家。PawLL 自豪地与位于弗吉尼亚州费尔法克斯的 Homeward Trails Animal Rescue 合作 —— 这是一个致力于从高安乐死率收容所救助动物的组织，为它们提供寄养家庭，直到找到永远的家。'}
        </p>

        {/* Shelter Photos */}
        <div className="about-photo-gallery">
          <div className="about-photo-item">
            <Image
              src="/shelter/shelter-cats-1.jpg"
              alt={en ? 'Cats at Homeward Trails Animal Rescue' : 'Homeward Trails 救助站的猫咪'}
              width={600}
              height={450}
              className="about-photo-img"
            />
            <p className="about-photo-caption">
              {en ? 'Furry friends waiting for their forever homes' : '毛茸茸的朋友们等待着它们永远的家'}
            </p>
          </div>
          <div className="about-photo-item">
            <Image
              src="/shelter/shelter-cats-2.jpg"
              alt={en ? 'A cat playing at Homeward Trails' : 'Homeward Trails 的猫咪在玩耍'}
              width={600}
              height={450}
              className="about-photo-img"
            />
            <p className="about-photo-caption">
              {en ? 'Every visit reminds us why we do what we do' : '每次拜访都提醒我们为何要做这件事'}
            </p>
          </div>
        </div>

        <div className="about-shelter-grid">
          <div className="about-shelter-card">
            <Home size={24} />
            <h3>{en ? 'Shelter Visits & Volunteering' : '走访救助站与志愿服务'}</h3>
            <p>{en
              ? 'Our team regularly visits Homeward Trails to volunteer, provide supplies, and spend time with animals awaiting adoption.'
              : '我们的团队定期走访 Homeward Trails，提供志愿服务和物资，陪伴等待领养的动物。'}</p>
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
              ? 'A portion of our proceeds goes toward donating eco-friendly toys, beds, and supplies to animals in need.'
              : '我们将部分收益用于向需要帮助的动物捐赠环保玩具、宠物床和用品。'}</p>
          </div>
        </div>

        <div className="about-shelter-partners">
          <h3>{en ? 'Our Partner' : '我们的合作伙伴'}</h3>
          <ul>
            <li><strong>Homeward Trails Animal Rescue</strong> — Fairfax, VA</li>
          </ul>
          <p className="about-shelter-note">
            {en
              ? 'Want to partner with us or suggest a shelter? Reach out at support@pawllpet.com'
              : '想与我们合作或推荐救助站？请联系 support@pawllpet.com'}
          </p>
        </div>
      </section>

      {/* Video / Our Story — placeholder for future video content */}
      <section className="about-section about-video-section">
        <h2>{en ? 'Our Story' : '我们的故事'}</h2>
        <p>
          {en
            ? 'From a small idea in Arlington to an eco-conscious pet brand, our journey has been driven by one belief: pets and the planet can thrive together. Stay tuned — we\'re working on something special to share our story with you.'
            : '从阿灵顿的一个小小想法到一个环保宠物品牌，我们的旅程始终由一个信念驱动：宠物与地球可以共同繁荣。敬请期待 —— 我们正在准备一些特别的内容与你分享。'}
        </p>
        <div className="about-video-placeholder">
          <Play size={48} />
          <span>{en ? 'Video coming soon' : '视频即将上线'}</span>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>{en ? 'Join the PawLL Family' : '加入 PawLL 大家庭'}</h2>
        <p>{en
          ? 'Every purchase supports shelter animals and helps build a more sustainable world for pets everywhere. Eco love for every paw.'
          : '每一次购买都支持救助动物，帮助为各地宠物构建一个更可持续的世界。生态之爱，献给每一只爪子。'}</p>
        <Link href="/shop" className="btn-primary">{en ? 'Shop Now' : '立即购物'} →</Link>
      </section>
    </main>
  )
}

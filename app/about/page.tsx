'use client'

import { useLocale } from '@/lib/i18n'
import { Heart, Shield, Leaf } from 'lucide-react'

export default function AboutPage() {
  const { locale } = useLocale()

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '关于 PawLL' : 'About PawLL'}</h1>

      <div className="about-hero">
        <p className="about-tagline">
          {locale === 'zh'
            ? '我们相信每一只宠物都值得拥有精心设计的用品，让日常生活变得更温暖、更快乐。'
            : 'We believe every pet deserves thoughtfully designed essentials that make everyday life warmer and happier.'}
        </p>
      </div>

      <div className="about-story">
        <h2>{locale === 'zh' ? '我们的故事' : 'Our Story'}</h2>
        <p>
          {locale === 'zh'
            ? 'PawLL 诞生于对宠物的热爱和对品质的追求。我们的创始团队由一群宠物爱好者组成，他们发现市面上很难找到既美观又实用的宠物用品。于是，PawLL 应运而生——一个融合了潮流设计与宠物关怀的品牌。'
            : 'PawLL was born from a love for pets and a passion for quality. Our founding team of pet enthusiasts noticed a gap in the market for pet products that are both beautiful and functional. PawLL bridges that gap — a brand that combines trendy design with genuine pet care.'}
        </p>
        <p>
          {locale === 'zh'
            ? '从精选的猫咪窝到限量发售的惊喜盲盒，我们精心挑选每一件产品，确保它不仅能让你的宠物舒适快乐，还能为你的家增添一份美好。'
            : 'From curated cat beds to limited-edition mystery boxes, we carefully select every product to ensure it not only keeps your pet comfortable and happy, but also adds a touch of beauty to your home.'}
        </p>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <Heart size={28} />
          <h3>{locale === 'zh' ? '用心设计' : 'Designed with Love'}</h3>
          <p>{locale === 'zh' ? '每件产品都经过精心设计，兼顾宠物舒适和主人审美。' : 'Every product is thoughtfully designed for pet comfort and owner aesthetics.'}</p>
        </div>
        <div className="info-card">
          <Shield size={28} />
          <h3>{locale === 'zh' ? '安全优先' : 'Safety First'}</h3>
          <p>{locale === 'zh' ? '所有材料均经过安全测试，确保对宠物和家庭无害。' : 'All materials are safety-tested to ensure they\'re harmless for pets and homes.'}</p>
        </div>
        <div className="info-card">
          <Leaf size={28} />
          <h3>{locale === 'zh' ? '可持续发展' : 'Sustainability'}</h3>
          <p>{locale === 'zh' ? '我们致力于使用环保材料，减少对环境的影响。' : 'We\'re committed to using eco-friendly materials and reducing our environmental footprint.'}</p>
        </div>
      </div>
    </main>
  )
}

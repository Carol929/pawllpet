'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { HelpCircle, Package, RotateCcw, Truck, MessageCircle, CreditCard, UserCircle } from 'lucide-react'

const helpTopics = [
  { href: '/faq', icon: HelpCircle, titleEn: 'FAQ', titleZh: '常见问题', descEn: 'Find answers to common questions', descZh: '查找常见问题的答案' },
  { href: '/track-order', icon: Package, titleEn: 'Track Order', titleZh: '订单追踪', descEn: 'Check the status of your order', descZh: '查看订单状态' },
  { href: '/returns-policy', icon: RotateCcw, titleEn: 'Returns & Exchanges', titleZh: '退换货', descEn: 'Learn about our return policy', descZh: '了解退换货政策' },
  { href: '/shipping-policy', icon: Truck, titleEn: 'Shipping Info', titleZh: '物流信息', descEn: 'Shipping methods and delivery times', descZh: '配送方式和时效' },
  { href: '/contact', icon: MessageCircle, titleEn: 'Contact Support', titleZh: '联系客服', descEn: 'Get in touch with our team', descZh: '与我们取得联系' },
  { href: '/account', icon: UserCircle, titleEn: 'My Account', titleZh: '我的账户', descEn: 'Manage your profile and settings', descZh: '管理个人资料和设置' },
]

export default function HelpCenterPage() {
  const { locale } = useLocale()

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '帮助中心' : 'Help Center'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '我们在这里帮助你解决任何问题' : 'We\'re here to help with anything you need'}</p>

      <div className="help-grid">
        {helpTopics.map(({ href, icon: Icon, titleEn, titleZh, descEn, descZh }) => (
          <Link key={href} href={href} className="help-card">
            <Icon size={28} />
            <h3>{locale === 'zh' ? titleZh : titleEn}</h3>
            <p>{locale === 'zh' ? descZh : descEn}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

interface FaqItem { q: { en: string; zh: string }; a: { en: string; zh: string } }
interface FaqSection { title: { en: string; zh: string }; items: FaqItem[] }

const faqData: FaqSection[] = [
  {
    title: { en: 'Ordering', zh: '订购' },
    items: [
      { q: { en: 'How do I place an order?', zh: '如何下单？' }, a: { en: 'Browse our products, add items to your cart, and proceed to checkout. You can pay with credit card or other supported methods.', zh: '浏览商品，将商品加入购物车，然后结算。支持信用卡等多种付款方式。' } },
      { q: { en: 'Can I modify or cancel my order?', zh: '可以修改或取消订单吗？' }, a: { en: 'You can modify or cancel your order within 1 hour of placing it. After that, please contact our support team.', zh: '下单后1小时内可以修改或取消订单。超过时间请联系客服。' } },
      { q: { en: 'Do you offer gift wrapping?', zh: '提供礼品包装吗？' }, a: { en: 'Yes! Select the gift wrap option at checkout for a small additional fee.', zh: '是的！结算时选择礼品包装选项即可，需少量额外费用。' } },
    ],
  },
  {
    title: { en: 'Shipping', zh: '物流' },
    items: [
      { q: { en: 'How long does shipping take?', zh: '配送需要多长时间？' }, a: { en: 'Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.', zh: '标准配送需要5-7个工作日，快递配送需要2-3个工作日。' } },
      { q: { en: 'Do you ship internationally?', zh: '支持国际配送吗？' }, a: { en: 'Yes, we ship to most countries. International shipping typically takes 10-15 business days.', zh: '是的，我们配送到大多数国家。国际配送通常需要10-15个工作日。' } },
      { q: { en: 'Is there free shipping?', zh: '有免运费吗？' }, a: { en: 'Orders over $65 qualify for free standard shipping within the US.', zh: '美国境内满$65免标准运费。' } },
    ],
  },
  {
    title: { en: 'Returns & Refunds', zh: '退换货' },
    items: [
      { q: { en: 'What is your return policy?', zh: '退货政策是什么？' }, a: { en: 'We accept returns within 30 days of delivery for unused items in original packaging. See our Returns Policy page for details.', zh: '我们接受收货后30天内未使用且原包装完好的商品退货。详情请查看退货政策页面。' } },
      { q: { en: 'How do I initiate a return?', zh: '如何发起退货？' }, a: { en: 'Contact our support team with your order number and reason for return. We will provide a prepaid shipping label.', zh: '联系客服提供订单号和退货原因，我们将提供预付运费标签。' } },
      { q: { en: 'When will I receive my refund?', zh: '多久能收到退款？' }, a: { en: 'Refunds are processed within 5-7 business days after we receive the returned item.', zh: '收到退货后5-7个工作日内处理退款。' } },
    ],
  },
  {
    title: { en: 'Products', zh: '产品' },
    items: [
      { q: { en: 'Are your products pet-safe?', zh: '产品对宠物安全吗？' }, a: { en: 'Absolutely. All our products are tested for safety and made with pet-safe, non-toxic materials.', zh: '当然！我们所有产品都经过安全测试，采用对宠物安全的无毒材料制成。' } },
      { q: { en: 'What sizes are available?', zh: '有哪些尺码？' }, a: { en: 'Product sizes vary. Check each product page for specific size options and a size guide.', zh: '尺码因产品而异，请查看各产品页面的尺码选项和尺码指南。' } },
    ],
  },
  {
    title: { en: 'Account & Rewards', zh: '账户与积分' },
    items: [
      { q: { en: 'How do Paw Points work?', zh: '爪印积分怎么用？' }, a: { en: 'Earn 1 Paw Point per dollar spent. Accumulate points and redeem them for discounts on future orders.', zh: '每消费1美元获得1爪印积分。累积积分可兑换未来订单折扣。' } },
      { q: { en: 'How do I reset my password?', zh: '如何重置密码？' }, a: { en: 'Click "Forgot password?" on the login page. Enter your email and follow the instructions sent to your inbox.', zh: '在登录页面点击"忘记密码？"，输入邮箱后按照收到的邮件指示操作。' } },
    ],
  },
]

export default function FaqPage() {
  const { locale } = useLocale()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '找到你需要的答案' : 'Find the answers you need'}</p>

      <div className="faq-sections">
        {faqData.map((section, si) => (
          <div key={si} className="faq-section">
            <h2 className="faq-section-title">{section.title[locale]}</h2>
            {section.items.map((item, qi) => {
              const id = `${si}-${qi}`
              const isOpen = openItems.has(id)
              return (
                <div key={id} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
                  <button className="faq-question" onClick={() => toggle(id)}>
                    <span>{item.q[locale]}</span>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'faq-chevron--open' : ''}`} />
                  </button>
                  {isOpen && <div className="faq-answer">{item.a[locale]}</div>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </main>
  )
}

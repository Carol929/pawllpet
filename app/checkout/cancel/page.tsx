'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { XCircle } from 'lucide-react'

export default function CheckoutCancel() {
  const { locale } = useLocale()

  return (
    <main className="container page-stack">
      <div className="checkout-result">
        <XCircle size={56} className="checkout-result-icon checkout-result-icon--cancel" />
        <h1>{locale === 'zh' ? '支付已取消' : 'Payment Cancelled'}</h1>
        <p>{locale === 'zh' ? '您的订单未完成。购物车中的商品仍然保留。' : 'Your order was not completed. Items are still in your cart.'}</p>
        <div className="checkout-result-actions">
          <Link href="/cart" className="btn-primary">{locale === 'zh' ? '返回购物车' : 'Back to Cart'}</Link>
          <Link href="/shop" className="btn-secondary">{locale === 'zh' ? '继续购物' : 'Continue Shopping'}</Link>
        </div>
      </div>
    </main>
  )
}

'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { CheckCircle, Package } from 'lucide-react'

function SuccessContent() {
  const { locale } = useLocale()
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => { clearCart() }, [clearCart])

  return (
    <div className="checkout-result">
      <CheckCircle size={56} className="checkout-result-icon checkout-result-icon--success" />
      <h1>{locale === 'zh' ? '订单已确认！' : 'Order Confirmed!'}</h1>
      <p>{locale === 'zh' ? '感谢您的购买。您的订单正在处理中。' : 'Thank you for your purchase. Your order is being processed.'}</p>
      {orderId && <p className="checkout-order-id">Order #{orderId.slice(-8).toUpperCase()}</p>}
      <div className="checkout-result-actions">
        <Link href="/account" className="btn-primary"><Package size={16} /> {locale === 'zh' ? '查看订单' : 'View Orders'}</Link>
        <Link href="/shop" className="btn-secondary">{locale === 'zh' ? '继续购物' : 'Continue Shopping'}</Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <main className="container page-stack">
      <Suspense fallback={<div className="checkout-result"><p>Loading...</p></div>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}

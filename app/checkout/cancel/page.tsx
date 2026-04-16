'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { XCircle } from 'lucide-react'

function CancelContent() {
  const { locale } = useLocale()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!orderId) return
    // Attempt to cancel the pending order immediately
    fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'cancelled') setCancelled(true)
      })
      .catch(() => {}) // Non-critical — webhook will also handle expiry
  }, [orderId])

  return (
    <div className="checkout-result">
      <XCircle size={56} className="checkout-result-icon checkout-result-icon--cancel" />
      <h1>{locale === 'zh' ? '支付已取消' : 'Payment Cancelled'}</h1>
      <p>{locale === 'zh' ? '您的订单未完成。购物车中的商品仍然保留。' : 'Your order was not completed. Items are still in your cart.'}</p>
      {cancelled && orderId && (
        <p style={{ fontSize: '.85rem', color: '#888' }}>
          {locale === 'zh' ? `订单 #${orderId.slice(-8).toUpperCase()} 已取消` : `Order #${orderId.slice(-8).toUpperCase()} has been cancelled`}
        </p>
      )}
      <div className="checkout-result-actions">
        <Link href="/cart" className="btn-primary">{locale === 'zh' ? '返回购物车' : 'Back to Cart'}</Link>
        <Link href="/shop" className="btn-secondary">{locale === 'zh' ? '继续购物' : 'Continue Shopping'}</Link>
      </div>
    </div>
  )
}

export default function CheckoutCancel() {
  return (
    <main className="container page-stack">
      <Suspense fallback={<div className="checkout-result"><p>Loading...</p></div>}>
        <CancelContent />
      </Suspense>
    </main>
  )
}

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { CheckCircle, Package, AlertTriangle } from 'lucide-react'

function SuccessContent() {
  const { locale } = useLocale()
  const { clearCart, removeItemsByKey } = useCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [verified, setVerified] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading')

  useEffect(() => {
    if (!orderId) { setVerified('error'); return }

    // Clear only the items that were actually purchased (the checkout page saved
    // the selected keys), so a partial checkout doesn't wipe the rest of the bag.
    const clearPurchased = () => {
      try {
        const raw = sessionStorage.getItem('checkout-selected')
        const keys = raw ? (JSON.parse(raw) as string[]) : []
        if (Array.isArray(keys) && keys.length > 0) {
          removeItemsByKey(keys)
        } else {
          clearCart()
        }
        sessionStorage.removeItem('checkout-selected')
      } catch {
        clearCart()
      }
    }

    // Verify order status from server. A Shippo label purchase flips the order to
    // 'processing', and admin may already have shipped it — all of these mean the
    // payment succeeded and should show the confirmation, not an error.
    fetch(`/api/orders/${orderId}/status`)
      .then(r => r.json())
      .then(data => {
        if (['paid', 'processing', 'shipped', 'delivered'].includes(data.status)) {
          setVerified('paid')
          clearPurchased()
        } else if (data.status === 'pending') {
          // Payment may still be processing
          setVerified('pending')
          clearPurchased()
        } else {
          setVerified('error')
        }
      })
      .catch(() => setVerified('error'))
  }, [orderId, clearCart, removeItemsByKey])

  if (verified === 'loading') {
    return (
      <div className="checkout-result">
        <p>{locale === 'zh' ? '正在确认订单...' : 'Confirming your order...'}</p>
      </div>
    )
  }

  if (verified === 'error') {
    return (
      <div className="checkout-result">
        <AlertTriangle size={56} className="checkout-result-icon" style={{ color: '#e67e22' }} />
        <h1>{locale === 'zh' ? '无法确认订单' : 'Could not confirm order'}</h1>
        <p>{locale === 'zh' ? '请查看您的邮箱或联系客服确认订单状态。' : 'Please check your email or contact support to confirm your order status.'}</p>
        <div className="checkout-result-actions">
          <Link href="/account" className="btn-primary"><Package size={16} /> {locale === 'zh' ? '查看订单' : 'View Orders'}</Link>
          <Link href="/" className="btn-secondary">{locale === 'zh' ? '返回首页' : 'Go Home'}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-result">
      <CheckCircle size={56} className="checkout-result-icon checkout-result-icon--success" />
      <h1>{locale === 'zh' ? '订单已确认！' : 'Order Confirmed!'}</h1>
      <p>
        {verified === 'pending'
          ? (locale === 'zh' ? '您的付款正在处理中，确认后将收到邮件通知。' : 'Your payment is being processed. You will receive a confirmation email shortly.')
          : (locale === 'zh' ? '感谢您的购买。您的订单正在处理中。' : 'Thank you for your purchase. Your order is being processed.')
        }
      </p>
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

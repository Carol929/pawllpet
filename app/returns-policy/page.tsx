'use client'

import { useLocale } from '@/lib/i18n'

export default function ReturnsPolicyPage() {
  const { locale } = useLocale()

  if (locale === 'zh') {
    return (
      <main className="container page-stack">
        <h1 className="page-title">退换货政策</h1>
        <div className="policy-content">
          <section><h2>退货期限</h2><p>自收到商品之日起30天内，您可以申请退货或换货。商品须保持未使用状态且包装完好。</p></section>
          <section><h2>退货条件</h2><ul><li>商品未经使用，保持原始状态</li><li>原包装完好，标签未拆除</li><li>附带原始收据或订单确认</li><li>非特价/清仓商品</li></ul></section>
          <section><h2>如何发起退货</h2><ol><li>联系客服提供订单号和退货原因</li><li>收到预付运费标签</li><li>将商品安全包装并寄回</li><li>我们收到后5-7个工作日内处理退款</li></ol></section>
          <section><h2>退款方式</h2><p>退款将原路返回到您的支付方式。请注意，银行处理时间可能需要额外3-5个工作日。</p></section>
          <section><h2>不可退换的商品</h2><ul><li>已使用或损坏的商品</li><li>个性化定制商品</li><li>礼品卡</li><li>清仓/特价商品（标注不可退换）</li></ul></section>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1 className="page-title">Returns Policy</h1>
      <div className="policy-content">
        <section><h2>Return Window</h2><p>You may return or exchange items within 30 days of receiving your order. Items must be unused and in original packaging.</p></section>
        <section><h2>Eligibility</h2><ul><li>Items must be unused and in original condition</li><li>Original packaging intact with tags attached</li><li>Original receipt or order confirmation required</li><li>Sale/clearance items excluded unless defective</li></ul></section>
        <section><h2>How to Initiate a Return</h2><ol><li>Contact our support team with your order number and reason</li><li>Receive a prepaid return shipping label</li><li>Pack the item securely and ship it back</li><li>Refund processed within 5-7 business days of receipt</li></ol></section>
        <section><h2>Refund Method</h2><p>Refunds are issued to your original payment method. Please allow an additional 3-5 business days for bank processing.</p></section>
        <section><h2>Non-Returnable Items</h2><ul><li>Used or damaged items</li><li>Personalized or custom items</li><li>Gift cards</li><li>Clearance items marked as final sale</li></ul></section>
      </div>
    </main>
  )
}

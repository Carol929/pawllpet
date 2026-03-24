'use client'

import { useLocale } from '@/lib/i18n'

export default function ShippingPolicyPage() {
  const { locale } = useLocale()

  if (locale === 'zh') {
    return (
      <main className="container page-stack">
        <h1 className="page-title">配送政策</h1>
        <div className="policy-content">
          <section><h2>配送方式</h2>
            <table className="policy-table"><thead><tr><th>方式</th><th>时效</th><th>费用</th></tr></thead><tbody>
              <tr><td>标准配送</td><td>5-7个工作日</td><td>$5.99（满$65免运费）</td></tr>
              <tr><td>快递配送</td><td>2-3个工作日</td><td>$12.99</td></tr>
              <tr><td>次日达</td><td>1个工作日</td><td>$19.99</td></tr>
            </tbody></table>
          </section>
          <section><h2>处理时间</h2><p>订单通常在1-2个工作日内处理发货。节假日期间可能略有延迟。</p></section>
          <section><h2>订单追踪</h2><p>发货后您将收到包含追踪号码的邮件通知。您也可以在「我的账户」中查看订单状态。</p></section>
          <section><h2>国际配送</h2><p>我们支持大多数国家的配送，国际配送通常需要10-15个工作日。关税和进口税由收件人承担。</p></section>
          <section><h2>配送问题</h2><p>如果您的包裹丢失或损坏，请在收到（或预计收到）后7天内联系我们的客服团队。</p></section>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1 className="page-title">Shipping Policy</h1>
      <div className="policy-content">
        <section><h2>Shipping Methods</h2>
          <table className="policy-table"><thead><tr><th>Method</th><th>Delivery Time</th><th>Cost</th></tr></thead><tbody>
            <tr><td>Standard Shipping</td><td>5-7 business days</td><td>$5.99 (Free over $65)</td></tr>
            <tr><td>Express Shipping</td><td>2-3 business days</td><td>$12.99</td></tr>
            <tr><td>Next-Day Delivery</td><td>1 business day</td><td>$19.99</td></tr>
          </tbody></table>
        </section>
        <section><h2>Processing Time</h2><p>Orders are typically processed and shipped within 1-2 business days. During peak seasons, processing may take slightly longer.</p></section>
        <section><h2>Order Tracking</h2><p>Once shipped, you will receive an email with your tracking number. You can also track orders in your account dashboard.</p></section>
        <section><h2>International Shipping</h2><p>We ship to most countries worldwide. International orders typically take 10-15 business days. Customs duties and import taxes are the responsibility of the recipient.</p></section>
        <section><h2>Shipping Issues</h2><p>If your package is lost or damaged, please contact our support team within 7 days of receiving (or expected delivery of) your order.</p></section>
      </div>
    </main>
  )
}

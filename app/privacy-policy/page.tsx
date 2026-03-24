'use client'

import { useLocale } from '@/lib/i18n'

export default function PrivacyPolicy() {
  const { locale } = useLocale()
  const en = locale === 'en'

  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Privacy Policy' : '隐私政策'}</h1>
      <p className="page-subtitle">{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</p>

      <div className="policy-content">
        <section>
          <h2>{en ? '1. Information We Collect' : '1. 我们收集的信息'}</h2>
          <p>{en ? 'We collect information you provide directly to us when you:' : '当您进行以下操作时，我们会收集您直接提供的信息：'}</p>
          <ul>
            <li>{en ? 'Create an account (name, email, phone number)' : '创建账户（姓名、邮箱、电话号码）'}</li>
            <li>{en ? 'Place an order (shipping address, payment information via Stripe)' : '下单（收货地址、通过 Stripe 处理的支付信息）'}</li>
            <li>{en ? 'Contact our support team' : '联系客服团队'}</li>
            <li>{en ? 'Subscribe to our newsletter' : '订阅我们的邮件通讯'}</li>
            <li>{en ? 'Browse our website (cookies, IP address, device information)' : '浏览我们的网站（Cookies、IP 地址、设备信息）'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '2. How We Use Your Information' : '2. 我们如何使用您的信息'}</h2>
          <ul>
            <li>{en ? 'Process and fulfill your orders' : '处理和完成您的订单'}</li>
            <li>{en ? 'Send order confirmations, shipping updates, and tracking information' : '发送订单确认、物流更新和追踪信息'}</li>
            <li>{en ? 'Provide customer support and respond to inquiries' : '提供客户支持和回复咨询'}</li>
            <li>{en ? 'Improve our products, services, and website experience' : '改进产品、服务和网站体验'}</li>
            <li>{en ? 'Send promotional communications (with your consent)' : '发送促销通讯（经您同意）'}</li>
            <li>{en ? 'Prevent fraud and protect our business' : '防止欺诈并保护我们的业务'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '3. Payment Security' : '3. 支付安全'}</h2>
          <p>{en
            ? 'All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment processor. We never store your full credit card number, CVV, or other sensitive payment data on our servers. Your payment information is encrypted and processed directly by Stripe.'
            : '所有支付处理均由 Stripe 处理，Stripe 是经过 PCI-DSS 一级认证的支付处理商。我们不会在服务器上存储您的完整信用卡号、CVV 或其他敏感支付数据。您的支付信息由 Stripe 直接加密处理。'
          }</p>
        </section>

        <section>
          <h2>{en ? '4. Cookies & Tracking' : '4. Cookies 和追踪'}</h2>
          <p>{en
            ? 'We use essential cookies to maintain your session and shopping cart. We may use analytics cookies to understand how visitors interact with our website. You can disable cookies through your browser settings, though this may affect site functionality.'
            : '我们使用必要的 Cookies 来维持您的会话和购物车。我们可能使用分析 Cookies 来了解访客如何与网站互动。您可以通过浏览器设置禁用 Cookies，但这可能会影响网站功能。'
          }</p>
        </section>

        <section>
          <h2>{en ? '5. Third-Party Services' : '5. 第三方服务'}</h2>
          <p>{en ? 'We share your information with the following third parties only as necessary:' : '我们仅在必要时与以下第三方共享您的信息：'}</p>
          <ul>
            <li>{en ? 'Stripe — Payment processing' : 'Stripe — 支付处理'}</li>
            <li>{en ? 'Shipping carriers — Order delivery' : '物流承运商 — 订单配送'}</li>
            <li>{en ? 'Email service providers — Transactional emails' : '邮件服务商 — 交易邮件'}</li>
          </ul>
          <p>{en ? 'We do not sell your personal information to third parties.' : '我们不会将您的个人信息出售给第三方。'}</p>
        </section>

        <section>
          <h2>{en ? '6. Your Rights' : '6. 您的权利'}</h2>
          <p>{en ? 'You have the right to:' : '您有权：'}</p>
          <ul>
            <li>{en ? 'Access your personal data' : '访问您的个人数据'}</li>
            <li>{en ? 'Request correction of inaccurate data' : '要求更正不准确的数据'}</li>
            <li>{en ? 'Request deletion of your account and data' : '要求删除您的账户和数据'}</li>
            <li>{en ? 'Opt out of marketing communications at any time' : '随时退出营销通讯'}</li>
            <li>{en ? 'Request a copy of your data in a portable format' : '请求以可移植格式获取您的数据副本'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '7. Data Retention' : '7. 数据保留'}</h2>
          <p>{en
            ? 'We retain your personal data for as long as your account is active or as needed to provide services. Order records are kept for accounting and legal compliance. You may request account deletion by contacting us.'
            : '只要您的账户处于活跃状态或需要提供服务，我们就会保留您的个人数据。订单记录将保留用于会计和法律合规。您可以通过联系我们申请删除账户。'
          }</p>
        </section>

        <section>
          <h2>{en ? '8. Contact Us' : '8. 联系我们'}</h2>
          <p>{en
            ? 'If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:'
            : '如果您对本隐私政策有疑问或希望行使您的数据权利，请通过以下方式联系我们：'
          }</p>
          <p><strong>Email:</strong> support@pawllpet.com</p>
        </section>
      </div>
    </main>
  )
}

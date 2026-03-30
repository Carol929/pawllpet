'use client'
import { useLocale } from '@/lib/i18n'

export default function CookiePolicyPage() {
  const { locale } = useLocale()
  const en = locale === 'en' || !['zh'].includes(locale)
  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Cookie Policy' : 'Cookie 政策'}</h1>
      <div className="policy-content">
        <p><em>{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</em></p>

        <h2>{en ? 'What Are Cookies' : '什么是 Cookies'}</h2>
        <p>{en
          ? 'Cookies are small text files stored on your device when you visit our website. They help us provide a better shopping experience by remembering your preferences and understanding how you use our site.'
          : 'Cookies 是您访问我们网站时存储在您设备上的小文本文件。它们通过记住您的偏好和了解您如何使用我们的网站来帮助我们提供更好的购物体验。'}</p>

        <h2>{en ? 'Types of Cookies We Use' : '我们使用的 Cookie 类型'}</h2>

        <h3>{en ? 'Essential Cookies (Required)' : '必要 Cookies（必需）'}</h3>
        <p>{en
          ? 'These cookies are necessary for the website to function. They enable core features like user authentication, shopping cart, language preferences, and cookie consent. They cannot be disabled.'
          : '这些 Cookie 是网站运行所必需的。它们启用用户认证、购物车、语言偏好和 Cookie 同意等核心功能。它们不能被禁用。'}</p>
        <table className="policy-table">
          <thead><tr><th>{en ? 'Cookie' : 'Cookie'}</th><th>{en ? 'Purpose' : '用途'}</th><th>{en ? 'Duration' : '持续时间'}</th></tr></thead>
          <tbody>
            <tr><td>auth-token</td><td>{en ? 'User authentication' : '用户认证'}</td><td>{en ? '7 days' : '7天'}</td></tr>
            <tr><td>pawll-cart</td><td>{en ? 'Shopping cart items' : '购物车商品'}</td><td>{en ? 'Persistent' : '持久'}</td></tr>
            <tr><td>pawll-locale</td><td>{en ? 'Language preference' : '语言偏好'}</td><td>{en ? 'Persistent' : '持久'}</td></tr>
            <tr><td>pawll-cookie-consent</td><td>{en ? 'Cookie consent preferences' : 'Cookie 同意偏好'}</td><td>{en ? 'Persistent' : '持久'}</td></tr>
          </tbody>
        </table>

        <h3>{en ? 'Analytics Cookies (Optional)' : '分析 Cookies（可选）'}</h3>
        <p>{en
          ? 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.'
          : '这些 Cookie 通过匿名收集和报告信息，帮助我们了解访客如何与我们的网站互动。'}</p>

        <h3>{en ? 'Marketing Cookies (Optional)' : '营销 Cookies（可选）'}</h3>
        <p>{en
          ? 'These cookies are used to deliver advertisements relevant to you and your interests. They may also limit the number of times you see an ad and help measure the effectiveness of advertising campaigns.'
          : '这些 Cookie 用于向您投放与您和您的兴趣相关的广告。它们还可能限制您看到广告的次数，并帮助衡量广告活动的有效性。'}</p>

        <h2>{en ? 'Managing Your Preferences' : '管理您的偏好'}</h2>
        <p>{en
          ? 'You can manage your cookie preferences at any time by clicking "Cookie Preferences" in the footer of our website, or by adjusting your browser settings.'
          : '您可以随时通过点击我们网站页脚的"Cookie 设置"或调整浏览器设置来管理您的 Cookie 偏好。'}</p>

        <h2>{en ? 'Do Not Sell My Information' : '请勿出售我的信息'}</h2>
        <p>{en
          ? 'Under the California Consumer Privacy Act (CCPA), you have the right to opt out of the sale or sharing of your personal information. You can exercise this right by clicking "Do Not Sell My Info" in our footer.'
          : '根据《加州消费者隐私法》(CCPA)，您有权选择退出个人信息的出售或共享。您可以通过点击我们页脚中的"请勿出售我的信息"来行使此权利。'}</p>

        <h2>{en ? 'Contact Us' : '联系我们'}</h2>
        <p>{en ? 'If you have questions about our cookie practices, contact us at support@pawllpet.com.' : '如果您对我们的 Cookie 做法有任何疑问，请通过 support@pawllpet.com 联系我们。'}</p>
      </div>
    </main>
  )
}

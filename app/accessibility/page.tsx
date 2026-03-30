'use client'
import { useLocale } from '@/lib/i18n'

export default function AccessibilityPage() {
  const { locale } = useLocale()
  const en = locale === 'en' || !['zh'].includes(locale)
  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Accessibility Statement' : '无障碍声明'}</h1>
      <div className="policy-content">
        <p>{en
          ? 'PawLL Pet is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.'
          : 'PawLL Pet 致力于确保残障人士的数字无障碍访问。我们不断改善所有用户的体验，并遵循相关的无障碍标准。'}</p>

        <h2>{en ? 'Conformance Status' : '合规状态'}</h2>
        <p>{en
          ? 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible to people with a wide array of disabilities.'
          : '我们的目标是符合《Web 内容无障碍指南》(WCAG) 2.1 AA 级标准。这些指南说明了如何使 Web 内容更易于各类残障人士访问。'}</p>

        <h2>{en ? 'Measures We Take' : '我们采取的措施'}</h2>
        <ul>
          <li>{en ? 'Semantic HTML structure for screen reader compatibility' : '使用语义化 HTML 结构，兼容屏幕阅读器'}</li>
          <li>{en ? 'Keyboard navigation support throughout the site' : '全站支持键盘导航'}</li>
          <li>{en ? 'Sufficient color contrast ratios for text readability' : '文字具有足够的颜色对比度'}</li>
          <li>{en ? 'Alt text for meaningful images' : '为有意义的图片提供替代文本'}</li>
          <li>{en ? 'Form labels and error messages for assistive technology' : '为辅助技术提供表单标签和错误消息'}</li>
          <li>{en ? 'Skip-to-content link for keyboard users' : '为键盘用户提供跳转到内容的链接'}</li>
          <li>{en ? 'Responsive design for various devices and screen sizes' : '响应式设计，适配各种设备和屏幕尺寸'}</li>
        </ul>

        <h2>{en ? 'Feedback' : '反馈'}</h2>
        <p>{en
          ? 'We welcome your feedback on the accessibility of PawLL Pet. Please let us know if you encounter accessibility barriers:'
          : '我们欢迎您对 PawLL Pet 无障碍性的反馈。如果您遇到无障碍障碍，请告知我们：'}</p>
        <ul>
          <li>{en ? 'Email: support@pawllpet.com' : '邮箱：support@pawllpet.com'}</li>
          <li>{en ? 'We aim to respond to feedback within 2 business days.' : '我们力争在2个工作日内回复反馈。'}</li>
        </ul>
      </div>
    </main>
  )
}

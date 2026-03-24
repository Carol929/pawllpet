'use client'

import { useLocale } from '@/lib/i18n'

export default function TermsConditions() {
  const { locale } = useLocale()
  const en = locale === 'en'

  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Terms & Conditions' : '服务条款'}</h1>
      <p className="page-subtitle">{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</p>

      <div className="policy-content">
        <section>
          <h2>{en ? '1. Acceptance of Terms' : '1. 接受条款'}</h2>
          <p>{en
            ? 'By accessing and using the PawLL Pet website (www.pawllpet.com), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website or services.'
            : '通过访问和使用 PawLL Pet 网站 (www.pawllpet.com)，您同意受这些服务条款的约束。如果您不同意，请勿使用我们的网站或服务。'
          }</p>
        </section>

        <section>
          <h2>{en ? '2. Account Responsibilities' : '2. 账户责任'}</h2>
          <ul>
            <li>{en ? 'You are responsible for maintaining the confidentiality of your account credentials' : '您有责任维护账户凭证的保密性'}</li>
            <li>{en ? 'You must provide accurate and complete information when creating an account' : '创建账户时必须提供准确完整的信息'}</li>
            <li>{en ? 'You are responsible for all activity under your account' : '您对账户下的所有活动负责'}</li>
            <li>{en ? 'You must be at least 18 years old to create an account and make purchases' : '您必须年满 18 岁才能创建账户和进行购买'}</li>
            <li>{en ? 'We reserve the right to suspend or terminate accounts that violate these terms' : '我们保留暂停或终止违反这些条款的账户的权利'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '3. Products & Pricing' : '3. 产品和定价'}</h2>
          <ul>
            <li>{en ? 'All prices are listed in USD and are subject to change without notice' : '所有价格以美元计价，如有更改恕不另行通知'}</li>
            <li>{en ? 'We strive for accuracy in product descriptions and images, but minor variations may occur' : '我们力求产品描述和图片的准确性，但可能存在细微差异'}</li>
            <li>{en ? 'We reserve the right to correct pricing errors and cancel orders affected by such errors' : '我们保留纠正定价错误并取消受此类错误影响的订单的权利'}</li>
            <li>{en ? 'Product availability is not guaranteed and items may sell out' : '不保证产品供应，商品可能售罄'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '4. Orders & Payment' : '4. 订单和支付'}</h2>
          <p>{en
            ? 'By placing an order, you are making an offer to purchase. We reserve the right to accept or reject any order. Payment is processed securely through Stripe. Orders are confirmed only after successful payment processing.'
            : '下单即表示您提出购买要约。我们保留接受或拒绝任何订单的权利。付款通过 Stripe 安全处理。只有在付款处理成功后，订单才被确认。'
          }</p>
        </section>

        <section>
          <h2>{en ? '5. Intellectual Property' : '5. 知识产权'}</h2>
          <p>{en
            ? 'All content on this website, including but not limited to text, graphics, logos, images, product designs, and software, is the property of PawLL Pet or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without written permission.'
            : '本网站上的所有内容，包括但不限于文字、图形、标识、图片、产品设计和软件，均为 PawLL Pet 或其许可方的财产，受知识产权法保护。未经书面许可，不得复制、分发或使用任何内容。'
          }</p>
        </section>

        <section>
          <h2>{en ? '6. Limitation of Liability' : '6. 责任限制'}</h2>
          <p>{en
            ? 'PawLL Pet shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability is limited to the amount paid for the specific product or service giving rise to the claim.'
            : 'PawLL Pet 对因使用我们的网站或产品而产生的任何间接、附带、特殊或后果性损害不承担责任。我们的总责任限于为引起索赔的特定产品或服务支付的金额。'
          }</p>
        </section>

        <section>
          <h2>{en ? '7. Dispute Resolution' : '7. 争议解决'}</h2>
          <p>{en
            ? 'Any disputes arising from these terms or your use of our services shall first be addressed through good-faith negotiation. If unresolved, disputes shall be settled through binding arbitration in accordance with applicable laws.'
            : '因这些条款或您使用我们服务而产生的任何争议，应首先通过善意协商解决。如未解决，争议应根据适用法律通过具有约束力的仲裁解决。'
          }</p>
        </section>

        <section>
          <h2>{en ? '8. Prohibited Activities' : '8. 禁止行为'}</h2>
          <ul>
            <li>{en ? 'Using the website for fraudulent or unlawful purposes' : '将网站用于欺诈或非法目的'}</li>
            <li>{en ? 'Attempting to interfere with or disrupt the website' : '试图干扰或破坏网站'}</li>
            <li>{en ? 'Scraping, crawling, or automated data collection without permission' : '未经许可进行抓取、爬取或自动数据收集'}</li>
            <li>{en ? 'Reselling products purchased from PawLL Pet without authorization' : '未经授权转售从 PawLL Pet 购买的产品'}</li>
            <li>{en ? 'Submitting false reviews or misleading information' : '提交虚假评论或误导性信息'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? '9. Changes to Terms' : '9. 条款变更'}</h2>
          <p>{en
            ? 'We reserve the right to update these Terms & Conditions at any time. Changes become effective when posted on this page. Continued use of the website constitutes acceptance of updated terms.'
            : '我们保留随时更新这些服务条款的权利。更改在此页面发布后生效。继续使用网站即表示接受更新后的条款。'
          }</p>
        </section>

        <section>
          <h2>{en ? '10. Contact' : '10. 联系方式'}</h2>
          <p>{en ? 'For questions about these terms, contact us at:' : '如对这些条款有疑问，请联系：'}</p>
          <p><strong>Email:</strong> support@pawllpet.com</p>
        </section>
      </div>
    </main>
  )
}

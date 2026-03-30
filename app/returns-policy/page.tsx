'use client'

import { useLocale } from '@/lib/i18n'

export default function ReturnsPolicyPage() {
  const { locale } = useLocale()
  const en = !['zh'].includes(locale)

  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Returns & Refund Policy' : '退货退款政策'}</h1>
      <div className="policy-content">
        <p><em>{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</em></p>

        <section>
          <h2>{en ? 'Return Window' : '退货期限'}</h2>
          <p>{en
            ? 'You may request a return within 30 days of receiving your order, ONLY for products with verified quality defects or damage. We do not accept returns for reasons such as change of mind, wrong size selection, or personal preference.'
            : '自收到商品之日起30天内，仅针对经验证的产品质量缺陷或损坏，您可以申请退货。我们不接受因改变主意、尺寸选择错误或个人偏好等原因的退货。'}</p>
        </section>

        <section>
          <h2>{en ? 'Eligible Reasons for Return' : '可退货原因'}</h2>
          <ul>
            <li>{en ? 'Manufacturing defects (stitching, material flaws, structural issues)' : '制造缺陷（缝线、材料缺陷、结构问题）'}</li>
            <li>{en ? 'Product received damaged during shipping' : '运输过程中产品损坏'}</li>
            <li>{en ? 'Product significantly differs from description or photos on our website' : '产品与我们网站上的描述或照片有重大差异'}</li>
            <li>{en ? 'Wrong product shipped' : '发错商品'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'Required Evidence (Mandatory)' : '必需的凭证（强制要求）'}</h2>
          <p>{en
            ? 'All return requests MUST include visual evidence of the quality issue. Requests without proper documentation will be denied.'
            : '所有退货申请必须包含质量问题的视觉证据。没有适当文件的申请将被拒绝。'}</p>
          <ul>
            <li><strong>{en ? 'Photos:' : '照片：'}</strong> {en ? 'Clear photos showing the defect from multiple angles. Include a photo of the product label/tag and the original packaging.' : '清晰展示缺陷的多角度照片。包括产品标签和原包装的照片。'}</li>
            <li><strong>{en ? 'Video (recommended):' : '视频（推荐）：'}</strong> {en ? 'A short video demonstrating the defect is strongly recommended, especially for functional issues (e.g., broken zipper, detaching parts).' : '强烈建议提供一段展示缺陷的短视频，特别是对于功能性问题（如拉链损坏、部件脱落等）。'}</li>
            <li><strong>{en ? 'Order number:' : '订单号：'}</strong> {en ? 'Your order confirmation number is required.' : '需要提供您的订单确认号。'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'Return Process' : '退货流程'}</h2>
          <ol>
            <li>{en ? 'Contact us at support@pawllpet.com with your order number, description of the issue, and photos/video evidence.' : '通过 support@pawllpet.com 联系我们，提供您的订单号、问题描述和照片/视频证据。'}</li>
            <li>{en ? 'Our team will review your request within 1-2 business days.' : '我们的团队将在1-2个工作日内审核您的申请。'}</li>
            <li>{en ? 'If approved, you will receive a prepaid return shipping label via email.' : '如获批准，您将通过电子邮件收到预付退货运费标签。'}</li>
            <li>{en ? 'Pack the product securely in its original packaging and ship it back.' : '将产品安全地装入原包装中并寄回。'}</li>
            <li>{en ? 'Refund will be processed within 5-7 business days after we receive and inspect the returned item.' : '我们收到并检查退货商品后，将在5-7个工作日内处理退款。'}</li>
          </ol>
        </section>

        <section>
          <h2>{en ? 'Refund Method' : '退款方式'}</h2>
          <p>{en
            ? 'Refunds are issued to your original payment method. Please allow an additional 3-5 business days for your bank or credit card company to process the refund.'
            : '退款将原路返回到您的支付方式。请额外等待3-5个工作日以便银行或信用卡公司处理退款。'}</p>
        </section>

        <section>
          <h2>{en ? 'Non-Returnable Items' : '不可退货商品'}</h2>
          <ul>
            <li>{en ? 'Products with normal wear and tear from pet use' : '因宠物正常使用而产生磨损的产品'}</li>
            <li>{en ? 'Products damaged due to misuse, negligence, or improper care' : '因误用、疏忽或不当护理而损坏的产品'}</li>
            <li>{en ? 'Mystery boxes (due to random selection nature)' : '盲盒（因随机选择性质）'}</li>
            <li>{en ? 'Personalized or custom-made items' : '个性化或定制商品'}</li>
            <li>{en ? 'Items without original packaging' : '无原包装的商品'}</li>
            <li>{en ? 'Items marked as "Final Sale"' : '标记为"最终销售"的商品'}</li>
            <li>{en ? 'Gift cards' : '礼品卡'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'Shipping Costs for Returns' : '退货运费'}</h2>
          <p>{en
            ? 'If the return is due to a verified quality defect or our error, PawLL Pet will cover return shipping costs. For all other cases, the customer is responsible for return shipping.'
            : '如果退货是由于经验证的质量缺陷或我们的错误，PawLL Pet 将承担退货运费。在所有其他情况下，客户负责退货运费。'}</p>
        </section>

        <section>
          <h2>{en ? 'Contact Us' : '联系我们'}</h2>
          <p>{en ? 'Email: support@pawllpet.com' : '邮箱：support@pawllpet.com'}</p>
          <p>{en ? 'Please include your order number in all correspondence.' : '请在所有通信中包含您的订单号。'}</p>
        </section>
      </div>
    </main>
  )
}

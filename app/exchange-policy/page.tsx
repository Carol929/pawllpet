'use client'

import { useLocale } from '@/lib/i18n'

export default function ExchangePolicy() {
  const { locale } = useLocale()
  const en = locale === 'en'

  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Exchange Policy' : '换货政策'}</h1>
      <p className="page-subtitle">{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</p>

      <div className="policy-content">
        <section>
          <h2>{en ? 'Exchange Window' : '换货期限'}</h2>
          <p>{en
            ? 'You may request an exchange within 30 days of receiving your order. Items must be unused, in their original packaging, and in the same condition as received.'
            : '您可以在收到订单后 30 天内申请换货。商品必须未使用，保持原包装，且与收到时的状态相同。'
          }</p>
        </section>

        <section>
          <h2>{en ? 'Eligible Exchanges' : '可换货情况'}</h2>
          <ul>
            <li>{en ? 'Wrong size or variant received' : '收到错误的尺寸或规格'}</li>
            <li>{en ? 'Defective or damaged item upon arrival' : '到货时存在缺陷或损坏'}</li>
            <li>{en ? 'Item does not match the product description' : '商品与产品描述不符'}</li>
            <li>{en ? 'Size/color exchange for available variants' : '更换可用规格的尺寸/颜色'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'How to Request an Exchange' : '如何申请换货'}</h2>
          <ol>
            <li>{en ? 'Contact us at support@pawllpet.com with your order number' : '通过 support@pawllpet.com 联系我们并提供订单号'}</li>
            <li>{en ? 'Include photos of the item and describe the issue' : '附上商品照片并描述问题'}</li>
            <li>{en ? 'We will review your request within 1-2 business days' : '我们将在 1-2 个工作日内审核您的请求'}</li>
            <li>{en ? 'Once approved, we will provide a prepaid return label' : '审核通过后，我们将提供预付退货标签'}</li>
            <li>{en ? 'Ship the item back and we will send the replacement once received' : '寄回商品后，我们收到后将发送替换品'}</li>
          </ol>
        </section>

        <section>
          <h2>{en ? 'Exchange Shipping' : '换货运费'}</h2>
          <ul>
            <li>{en ? 'Exchanges due to our error (wrong item, defect): Free shipping both ways' : '因我方错误（发错商品、缺陷）换货：双向免运费'}</li>
            <li>{en ? 'Exchanges for personal preference (size, color): Customer pays return shipping' : '因个人偏好（尺寸、颜色）换货：客户承担退货运费'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'Non-Exchangeable Items' : '不可换货商品'}</h2>
          <ul>
            <li>{en ? 'Items used, washed, or altered' : '已使用、清洗或改动的商品'}</li>
            <li>{en ? 'Mystery box / blind box items (due to their random nature)' : '盲盒/神秘盒商品（因其随机性质）'}</li>
            <li>{en ? 'Personalized or custom-made products' : '个性化或定制产品'}</li>
            <li>{en ? 'Items without original packaging or tags' : '没有原包装或标签的商品'}</li>
            <li>{en ? 'Items purchased during final sale promotions' : '在清仓促销期间购买的商品'}</li>
          </ul>
        </section>

        <section>
          <h2>{en ? 'Contact' : '联系方式'}</h2>
          <p>{en ? 'For exchange requests or questions:' : '如需换货或有疑问：'}</p>
          <p><strong>Email:</strong> support@pawllpet.com</p>
        </section>
      </div>
    </main>
  )
}

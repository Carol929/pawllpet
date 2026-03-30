'use client'
import { useLocale } from '@/lib/i18n'

export default function ProductSafetyPage() {
  const { locale } = useLocale()
  const en = !['zh'].includes(locale)
  return (
    <main className="container page-stack">
      <h1 className="page-title">{en ? 'Product Safety & Disclaimer' : '产品安全与免责声明'}</h1>
      <div className="policy-content">
        <p><em>{en ? 'Last updated: March 2026' : '最后更新：2026年3月'}</em></p>

        <h2>{en ? '1. General Product Disclaimer' : '1. 产品免责总则'}</h2>
        <p>{en
          ? 'All products sold by PawLL LLC ("PawLL Pet," "we," "us," or "our") are designed for use with domestic pets (dogs and cats) and are intended for their general care, comfort, and entertainment. Products are sold "as-is" and "as-available." By purchasing any product from PawLL Pet, you ("the buyer," "customer," or "user") acknowledge and agree to the terms outlined in this disclaimer.'
          : 'PawLL LLC（"PawLL Pet"、"我们"）销售的所有产品均设计用于家养宠物（猫和狗）的日常护理、舒适和娱乐。产品按"现状"和"可用状态"出售。购买 PawLL Pet 的任何产品即表示您（"买方"、"客户"或"用户"）承认并同意本免责声明中列出的条款。'}</p>

        <h2>{en ? '2. Assumption of Risk' : '2. 风险承担'}</h2>
        <p>{en
          ? 'You acknowledge that the use of pet products inherently involves certain risks, including but not limited to choking, ingestion of materials, allergic reactions, entanglement, or injury to pets or humans. By purchasing and using our products, you voluntarily assume all risks associated with the use of the products, whether foreseeable or unforeseeable.'
          : '您承认使用宠物产品本身存在一定风险，包括但不限于窒息、吞食材料、过敏反应、缠绕或对宠物或人的伤害。购买和使用我们的产品即表示您自愿承担与使用产品相关的所有风险，无论是否可以预见。'}</p>

        <h2>{en ? '3. Supervision Required' : '3. 必须监督使用'}</h2>
        <p>{en
          ? 'All pet products, including but not limited to toys, leashes, harnesses, beds, and feeders, must be used under the direct supervision of the pet owner. No product is indestructible. Regularly inspect all products for signs of wear, damage, or deterioration and replace them immediately if damaged. Never leave pets unattended with any product.'
          : '所有宠物产品，包括但不限于玩具、牵引绳、胸背带、宠物床和喂食器，必须在宠物主人的直接监督下使用。没有任何产品是不可破坏的。请定期检查所有产品是否有磨损、损坏或老化迹象，如有损坏请立即更换。切勿让宠物在无人看管的情况下使用任何产品。'}</p>

        <h2>{en ? '4. Size & Suitability' : '4. 尺寸与适用性'}</h2>
        <p>{en
          ? 'It is the sole responsibility of the buyer to select products appropriate for their pet\'s breed, size, weight, age, temperament, and chewing habits. PawLL Pet is not liable for any injury or damage resulting from the selection of an inappropriately sized or unsuitable product.'
          : '买方全权负责为其宠物的品种、体型、体重、年龄、性格和咀嚼习惯选择合适的产品。PawLL Pet 不对因选择不当尺寸或不适合的产品而造成的任何伤害或损害承担责任。'}</p>

        <h2>{en ? '5. Choking & Ingestion Hazard' : '5. 窒息和吞食风险'}</h2>
        <p>{en
          ? 'WARNING: Some products contain small parts that may present a choking hazard to pets or small children. Keep products with small components away from children under 3 years of age. If a product breaks apart, remove it from your pet immediately to prevent ingestion of fragments. PawLL Pet is not responsible for any injury caused by a pet or child ingesting or choking on product parts.'
          : '警告：某些产品包含小部件，可能对宠物或幼儿构成窒息危险。请将含有小部件的产品远离3岁以下儿童。如果产品破裂，请立即将其从宠物身边移走，以防止吞食碎片。PawLL Pet 不对宠物或儿童因吞食或窒息于产品部件而造成的任何伤害负责。'}</p>

        <h2>{en ? '6. Allergies & Material Sensitivities' : '6. 过敏与材料敏感性'}</h2>
        <p>{en
          ? 'It is the buyer\'s responsibility to review the material composition of each product before use and to ensure that the product does not contain any materials to which their pet may be allergic or sensitive. PawLL Pet is not liable for allergic reactions, skin irritation, or any adverse health effects caused by product materials.'
          : '买方有责任在使用前查看每种产品的材料成分，并确保产品不含其宠物可能过敏或敏感的任何材料。PawLL Pet 不对产品材料引起的过敏反应、皮肤刺激或任何不良健康影响负责。'}</p>

        <h2>{en ? '7. Limitation of Liability' : '7. 责任限制'}</h2>
        <p>{en
          ? 'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, PAWLL LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THE USE, MISUSE, INABILITY TO USE, OR RELIANCE ON ANY PRODUCT, INCLUDING BUT NOT LIMITED TO INJURY TO OR DEATH OF ANY PET OR PERSON, PROPERTY DAMAGE, OR ANY OTHER LOSSES, REGARDLESS OF WHETHER SUCH DAMAGES ARE BASED ON WARRANTY, CONTRACT, TORT, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY.'
          : '在适用法律允许的最大范围内，PAWLL LLC 及其管理人员、董事、员工、代理和关联方不对因使用、误用、无法使用或依赖任何产品而产生的或与之相关的任何直接、间接、附带、特殊、后果性或惩罚性损害承担责任，包括但不限于任何宠物或人的伤害或死亡、财产损失或任何其他损失，无论此类损害是基于保证、合同、侵权、严格责任还是任何其他法律理论。'}</p>

        <h2>{en ? '8. Indemnification' : '8. 赔偿'}</h2>
        <p>{en
          ? 'You agree to indemnify, defend, and hold harmless PawLL LLC and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys\' fees) arising out of or related to your use or misuse of any product, your violation of this disclaimer, or your violation of any rights of a third party.'
          : '您同意赔偿、辩护并使 PawLL LLC 及其管理人员、董事、员工、代理和关联方免受因您使用或误用任何产品、违反本免责声明或侵犯任何第三方权利而产生的或与之相关的任何和所有索赔、损害、损失、责任、费用和开支（包括合理的律师费）。'}</p>

        <h2>{en ? '9. No Veterinary or Professional Advice' : '9. 非兽医或专业建议'}</h2>
        <p>{en
          ? 'PawLL Pet does not provide veterinary, medical, or professional pet care advice. Our product descriptions and recommendations are for informational purposes only. Always consult a licensed veterinarian for health-related concerns regarding your pet.'
          : 'PawLL Pet 不提供兽医、医疗或专业宠物护理建议。我们的产品描述和建议仅供参考。有关宠物健康相关问题，请始终咨询持证兽医。'}</p>

        <h2>{en ? '10. Product Modifications' : '10. 产品改造'}</h2>
        <p>{en
          ? 'Any modification, alteration, or tampering with our products voids all warranties and disclaimers. PawLL Pet bears no responsibility for products that have been modified from their original condition.'
          : '对我们产品的任何修改、更改或篡改将使所有保证和免责声明无效。PawLL Pet 对已从原始状态进行修改的产品不承担任何责任。'}</p>

        <h2>{en ? '11. Governing Law' : '11. 管辖法律'}</h2>
        <p>{en
          ? 'This disclaimer shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia, United States, without regard to its conflict of law provisions. Any disputes arising under this disclaimer shall be resolved exclusively in the courts located in Arlington County, Virginia.'
          : '本免责声明应受美国弗吉尼亚联邦法律管辖并据其解释，不考虑其法律冲突条款。因本免责声明引起的任何争议应在弗吉尼亚州阿灵顿县的法院专属解决。'}</p>

        <h2>{en ? '12. Contact Us' : '12. 联系我们'}</h2>
        <p>{en
          ? 'For product safety concerns or questions about this disclaimer, please contact us at support@pawllpet.com.'
          : '如有产品安全问题或关于本免责声明的疑问，请通过 support@pawllpet.com 联系我们。'}</p>
      </div>
    </main>
  )
}

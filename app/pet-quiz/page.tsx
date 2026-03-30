'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { useProducts } from '@/lib/use-products'
import { ProductGrid } from '@/components/ProductGrid'
import { useCart } from '@/lib/cart-context'
import { PawPrint, ChevronRight, Check, RotateCcw, Gift } from 'lucide-react'

const steps = [
  {
    key: 'type',
    en: 'What kind of pet do you have?',
    zh: '你养的是什么宠物？',
    options: [
      { value: 'Dog', en: '🐕 Dog', zh: '🐕 狗' },
      { value: 'Cat', en: '🐈 Cat', zh: '🐈 猫' },
    ],
  },
  {
    key: 'age',
    en: 'How old is your pet?',
    zh: '你的宠物多大了？',
    options: [
      { value: 'Puppy/Kitten', en: 'Puppy / Kitten', zh: '幼年' },
      { value: 'Young', en: 'Young (1-3 years)', zh: '青年 (1-3岁)' },
      { value: 'Adult', en: 'Adult (3-7 years)', zh: '成年 (3-7岁)' },
      { value: 'Senior', en: 'Senior (7+ years)', zh: '老年 (7+岁)' },
    ],
  },
  {
    key: 'weight',
    en: 'What size is your pet?',
    zh: '你的宠物体型如何？',
    options: [
      { value: 'Small', en: 'Small (<10kg / 22lbs)', zh: '小型 (<10kg)' },
      { value: 'Medium', en: 'Medium (10-25kg / 22-55lbs)', zh: '中型 (10-25kg)' },
      { value: 'Large', en: 'Large (>25kg / 55lbs+)', zh: '大型 (>25kg)' },
    ],
  },
  {
    key: 'need',
    en: 'What are you looking for?',
    zh: '你在找什么类型的产品？',
    options: [
      { value: 'toys', en: '🧸 Toys', zh: '🧸 玩具' },
      { value: 'beds', en: '🛏️ Beds & Blankets', zh: '🛏️ 窝和毯子' },
      { value: 'leashes', en: '🦮 Leashes & Harnesses', zh: '🦮 牵引绳和胸背带' },
      { value: 'bowls', en: '🍽️ Bowls & Feeders', zh: '🍽️ 食盆和喂食器' },
      { value: 'accessories', en: '🎀 Accessories', zh: '🎀 配饰' },
      { value: 'all', en: '✨ Show me everything!', zh: '✨ 展示所有！' },
    ],
  },
]

export default function PetQuizPage() {
  const { locale } = useLocale()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [petName, setPetName] = useState('')
  const [giftAdded, setGiftAdded] = useState(false)
  const [giftName, setGiftName] = useState('')

  const params: Record<string, string> = { limit: '8' }
  if (answers.type) params.petType = answers.type
  if (answers.need && answers.need !== 'all') params.category = answers.need
  const { products } = useProducts(done ? params : undefined)

  function selectOption(value: string) {
    const newAnswers = { ...answers, [steps[step].key]: value }
    setAnswers(newAnswers)
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setDone(true)
      // Add free gift if not already claimed
      if (!localStorage.getItem('quiz-gift-claimed')) {
        fetch('/api/products?search=quiz-gift&limit=1')
          .then(r => r.json())
          .then(data => {
            const gift = (data.products || [])[0]
            if (gift) {
              addItem(gift.id)
              setGiftAdded(true)
              setGiftName(gift.name)
              localStorage.setItem('quiz-gift-claimed', 'true')
              // Send gift email (silent, don't block UI)
              fetch('/api/quiz-gift-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ giftName: gift.name }),
              }).catch(() => {})
            }
          })
          .catch(() => {})
      }
    }
  }

  async function savePet() {
    if (!petName.trim()) return
    setSaved(true)
    try {
      await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: petName.trim(), type: answers.type, age: answers.age, weight: answers.weight }),
      })
    } catch {}
  }

  function restart() {
    setStep(0); setAnswers({}); setDone(false); setSaved(false); setPetName('')
  }

  const progress = done ? 100 : (step / steps.length) * 100

  return (
    <main className="container page-stack">
      <h1 className="page-title">
        <PawPrint size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        {locale === 'zh' ? '宠物问卷' : 'Pet Quiz'}
      </h1>
      <p className="page-subtitle">{locale === 'zh' ? '回答几个问题，为你的宠物找到完美的产品！' : 'Answer a few questions to find the perfect products for your pet!'}</p>

      <div className="quiz-progress"><div className="quiz-progress-bar" style={{ width: `${progress}%` }} /></div>

      {!done ? (
        <div className="quiz-step">
          <h2 className="quiz-question">{locale === 'zh' ? steps[step].zh : steps[step].en}</h2>
          <div className="quiz-options">
            {steps[step].options.map(opt => (
              <button key={opt.value} className={`quiz-option ${answers[steps[step].key] === opt.value ? 'quiz-option--selected' : ''}`} onClick={() => selectOption(opt.value)}>
                {locale === 'zh' ? opt.zh : opt.en}
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
          {step > 0 && <button className="quiz-back" onClick={() => setStep(step - 1)}>← {locale === 'zh' ? '上一步' : 'Back'}</button>}
        </div>
      ) : (
        <div className="quiz-results">
          {giftAdded && (
            <div className="quiz-gift-popup">
              <Gift size={24} />
              <div>
                <strong>{locale === 'zh' ? '🎁 恭喜！你获得了一个免费赠品！' : '🎁 Congrats! You got a free gift!'}</strong>
                <p>{giftName} {locale === 'zh' ? '已加入你的购物车（消费满 $10 即可使用）' : 'has been added to your cart (spend $10+ to redeem)'}</p>
              </div>
            </div>
          )}

          <div className="quiz-results-header">
            <Check size={24} className="quiz-check-icon" />
            <h2>{locale === 'zh' ? '为你推荐的产品' : 'Recommended Products for You'}</h2>
          </div>

          {user && !saved && (
            <div className="quiz-save-pet">
              <p>{locale === 'zh' ? '保存宠物档案以获得持续的个性化推荐' : 'Save your pet profile for ongoing personalized recommendations'}</p>
              <div className="quiz-save-row">
                <input placeholder={locale === 'zh' ? '给你的宠物起个名字' : "Your pet's name"} value={petName} onChange={e => setPetName(e.target.value)} />
                <button className="btn-primary btn-sm" onClick={savePet} disabled={!petName.trim()}>{locale === 'zh' ? '保存' : 'Save Pet'}</button>
              </div>
            </div>
          )}
          {saved && <div className="quiz-saved-msg"><Check size={16} /> {locale === 'zh' ? `${petName} 已保存！` : `${petName} saved to your profile!`}</div>}

          <ProductGrid items={products} />
          <button className="quiz-restart" onClick={restart}><RotateCcw size={16} /> {locale === 'zh' ? '重新开始' : 'Take Quiz Again'}</button>
        </div>
      )}
    </main>
  )
}

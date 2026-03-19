'use client'

import { notFound } from 'next/navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { products } from '@/lib/catalog'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Check } from 'lucide-react'

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const item = products.find((p) => p.slug === params.slug)
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  if (!item) return notFound()

  function handleAdd() {
    if (!user) {
      router.push('/auth?tab=login')
      return
    }
    addItem(item!.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <main className="container page-stack">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <img src={item.image} alt={item.name} style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 16, background: '#f8f4ef' }} />
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>{item.name}</h1>
          <p style={{ color: '#888', textTransform: 'capitalize', marginBottom: '1rem' }}>{item.category.replace('-', ' ')} • {item.petType}</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>${item.price.toFixed(2)}</p>
          <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>{item.description}</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleAdd} style={{ minWidth: 180, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}>
              {added ? <><Check size={16} /> Added!</> : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

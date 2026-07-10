'use client'

import { Truck, Check } from 'lucide-react'

/**
 * Goal-gradient free-shipping progress bar. Pure display — reads the cart
 * subtotal it's handed and never touches checkout/payment logic. Threshold
 * matches the real FREE_STANDARD_THRESHOLD ($80).
 */
export function FreeShipBar({ subtotal, threshold = 80 }: { subtotal: number; threshold?: number }) {
  const remaining = Math.max(0, threshold - subtotal)
  const pct = Math.min(100, threshold > 0 ? (subtotal / threshold) * 100 : 100)
  const unlocked = remaining <= 0
  return (
    <div className={`freeship ${unlocked ? 'freeship--unlocked' : ''}`}>
      <p className="freeship-label">
        {unlocked ? (
          <><Check size={15} /> You&apos;ve unlocked free shipping!</>
        ) : (
          <><Truck size={15} /> You&apos;re <strong>${remaining.toFixed(2)}</strong> away from free shipping</>
        )}
      </p>
      <div className="freeship-track">
        <div className="freeship-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

'use client'

import { type ReactNode } from 'react'
import { useReveal } from '@/lib/use-reveal'

/**
 * Wraps content in a div that fades + rises into view on first scroll.
 * `delay` (ms) staggers siblings. Keep the wrapper transparent so it doesn't
 * affect layout of the section inside it.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

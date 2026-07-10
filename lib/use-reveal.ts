'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll hook. Returns a ref to attach to an element and a `visible`
 * flag that flips true the first time the element scrolls into view — pair it
 * with the `.reveal` / `.reveal--visible` CSS classes for a fade-and-rise.
 *
 * Respects prefers-reduced-motion (shows immediately, no animation) and is a
 * no-op safe on the server (visible stays false until mount, then the observer
 * runs on the client).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number
  rootMargin?: string
}) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced-motion users get the content instantly, no transition.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    // No IntersectionObserver (very old browsers) → just show it.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            io.disconnect()
            break
          }
        }
      },
      {
        threshold: options?.threshold ?? 0.12,
        rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
      },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [options?.threshold, options?.rootMargin])

  return { ref, visible }
}

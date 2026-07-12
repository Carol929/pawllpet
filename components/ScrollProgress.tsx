'use client'

import { useEffect, useRef } from 'react'

/**
 * A thin reading-progress bar pinned to the top of the viewport. Purely
 * decorative (aria-hidden). Writes the transform directly to the node on scroll
 * (no React re-render per frame) for a smooth, cheap update.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const apply = () => {
      ticking = false
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const pct = max > 0 ? Math.min(1, el.scrollTop / max) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${pct})`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}

'use client'

import { useEffect, useState } from 'react'

/**
 * A thin reading-progress bar pinned to the top of the viewport. Purely
 * decorative (aria-hidden). Uses a transform-scale for cheap GPU updates.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setPct(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div className="scroll-progress" style={{ transform: `scaleX(${pct})` }} aria-hidden="true" />
}

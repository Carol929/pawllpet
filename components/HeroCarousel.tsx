'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    src: '/banner-eco-love.jpg',
    alt: 'PawLL Pet - Eco love for every paw',
  },
  {
    src: '/mainpage.jpg',
    alt: 'PawLL Pet - Premium pet essentials',
  },
]

// Infinite loop: clone last slide before first, and first slide after last
// Layout: [clone-last] [slide0] [slide1] [clone-first]
// Index:      0           1        2          3
const loopSlides = [
  slides[slides.length - 1], // clone of last
  ...slides,
  slides[0], // clone of first
]

export function HeroCarousel() {
  const [pos, setPos] = useState(1) // Start at real first slide (index 1)
  const [transitioning, setTransitioning] = useState(true)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const realIndex = ((pos - 1) % slides.length + slides.length) % slides.length

  const goTo = useCallback((index: number) => {
    setTransitioning(true)
    setPos(index)
  }, [])

  const next = useCallback(() => goTo(pos + 1), [pos, goTo])
  const prev = useCallback(() => goTo(pos - 1), [pos, goTo])

  // Handle snap-back when reaching clone slides
  function handleTransitionEnd() {
    if (pos <= 0) {
      // Reached clone of last → jump to real last (no animation)
      setTransitioning(false)
      setPos(slides.length)
    } else if (pos >= slides.length + 1) {
      // Reached clone of first → jump to real first (no animation)
      setTransitioning(false)
      setPos(1)
    }
  }

  // Re-enable transition after snap-back
  useEffect(() => {
    if (!transitioning) {
      const id = requestAnimationFrame(() => setTransitioning(true))
      return () => cancelAnimationFrame(id)
    }
  }, [transitioning])

  // Autoplay
  useEffect(() => {
    if (paused) return
    autoplayRef.current = setInterval(() => {
      setTransitioning(true)
      setPos(p => p + 1)
    }, 5000)
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [paused])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev()
    }
  }

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="hero-carousel-track"
        style={{
          transform: `translateX(-${pos * 100}%)`,
          transition: transitioning ? 'transform 0.5s ease' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopSlides.map((slide, i) => (
          <div key={i} className="hero-carousel-slide">
            <Image src={slide.src} alt={slide.alt} width={1200} height={480} sizes="100vw" priority={i <= 2} style={{ width: '100%', height: '480px', objectFit: 'contain' }} />
          </div>
        ))}
      </div>

      <button className="hero-carousel-arrow hero-carousel-arrow--left" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button className="hero-carousel-arrow hero-carousel-arrow--right" onClick={next} aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      <div className="hero-carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-carousel-dot ${i === realIndex ? 'hero-carousel-dot--active' : ''}`}
            onClick={() => goTo(i + 1)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

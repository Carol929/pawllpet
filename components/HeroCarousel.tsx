'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    src: '/mainpage.jpg',
    alt: 'PawLL Pet - Premium pet essentials',
  },
  {
    src: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=500&fit=crop&q=80',
    alt: 'Cat with beautiful eyes',
  },
  {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=500&fit=crop&q=80',
    alt: 'Two dogs running on the beach',
  },
  {
    src: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1200&h=500&fit=crop&q=80',
    alt: 'Cat looking up curiously',
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length)
  }, [])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (paused) return
    autoplayRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [paused])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
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
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="hero-carousel-slide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>

      <button
        className="hero-carousel-arrow hero-carousel-arrow--left"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="hero-carousel-arrow hero-carousel-arrow--right"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      <div className="hero-carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-carousel-dot ${i === current ? 'hero-carousel-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

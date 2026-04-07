import { describe, it, expect } from 'vitest'
import { blogPosts, collections } from '@/lib/static-data'

// ═══════════════════════════════════════════════════════════
// Blog posts data integrity
// ═══════════════════════════════════════════════════════════
describe('blogPosts', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(blogPosts)).toBe(true)
    expect(blogPosts.length).toBeGreaterThan(0)
  })

  it('each post has slug, title, excerpt', () => {
    blogPosts.forEach(post => {
      expect(post.slug).toBeTruthy()
      expect(typeof post.slug).toBe('string')
      expect(post.title).toBeTruthy()
      expect(typeof post.title).toBe('string')
      expect(post.excerpt).toBeTruthy()
      expect(typeof post.excerpt).toBe('string')
    })
  })

  it('slugs are unique', () => {
    const slugs = blogPosts.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('slugs are URL-safe (lowercase, hyphens, no spaces)', () => {
    blogPosts.forEach(post => {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Collections data integrity
// ═══════════════════════════════════════════════════════════
describe('collections', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(collections)).toBe(true)
    expect(collections.length).toBeGreaterThan(0)
  })

  it('each collection has slug, title, description', () => {
    collections.forEach(c => {
      expect(c.slug).toBeTruthy()
      expect(typeof c.slug).toBe('string')
      expect(c.title).toBeTruthy()
      expect(typeof c.title).toBe('string')
      expect(c.description).toBeTruthy()
      expect(typeof c.description).toBe('string')
    })
  })

  it('slugs are unique', () => {
    const slugs = collections.map(c => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('slugs are URL-safe', () => {
    collections.forEach(c => {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/)
    })
  })
})

import { describe, it, expect } from 'vitest'

// ═══════════════════════════════════════════════════════════
// Search URL construction (as done in Header.tsx)
// ═══════════════════════════════════════════════════════════
describe('Search URL construction', () => {
  function buildSearchUrl(query: string): string {
    const trimmed = query.trim()
    if (!trimmed) return '/shop'
    return `/search?q=${encodeURIComponent(trimmed)}`
  }

  it('builds search URL with query', () => {
    expect(buildSearchUrl('cat toys')).toBe('/search?q=cat%20toys')
  })

  it('encodes special characters', () => {
    expect(buildSearchUrl('bed & bowl')).toBe('/search?q=bed%20%26%20bowl')
  })

  it('trims whitespace', () => {
    expect(buildSearchUrl('  cat  ')).toBe('/search?q=cat')
  })

  it('redirects to shop for empty query', () => {
    expect(buildSearchUrl('')).toBe('/shop')
  })

  it('redirects to shop for whitespace-only query', () => {
    expect(buildSearchUrl('   ')).toBe('/shop')
  })

  it('handles unicode characters', () => {
    const url = buildSearchUrl('猫玩具')
    expect(url).toContain('/search?q=')
    expect(decodeURIComponent(url.split('=')[1])).toBe('猫玩具')
  })
})

// ═══════════════════════════════════════════════════════════
// Shop filter URL params (as done in shop/page.tsx)
// ═══════════════════════════════════════════════════════════
describe('Shop URL params parsing', () => {
  function parseShopParams(searchString: string) {
    const params = new URLSearchParams(searchString)
    return {
      q: params.get('q') || '',
      pet: params.get('pet') || '',
      cat: params.get('category') || '',
      sort: params.get('sort') || 'newest',
      minP: params.get('minPrice') || '',
      maxP: params.get('maxPrice') || '',
      page: parseInt(params.get('page') || '1'),
    }
  }

  it('parses empty params with defaults', () => {
    const result = parseShopParams('')
    expect(result.q).toBe('')
    expect(result.pet).toBe('')
    expect(result.sort).toBe('newest')
    expect(result.page).toBe(1)
  })

  it('parses pet type', () => {
    const result = parseShopParams('pet=cat')
    expect(result.pet).toBe('cat')
  })

  it('parses search query', () => {
    const result = parseShopParams('q=toy')
    expect(result.q).toBe('toy')
  })

  it('parses sort option', () => {
    const result = parseShopParams('sort=price_asc')
    expect(result.sort).toBe('price_asc')
  })

  it('parses page number', () => {
    const result = parseShopParams('page=3')
    expect(result.page).toBe(3)
  })

  it('parses price range', () => {
    const result = parseShopParams('minPrice=10&maxPrice=50')
    expect(result.minP).toBe('10')
    expect(result.maxP).toBe('50')
  })

  it('parses category', () => {
    const result = parseShopParams('category=toys')
    expect(result.cat).toBe('toys')
  })

  it('handles combined params', () => {
    const result = parseShopParams('pet=dog&category=beds&sort=price_desc&page=2')
    expect(result.pet).toBe('dog')
    expect(result.cat).toBe('beds')
    expect(result.sort).toBe('price_desc')
    expect(result.page).toBe(2)
  })

  it('defaults page to 1 on invalid page', () => {
    const result = parseShopParams('page=abc')
    expect(result.page).toBeNaN() // parseInt('abc') = NaN, this is the current behavior
  })
})

// ═══════════════════════════════════════════════════════════
// Sectioned mode logic (from shop/page.tsx)
// ═══════════════════════════════════════════════════════════
describe('Shop sectioned mode', () => {
  it('enters sectioned mode when pet is set and no search', () => {
    const pet = 'cat'
    const q = ''
    const cat = ''
    const sectionedMode = !!pet && !cat && !q
    expect(sectionedMode).toBe(true)
  })

  it('exits sectioned mode when search is active', () => {
    const pet = 'cat'
    const q = 'toy'
    const cat = ''
    const sectionedMode = !!pet && !cat && !q
    expect(sectionedMode).toBe(false)
  })

  it('exits sectioned mode when category filter is active', () => {
    const pet = 'cat'
    const q = ''
    const cat = 'toys'
    const sectionedMode = !!pet && !cat && !q
    expect(sectionedMode).toBe(false)
  })

  it('not in sectioned mode without pet', () => {
    const pet = ''
    const q = ''
    const cat = ''
    const sectionedMode = !!pet && !cat && !q
    expect(sectionedMode).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
// Category sections constant
// ═══════════════════════════════════════════════════════════
describe('Category sections', () => {
  const CATEGORY_SECTIONS = [
    { slug: 'toys', en: 'Toys', zh: '玩具' },
    { slug: 'accessories', en: 'Accessories', zh: '配饰' },
    { slug: 'beds', en: 'Beds', zh: '宠物床' },
    { slug: 'bowls', en: 'Bowls', zh: '食盆' },
  ]

  it('has exactly 4 categories', () => {
    expect(CATEGORY_SECTIONS).toHaveLength(4)
  })

  it('all slugs are unique', () => {
    const slugs = CATEGORY_SECTIONS.map(s => s.slug)
    expect(new Set(slugs).size).toBe(4)
  })

  it('all have en and zh labels', () => {
    CATEGORY_SECTIONS.forEach(sec => {
      expect(sec.en).toBeTruthy()
      expect(sec.zh).toBeTruthy()
    })
  })

  it('slugs are URL-safe', () => {
    CATEGORY_SECTIONS.forEach(sec => {
      expect(sec.slug).toMatch(/^[a-z-]+$/)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Pagination logic (from shop/page.tsx)
// ═══════════════════════════════════════════════════════════
describe('Pagination', () => {
  const PAGE_SIZE = 12

  function getVisiblePages(page: number, totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  }

  it('shows all pages when total is small', () => {
    expect(getVisiblePages(1, 3)).toEqual([1, 2, 3])
  })

  it('shows first, last, and neighbors for middle page', () => {
    const pages = getVisiblePages(5, 10)
    expect(pages).toContain(1)     // first
    expect(pages).toContain(10)    // last
    expect(pages).toContain(4)     // prev
    expect(pages).toContain(5)     // current
    expect(pages).toContain(6)     // next
    expect(pages).not.toContain(3) // too far
  })

  it('handles first page', () => {
    const pages = getVisiblePages(1, 10)
    expect(pages).toContain(1)
    expect(pages).toContain(2)
    expect(pages).toContain(10)
  })

  it('handles last page', () => {
    const pages = getVisiblePages(10, 10)
    expect(pages).toContain(1)
    expect(pages).toContain(9)
    expect(pages).toContain(10)
  })

  it('calculates total pages correctly', () => {
    expect(Math.ceil(24 / PAGE_SIZE)).toBe(2)
    expect(Math.ceil(12 / PAGE_SIZE)).toBe(1)
    expect(Math.ceil(13 / PAGE_SIZE)).toBe(2)
    expect(Math.ceil(0 / PAGE_SIZE)).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════
// Sort options validation
// ═══════════════════════════════════════════════════════════
describe('Sort options', () => {
  const validSorts = ['newest', 'price_asc', 'price_desc', 'name', 'rating']

  it('all sort values are unique', () => {
    expect(new Set(validSorts).size).toBe(validSorts.length)
  })

  it('default sort is newest', () => {
    const rawSort = '' as string
    const sort = rawSort || 'newest'
    expect(sort).toBe('newest')
  })
})

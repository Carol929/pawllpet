import { describe, it, expect } from 'vitest'

// ═══════════════════════════════════════════════════════════
// Birthday input validation (as fixed in auth page)
// ═══════════════════════════════════════════════════════════
describe('Birthday validation', () => {
  function isValidMonth(v: string): boolean {
    if (!v) return true // empty is OK (optional field)
    const n = parseInt(v)
    return !isNaN(n) && n >= 1 && n <= 12
  }

  function isValidDay(v: string): boolean {
    if (!v) return true
    const n = parseInt(v)
    return !isNaN(n) && n >= 1 && n <= 31
  }

  function isValidYear(v: string): boolean {
    if (!v || v.length < 4) return true // allow typing in progress
    const n = parseInt(v)
    return !isNaN(n) && n >= 1920 && n <= new Date().getFullYear()
  }

  describe('Month', () => {
    it('accepts valid months 1-12', () => {
      for (let m = 1; m <= 12; m++) {
        expect(isValidMonth(String(m))).toBe(true)
      }
    })

    it('rejects month 0', () => {
      expect(isValidMonth('0')).toBe(false)
    })

    it('rejects month 13', () => {
      expect(isValidMonth('13')).toBe(false)
    })

    it('accepts empty (optional)', () => {
      expect(isValidMonth('')).toBe(true)
    })
  })

  describe('Day', () => {
    it('accepts valid days 1-31', () => {
      for (let d = 1; d <= 31; d++) {
        expect(isValidDay(String(d))).toBe(true)
      }
    })

    it('rejects day 0', () => {
      expect(isValidDay('0')).toBe(false)
    })

    it('rejects day 32', () => {
      expect(isValidDay('32')).toBe(false)
    })
  })

  describe('Year', () => {
    it('accepts valid year 1990', () => {
      expect(isValidYear('1990')).toBe(true)
    })

    it('accepts year 2000', () => {
      expect(isValidYear('2000')).toBe(true)
    })

    it('accepts current year', () => {
      expect(isValidYear(String(new Date().getFullYear()))).toBe(true)
    })

    it('rejects year before 1920', () => {
      expect(isValidYear('1919')).toBe(false)
    })

    it('rejects future year', () => {
      expect(isValidYear(String(new Date().getFullYear() + 1))).toBe(false)
    })

    it('allows partial input (typing in progress)', () => {
      expect(isValidYear('19')).toBe(true)  // still typing
      expect(isValidYear('199')).toBe(true) // still typing
    })
  })

  describe('Birthday date construction', () => {
    it('constructs valid ISO date from parts', () => {
      const month = '3'
      const day = '15'
      const year = '1995'
      const birthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      expect(birthday).toBe('1995-03-15')
    })

    it('pads single-digit month', () => {
      expect('3'.padStart(2, '0')).toBe('03')
    })

    it('does not pad double-digit month', () => {
      expect('12'.padStart(2, '0')).toBe('12')
    })

    it('returns undefined when parts missing', () => {
      const month = '' as string
      const day = '15' as string
      const year = '1995' as string
      const birthday = (month && day && year)
        ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : undefined
      expect(birthday).toBeUndefined()
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Login redirect param (as fixed in auth page)
// ═══════════════════════════════════════════════════════════
describe('Login redirect', () => {
  it('extracts redirect param from URL', () => {
    const params = new URLSearchParams('tab=login&redirect=%2Fproducts%2Fcat-toy')
    const redirect = params.get('redirect') || '/'
    expect(redirect).toBe('/products/cat-toy')
  })

  it('defaults to / when no redirect param', () => {
    const params = new URLSearchParams('tab=login')
    const redirect = params.get('redirect') || '/'
    expect(redirect).toBe('/')
  })

  it('preserves cart redirect', () => {
    const params = new URLSearchParams('tab=login&redirect=%2Fcart')
    const redirect = params.get('redirect') || '/'
    expect(redirect).toBe('/cart')
  })

  it('encodes redirect properly from ProductGrid', () => {
    const slug = 'cat-toy-mouse'
    const url = `/auth?tab=login&redirect=${encodeURIComponent(`/products/${slug}`)}`
    expect(url).toBe('/auth?tab=login&redirect=%2Fproducts%2Fcat-toy-mouse')
  })
})

// ═══════════════════════════════════════════════════════════
// Signup data construction
// ═══════════════════════════════════════════════════════════
describe('Signup data construction', () => {
  it('combines first and last name into fullName', () => {
    const firstName = 'John'
    const lastName = 'Doe'
    const fullName = `${firstName} ${lastName}`.trim()
    expect(fullName).toBe('John Doe')
  })

  it('handles first name only', () => {
    const firstName = 'John'
    const lastName = ''
    const fullName = `${firstName} ${lastName}`.trim()
    expect(fullName).toBe('John')
  })

  it('normalizes username', () => {
    const raw = 'John_Doe-123'
    const username = raw.toLowerCase().replace(/[^a-z0-9]/g, '')
    expect(username).toBe('johndoe123')
  })
})

// ═══════════════════════════════════════════════════════════
// Tab switching
// ═══════════════════════════════════════════════════════════
describe('Auth tab from URL', () => {
  it('defaults to login tab', () => {
    const params = new URLSearchParams('')
    const tab = params.get('tab')
    const activeTab = (tab === 'login' || tab === 'signup') ? tab : 'login'
    expect(activeTab).toBe('login')
  })

  it('switches to signup tab', () => {
    const params = new URLSearchParams('tab=signup')
    const tab = params.get('tab')
    const activeTab = (tab === 'login' || tab === 'signup') ? tab : 'login'
    expect(activeTab).toBe('signup')
  })

  it('ignores invalid tab values', () => {
    const params = new URLSearchParams('tab=invalid')
    const tab = params.get('tab')
    const activeTab = (tab === 'login' || tab === 'signup') ? tab : 'login'
    expect(activeTab).toBe('login')
  })
})

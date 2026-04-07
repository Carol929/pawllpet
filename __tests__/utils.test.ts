import { describe, it, expect, vi } from 'vitest'
import { isValidEmail, isValidPassword, generateUniqueUsername, formatDate, formatDateTime } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════
// isValidEmail
// ═══════════════════════════════════════════════════════════
describe('isValidEmail', () => {
  it('accepts standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  it('accepts email with plus alias', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('accepts email with dots in local part', () => {
    expect(isValidEmail('first.last@example.com')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects missing local part', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('rejects double @', () => {
    expect(isValidEmail('user@@example.com')).toBe(false)
  })

  it('rejects missing TLD', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
// isValidPassword
// ═══════════════════════════════════════════════════════════
describe('isValidPassword', () => {
  it('accepts 8 character password', () => {
    expect(isValidPassword('12345678')).toBe(true)
  })

  it('accepts longer password', () => {
    expect(isValidPassword('a very long password indeed')).toBe(true)
  })

  it('rejects 7 character password', () => {
    expect(isValidPassword('1234567')).toBe(false)
  })

  it('rejects empty password', () => {
    expect(isValidPassword('')).toBe(false)
  })

  it('rejects single character', () => {
    expect(isValidPassword('a')).toBe(false)
  })

  it('accepts exactly 8 characters (boundary)', () => {
    expect(isValidPassword('abcdefgh')).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════
// generateUniqueUsername
// ═══════════════════════════════════════════════════════════
describe('generateUniqueUsername', () => {
  it('generates username from email prefix', async () => {
    const checkExists = vi.fn().mockResolvedValue(false)
    const result = await generateUniqueUsername('john@example.com', checkExists)
    expect(result).toBe('john')
  })

  it('strips special characters from email prefix', async () => {
    const checkExists = vi.fn().mockResolvedValue(false)
    const result = await generateUniqueUsername('john.doe+test@example.com', checkExists)
    expect(result).toBe('johndoetest')
  })

  it('lowercases the username', async () => {
    const checkExists = vi.fn().mockResolvedValue(false)
    const result = await generateUniqueUsername('JohnDoe@example.com', checkExists)
    expect(result).toBe('johndoe')
  })

  it('appends counter when username exists', async () => {
    const checkExists = vi.fn()
      .mockResolvedValueOnce(true)   // 'john' exists
      .mockResolvedValueOnce(true)   // 'john1' exists
      .mockResolvedValueOnce(false)  // 'john2' is available
    const result = await generateUniqueUsername('john@example.com', checkExists)
    expect(result).toBe('john2')
    expect(checkExists).toHaveBeenCalledTimes(3)
  })

  it('handles numeric-only prefix', async () => {
    const checkExists = vi.fn().mockResolvedValue(false)
    const result = await generateUniqueUsername('123@example.com', checkExists)
    expect(result).toBe('123')
  })

  it('handles email with hyphens and underscores (stripped)', async () => {
    const checkExists = vi.fn().mockResolvedValue(false)
    const result = await generateUniqueUsername('my-user_name@example.com', checkExists)
    expect(result).toBe('myusername')
  })
})

// ═══════════════════════════════════════════════════════════
// formatDate
// ═══════════════════════════════════════════════════════════
describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-03-15'))
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('formats a date string', () => {
    const result = formatDate('2024-03-15')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('includes year in output', () => {
    const result = formatDate('2024-03-15')
    expect(result).toContain('2024')
  })
})

// ═══════════════════════════════════════════════════════════
// formatDateTime
// ═══════════════════════════════════════════════════════════
describe('formatDateTime', () => {
  it('formats a Date object with time', () => {
    const result = formatDateTime(new Date('2024-03-15T14:30:00'))
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('formats a datetime string', () => {
    const result = formatDateTime('2024-03-15T14:30:00')
    expect(result).toBeTruthy()
  })

  it('includes year in output', () => {
    const result = formatDateTime('2024-03-15T14:30:00')
    expect(result).toContain('2024')
  })
})

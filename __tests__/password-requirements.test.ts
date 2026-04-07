import { describe, it, expect } from 'vitest'
import { passwordMeetsAllRules } from '@/components/PasswordRequirements'

describe('passwordMeetsAllRules', () => {
  it('accepts a strong password with all requirements', () => {
    expect(passwordMeetsAllRules('Abcdef1!')).toBe(true)
  })

  it('rejects password shorter than 8 chars', () => {
    expect(passwordMeetsAllRules('Ab1!xyz')).toBe(false) // 7 chars
  })

  it('rejects password without uppercase', () => {
    expect(passwordMeetsAllRules('abcdef1!')).toBe(false)
  })

  it('rejects password without lowercase', () => {
    expect(passwordMeetsAllRules('ABCDEF1!')).toBe(false)
  })

  it('rejects password without number', () => {
    expect(passwordMeetsAllRules('Abcdefg!')).toBe(false)
  })

  it('rejects password without special character', () => {
    expect(passwordMeetsAllRules('Abcdefg1')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(passwordMeetsAllRules('')).toBe(false)
  })

  it('accepts complex password', () => {
    expect(passwordMeetsAllRules('MyP@ssw0rd!2024')).toBe(true)
  })

  it('accepts password with spaces (as special char)', () => {
    expect(passwordMeetsAllRules('Hello W0rld ')).toBe(true)
  })

  it('rejects all-lowercase with number and special', () => {
    expect(passwordMeetsAllRules('abcdefg1!')).toBe(false)
  })

  it('rejects all-uppercase with number and special', () => {
    expect(passwordMeetsAllRules('ABCDEFG1!')).toBe(false)
  })

  it('accepts exactly 8 chars with all rules met', () => {
    expect(passwordMeetsAllRules('Aa1!xxxx')).toBe(true)
  })
})

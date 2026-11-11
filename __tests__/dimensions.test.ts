/**
 * Package-size handling for the admin product form: unit conversion and the
 * rules for what may be saved.
 */

import { describe, expect, it } from 'vitest'
import {
  convertPackageSize,
  fromInches,
  packageSizeForForm,
  parsePackageSize,
  toInches,
} from '@/lib/dimensions'
import { productCreateSchema, productUpdateSchema } from '@/lib/validations/product'

describe('unit conversion', () => {
  it('converts centimetres to inches and leaves inches alone', () => {
    expect(toInches(25.4, 'cm')).toBeCloseTo(10, 10)
    expect(toInches(10, 'in')).toBe(10)
  })

  it('shows stored inches in the chosen unit, to one decimal place', () => {
    expect(fromInches(10, 'cm')).toBe(25.4)
    expect(fromInches(11.81, 'cm')).toBe(30)
    expect(fromInches(11.81, 'in')).toBe(11.8)
  })
})

describe('parsePackageSize', () => {
  it('treats three empty fields as "no size on file"', () => {
    expect(parsePackageSize({ length: '', width: '', height: '' }, 'cm')).toEqual({ ok: true, inches: null })
    expect(parsePackageSize({ length: ' ', width: '', height: '  ' }, 'in')).toEqual({ ok: true, inches: null })
  })

  it('converts a size typed in centimetres to inches, rounded to two decimals', () => {
    expect(parsePackageSize({ length: '40', width: '30', height: '15' }, 'cm')).toEqual({
      ok: true,
      inches: { length: 15.75, width: 11.81, height: 5.91 },
    })
  })

  it('keeps a size typed in inches as it is', () => {
    expect(parsePackageSize({ length: '16', width: '12', height: '6.5' }, 'in')).toEqual({
      ok: true,
      inches: { length: 16, width: 12, height: 6.5 },
    })
  })

  it('rejects a partly filled size', () => {
    const result = parsePackageSize({ length: '40', width: '', height: '15' }, 'cm')
    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ error: expect.stringContaining('all three') })
  })

  it.each([
    ['zero', '0'],
    ['a negative number', '-5'],
    ['not a number', 'abc'],
  ])('rejects a side that is %s', (_label, bad) => {
    expect(parsePackageSize({ length: bad, width: '30', height: '15' }, 'cm').ok).toBe(false)
  })

  it('rejects a side longer than a carrier accepts and names the limit in the unit being typed', () => {
    expect(parsePackageSize({ length: '109', width: '10', height: '10' }, 'in')).toMatchObject({
      ok: false,
      error: expect.stringContaining('108 in'),
    })
    expect(parsePackageSize({ length: '300', width: '10', height: '10' }, 'cm')).toMatchObject({
      ok: false,
      error: expect.stringContaining('274 cm'),
    })
    expect(parsePackageSize({ length: '108', width: '10', height: '10' }, 'in').ok).toBe(true)
  })
})

describe('form helpers', () => {
  it('fills the form from a saved product in centimetres', () => {
    expect(packageSizeForForm({ length: 15.75, width: 11.81, height: 5.91 }, 'cm')).toEqual({
      length: '40',
      width: '30',
      height: '15',
    })
  })

  it('leaves the fields empty for a product with no size on file', () => {
    expect(packageSizeForForm({ length: null, width: null, height: null }, 'cm')).toEqual({ length: '', width: '', height: '' })
    expect(packageSizeForForm({}, 'in')).toEqual({ length: '', width: '', height: '' })
  })

  it('round-trips a typical size through save and reload without drift', () => {
    const typed = { length: '40', width: '30', height: '15' }
    const saved = parsePackageSize(typed, 'cm')
    expect(saved.ok).toBe(true)
    if (saved.ok && saved.inches) expect(packageSizeForForm(saved.inches, 'cm')).toEqual(typed)
  })

  it('converts what is typed when the unit toggle is switched, leaving blanks and junk untouched', () => {
    expect(convertPackageSize({ length: '25.4', width: '', height: 'abc' }, 'cm', 'in')).toEqual({
      length: '10',
      width: '',
      height: 'abc',
    })
    const same = { length: '10', width: '8', height: '4' }
    expect(convertPackageSize(same, 'in', 'in')).toBe(same)
  })
})

describe('product validation schema', () => {
  const base = { name: 'Bed', slug: 'bed', description: 'A bed', categoryId: 'cat_1', petType: 'Both' as const }

  it('accepts dimensions, their absence, and null (which clears them)', () => {
    expect(productCreateSchema.parse({ ...base, length: 15.75, width: 11.81, height: 5.91 })).toMatchObject({
      length: 15.75,
      width: 11.81,
      height: 5.91,
    })
    expect(productCreateSchema.parse(base).length).toBeUndefined()
    expect(productUpdateSchema.parse({ length: null, width: null, height: null })).toEqual({
      length: null,
      width: null,
      height: null,
    })
  })

  it.each([0, -1, 109])('rejects a side of %s inches', (side) => {
    expect(productUpdateSchema.safeParse({ length: side }).success).toBe(false)
  })
})

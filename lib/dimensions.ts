/**
 * Package dimensions for the admin product form.
 *
 * Product.length/width/height are stored in inches (what the carrier API
 * takes). The form lets the admin type centimetres or inches.
 */

export type DimensionUnit = 'cm' | 'in'

/** The three fields exactly as typed; '' means the field is empty. */
export interface PackageSizeInput {
  length: string
  width: string
  height: string
}

export interface PackageSizeInches {
  length: number
  width: number
  height: number
}

const CM_PER_INCH = 2.54

/** Longest side a carrier accepts for an ordinary parcel, in inches. */
const MAX_SIDE_INCHES = 108

export const EMPTY_PACKAGE_SIZE: PackageSizeInput = { length: '', width: '', height: '' }

const round = (value: number, places: number) => {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function toInches(value: number, unit: DimensionUnit): number {
  return unit === 'cm' ? value / CM_PER_INCH : value
}

/** Stored inches as a value to show in `unit`, rounded to one decimal place. */
export function fromInches(inches: number, unit: DimensionUnit): number {
  return round(unit === 'cm' ? inches * CM_PER_INCH : inches, 1)
}

/** Fill the form fields from a saved product. A dimension that was never set stays empty. */
export function packageSizeForForm(
  product: { length?: number | null; width?: number | null; height?: number | null },
  unit: DimensionUnit,
): PackageSizeInput {
  const show = (inches?: number | null) => (inches != null && inches > 0 ? String(fromInches(inches, unit)) : '')
  return { length: show(product.length), width: show(product.width), height: show(product.height) }
}

/** Re-express what is typed in the form in another unit (used by the cm/in toggle). */
export function convertPackageSize(size: PackageSizeInput, from: DimensionUnit, to: DimensionUnit): PackageSizeInput {
  if (from === to) return size
  const convert = (text: string) => {
    const value = Number(text)
    if (text.trim() === '' || !Number.isFinite(value) || value <= 0) return text
    return String(fromInches(toInches(value, from), to))
  }
  return { length: convert(size.length), width: convert(size.width), height: convert(size.height) }
}

export type PackageSizeResult =
  | { ok: true; inches: PackageSizeInches | null }
  | { ok: false; error: string }

/**
 * Turn the form fields into what gets saved.
 *
 * All three empty is valid and means "no size on file" (`inches: null`).
 * Otherwise all three are required: a parcel quoted with one real side and two
 * placeholder sides is no more accurate than one with no size at all.
 */
export function parsePackageSize(size: PackageSizeInput, unit: DimensionUnit): PackageSizeResult {
  const fields = [size.length, size.width, size.height].map((text) => text.trim())
  if (fields.every((text) => text === '')) return { ok: true, inches: null }
  if (fields.some((text) => text === '')) {
    return { ok: false, error: 'Enter all three package dimensions, or leave all three empty' }
  }

  const inches = fields.map((text) => toInches(Number(text), unit))
  if (inches.some((value) => !Number.isFinite(value) || value <= 0)) {
    return { ok: false, error: 'Package dimensions must be numbers greater than 0' }
  }
  if (inches.some((value) => value > MAX_SIDE_INCHES)) {
    const limit = unit === 'cm' ? `${Math.floor(MAX_SIDE_INCHES * CM_PER_INCH)} cm` : `${MAX_SIDE_INCHES} in`
    return { ok: false, error: `A package side cannot be longer than ${limit}` }
  }

  const [length, width, height] = inches.map((value) => round(value, 2))
  return { ok: true, inches: { length, width, height } }
}

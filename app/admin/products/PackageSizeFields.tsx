'use client'

import { convertPackageSize, type DimensionUnit, type PackageSizeInput } from '@/lib/dimensions'

interface Props {
  size: PackageSizeInput
  unit: DimensionUnit
  onChange: (size: PackageSizeInput, unit: DimensionUnit) => void
}

const SIDES = [
  { key: 'length', label: 'Length' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
] as const

/**
 * Length × width × height of the packed box, with a cm/in toggle.
 * Shared by the new-product and edit-product forms.
 */
export default function PackageSizeFields({ size, unit, onChange }: Props) {
  const switchTo = (next: DimensionUnit) => {
    if (next !== unit) onChange(convertPackageSize(size, unit, next), next)
  }

  return (
    <div className="admin-form-group full">
      <label>Package size (L × W × H)</label>
      <div className="admin-weight-input">
        {SIDES.map(({ key, label }) => (
          <input
            key={key}
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            placeholder={label}
            aria-label={`Package ${label.toLowerCase()} in ${unit === 'cm' ? 'centimetres' : 'inches'}`}
            value={size[key]}
            onChange={e => onChange({ ...size, [key]: e.target.value }, unit)}
          />
        ))}
        <div className="admin-unit-toggle">
          <button type="button" className={unit === 'cm' ? 'active' : ''} onClick={() => switchTo('cm')}>cm</button>
          <button type="button" className={unit === 'in' ? 'active' : ''} onClick={() => switchTo('in')}>in</button>
        </div>
      </div>
      <small className="admin-field-hint">
        Outer size of the box or mailer this product ships in. Shipping is quoted and labels are bought for this size; left empty, a small 6 × 4 × 2 in parcel is assumed.
      </small>
    </div>
  )
}

'use client'

const rules = [
  { test: (p: string) => p.length >= 8, label: '至少 8 个字符 / At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: '至少 1 个大写字母 / At least 1 uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: '至少 1 个小写字母 / At least 1 lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: '至少 1 个数字 / At least 1 number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: '至少 1 个特殊字符 / At least 1 special character' },
]

export function passwordMeetsAllRules(password: string) {
  return rules.every((r) => r.test(password))
}

export default function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', fontSize: '.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {rules.map((rule) => {
        const met = rule.test(password)
        return (
          <li key={rule.label} style={{ color: met ? '#16a34a' : '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{met ? '✓' : '○'}</span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

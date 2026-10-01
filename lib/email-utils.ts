// Single source of truth for email normalization. Every surface that stores
// or looks up a user by email MUST pass through this, or case variants of one
// address become distinct accounts (confusion/takeover risk — see the
// 2026-09 pentest: admin@/Admin@/ADMIN@ registered as three users).
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

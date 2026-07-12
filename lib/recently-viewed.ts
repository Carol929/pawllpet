// Recently-viewed products, stored client-side in localStorage. Most-recent
// first, de-duped, capped. No backend, no PII — just product ids.

const KEY = 'pawll-recently-viewed'
const MAX = 12

export function recordView(productId: string) {
  if (typeof window === 'undefined' || !productId) return
  try {
    const raw = localStorage.getItem(KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    const next = [productId, ...list.filter((id) => id !== productId)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore quota / parse errors
  }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Shared JWT secret accessor.
 * Throws immediately if NEXTAUTH_SECRET is not set — never falls back to a hardcoded value.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET environment variable is required')
  return new TextEncoder().encode(secret)
}

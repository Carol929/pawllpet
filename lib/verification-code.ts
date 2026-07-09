import { randomInt } from 'crypto'

// Generate a cryptographically-secure 6-digit verification code.
// Uses crypto.randomInt (CSPRNG) rather than Math.random, whose internal
// state can be recovered from observed outputs, making codes predictable.
export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000))
}

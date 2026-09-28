// PawLL Gives Back — 1% pledge math + donation-record validation.
// One place owns what "1% of every order" means so the storefront page,
// the admin dashboard, and the tests can't drift apart.
// Money moves through here in integer cents to avoid Float drift when
// summing many orders.

import { z } from 'zod'

export const DONATION_RATE = 0.01

// An order counts toward the pledge once it has actually been paid and hasn't
// been cancelled. 'cancellation_requested' still counts — if the request is
// approved the status flips to 'cancelled' and the order drops out on its own.
// 'pending' never counts: the Stripe webhook is the source of truth for paid.
export const PLEDGE_ELIGIBLE_STATUSES = [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancellation_requested',
] as const

export interface PledgeOrder {
  subtotal: number
  discountAmount: number
}

// Merchandise value the customer actually paid, in cents. Discounts come off
// first (a $50 cart with a $10 code contributed $40 of sales); shipping and
// tax never count.
export function orderPledgeBaseCents(order: PledgeOrder): number {
  const base = order.subtotal - (order.discountAmount || 0)
  return Math.max(0, Math.round(base * 100))
}

// One order's 1%, rounded to the nearest cent.
export function orderPledgeCents(order: PledgeOrder): number {
  return Math.round(orderPledgeBaseCents(order) * DONATION_RATE)
}

export function calcPledgeCents(orders: PledgeOrder[]): number {
  return orders.reduce((sum, order) => sum + orderPledgeCents(order), 0)
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

// Validation for admin-entered donation records (POST full, PATCH partial).
// Empty strings from form inputs become null so optional columns stay clean;
// undefined stays undefined so a PATCH that omits a field doesn't wipe it.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === undefined ? undefined : v || null))

export const donationInputSchema = z.object({
  organization: z.string().trim().min(1, 'Organization is required').max(200),
  amount: z.number().positive('Amount must be greater than 0').max(1_000_000),
  donatedAt: z.coerce.date(),
  note: optionalText(2000),
  link: optionalText(500).refine(
    (v) => v == null || /^https?:\/\//.test(v),
    'Link must start with http(s)://',
  ),
  imageUrl: optionalText(1000),
})

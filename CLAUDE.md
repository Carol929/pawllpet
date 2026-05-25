# CLAUDE.md — PawLL Codebase Guide

Context for AI agents (and humans) working on this repo. Read this before making changes.

## Project Overview

PawLL is a US-domestic ecommerce site for pet products (toys, apparel, leashes). The brand is `pawllpet.com`. Origin warehouse: Arlington, VA 22202.

- **Framework**: Next.js 14 (App Router, Server Components by default)
- **Database**: Postgres on Supabase, accessed via Prisma
- **Auth**: NextAuth v5 beta + custom email/password routes
- **Payments**: Stripe Checkout (US only, USD)
- **Email**: Resend
- **Hosting**: Vercel (production = `main`, preview = `dev` and feature branches)

## Architecture Map

```
app/
  (routes)              # storefront pages (home, shop, product, cart, checkout, account, blog, policies, rewards)
  admin/                # admin dashboard (products, orders, customers)
  api/
    auth/               # auth API (register, login, logout, verify-email, resend-verification, [...nextauth])
    checkout/           # creates Stripe checkout session
    webhook/stripe/     # handles checkout.session.completed, refunds, cancellations
    orders/             # customer order endpoints
    admin/              # admin-only endpoints (guarded by auth check)
components/             # shared UI (Header, Footer, HeroCarousel, etc.)
lib/
  prisma.ts             # Prisma singleton (use this, not new PrismaClient)
  db.ts                 # re-exports prisma for convenience
  auth.ts               # NextAuth config
  email.ts              # Resend wrappers — sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, etc.
  shipping-rates.ts     # legacy hardcoded shipping cost table (being replaced by lib/shipping/)
  cart-context.tsx      # localStorage-backed cart React Context
  i18n.tsx              # i18n strings (English-only for now)
  tax-rates.ts          # US state tax lookup
prisma/
  schema.prisma         # Order, OrderItem, Product, User, etc.
  seed.ts               # admin + sample data
```

## Key Conventions

- **TypeScript strict mode** — no `any` without a comment explaining why.
- **Tailwind CSS** for styling. No CSS-in-JS libs.
- **Server Components first** — mark client components with `'use client'` only when needed (state, effects, browser APIs).
- **Server Actions or API routes** for mutations. Validate input with [Zod](https://zod.dev/).
- **Prisma**: import from `lib/prisma.ts` (the singleton). Never `new PrismaClient()` in route files.
- **Auth API routes** explicitly set `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'` — see existing routes for the pattern (required for Vercel build to not statically evaluate them).
- **Pricing/money** stored as `Float` in Prisma (USD). When passing to Stripe, multiply by 100 for cents.
- **Weight** is in pounds (lbs). Dimensions (when added) are in inches.

## Testing

- [vitest](https://vitest.dev/) for unit tests. Run: `npm test`, watch: `npm run test:watch`.
- Test files: `__tests__/*.test.ts` or `*.test.ts` next to source.
- **Mock all external APIs** (Stripe, Resend, Shippo, OAuth) — see `cart-logic.test.ts` for the patterns we use.
- No E2E framework yet. Manual verification via local dev server + Stripe test mode.

## Do Not

- **Don't add Husky / lint-staged / commitlint** — the team is small, CI catches what matters, and pre-commit hooks slow down iteration.
- **Don't introduce a state-management library** (Redux, Zustand, Jotai) — React Context + Server Components are sufficient for the current scope. Discuss before adding one.
- **Don't bypass branch protection** on `main` or `dev`.
- **Don't commit secrets.** `.env.example` is for placeholders only. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the known-leak history.
- **Don't hit live external services in tests.** Always mock.
- **Don't use `git add -A` or `git add .`** when committing — there are untracked Claude worktree directories and reports that shouldn't enter history. Add specific files.

## Domain Quirks

- **US-domestic only**. Origin is Arlington, VA 22202. No international shipping, no multi-currency. Customer-language is English (the codebase has a Chinese-speaking maintainer but the product ships English UI).
- **Shipping**: currently a hardcoded weight-tier table in [lib/shipping-rates.ts](./lib/shipping-rates.ts). AK, HI, PO Box, APO/FPO are rejected. Being replaced by a Shippo integration on the `feature/shippo` branch — once live, those restrictions get lifted (USPS can serve all of them).
- **`Order.shippingAddress`** is a JSON column, not a relation. Don't try to query nested fields with Prisma.
- **`Product.weight`** is optional. Checkout flags any cart item missing weight via `hasUnweighedItems()` and refuses to proceed — see [lib/shipping-rates.ts](./lib/shipping-rates.ts).
- **Product variants** are stored as JSON on Product, not as separate rows. The `variantIndex` in cart items is the position in that JSON array.
- **Stripe webhook** at [app/api/webhook/stripe/route.ts](./app/api/webhook/stripe/route.ts) is the source of truth for "order paid" — the API route that creates the order only creates a `pending` record.
- **Cart state** is in localStorage via [lib/cart-context.tsx](./lib/cart-context.tsx). User accounts don't persist carts server-side (yet).

## Branching

See [CONTRIBUTING.md](./CONTRIBUTING.md). Short version: `feature/* → dev → main`.

## When in Doubt

- Read the linked file. Don't guess.
- Prefer editing existing code over adding new abstractions.
- Match the existing code style — no semicolons, single quotes, trailing commas (enforced by Prettier).
- Small, focused PRs. One concern per PR.

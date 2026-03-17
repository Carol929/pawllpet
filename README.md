# PawLL Pet Ecommerce Platform

PawLL Pet is a Next.js + Prisma ecommerce foundation that preserves the existing PawLL brand style/logo while expanding to modern ecommerce architecture.

## What exists now
- Branded storefront route architecture: home, shop, product, collections, blog, policies, rewards, account, and admin shells.
- Custom auth APIs (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`) with Prisma-backed user auth.
- Prisma seed bootstrap with admin + sample customers.

## Vercel build fix (auth/prisma)
The build failure came from auth routes being evaluated in static/build contexts and Prisma/auth code not being explicitly runtime-scoped.

Applied fixes:
- Auth API routes now explicitly set:
  - `export const runtime = "nodejs"`
  - `export const dynamic = "force-dynamic"`
- Added production-safe Prisma singleton in `lib/prisma.ts` and re-export from `lib/db.ts`.
- Added package scripts:
  - `postinstall`: `prisma generate`
  - `vercel-build`: `prisma generate && next build`

## Branding updates
- Preserved existing PawLL logo asset and used it in header/footer.
- Added clickable social links:
  - TikTok: https://www.tiktok.com/@pawllpet?is_from_webapp=1&sender_device=pc
  - Instagram: https://www.instagram.com/pawllpet?igsh=Y3B5aXl5eXN2M2Nx&utm_source=qr

## Required environment variables (Vercel)
```bash
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

## Local development
PawLL Pet is a Next.js + Prisma ecommerce foundation for premium pet commerce, with storefront merchandising, account/self-service architecture, loyalty scaffolding, and admin operations shells.

## Repo audit summary
The starting codebase included a simple homepage and custom auth APIs. This iteration upgrades architecture toward a production-grade ecommerce platform with:
- Expanded Prisma domain models (catalog, ordering, aftersales, loyalty, CMS, support, settings)
- 30+ seeded products and core operation entities
- Full route architecture for storefront, account, support, and admin
- Updated docs + environment contract

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Custom JWT auth APIs (existing) with schema compatibility for Auth.js tables
- Zod validation (in auth APIs)

## Key routes
- Storefront: `/`, `/shop`, `/products/[slug]`, `/collections/[slug]`, `/new-arrivals`, `/best-sellers`, `/limited-drops`, `/bundles`, `/mystery-boxes`, `/search`
- Content + trust: `/about`, `/faq`, `/shipping-policy`, `/returns-policy`, `/contact`, `/blog`, `/blog/[slug]`, `/store-locator`
- Engagement + service: `/pet-quiz`, `/rewards`, `/track-order`, `/help-center`, `/shop-by-pet`, `/shop-by-need`
- User/admin architecture: `/account`, `/cart`, `/admin`, `/admin/products`, `/admin/orders`, `/admin/content`

## Environment variables
Copy `.env.example` into `.env.local` and fill values.

## Local setup
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Build checks
```bash
npm run lint
npm run db:generate
npm run build
```

## Redeploy steps (Vercel)
1. Pull latest commit.
2. Set env vars above in Vercel project settings.
3. Ensure build command is `npm run vercel-build` (or keep default with `postinstall`).
4. Trigger a new deploy.


## Troubleshooting: `404 NOT_FOUND` on custom domain
If Vercel shows a platform-level `404: NOT_FOUND` page (with an ID from Vercel), it usually means the domain is not currently pointing at a successful production deployment alias, rather than a Next.js route-level 404.

Checklist:
1. Open **Deployments** and confirm at least one recent **Production** deployment is `Ready`.
2. In **Project Settings → Domains**, confirm `pawllpet.com` and `www.pawllpet.com` are attached to this exact project.
3. Confirm build command is `npm run vercel-build` (also pinned in `vercel.json`).
4. Verify Production env vars are set (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
5. Click **Redeploy** the latest commit and then click **Refresh** on domain entries.
6. If Preview still fails while local and `npm run vercel-build` pass, set **Node.js Version** in Vercel project settings to **20.x** (this repo pins `engines.node` and `.nvmrc` to 20).

Useful smoke checks after deploy:
- `https://pawllpet.com/`
- `https://pawllpet.com/api/auth/me` (should return JSON 401 when not logged in, not platform 404)
```

## Build checks
```bash
npm run lint
npm run db:generate
npm run build
```

## Redeploy steps (Vercel)
1. Pull latest commit.
2. Set env vars above in Vercel project settings.
3. Ensure build command is `npm run vercel-build` (or keep default with `postinstall`).
4. Trigger a new deploy.


## Troubleshooting: `404 NOT_FOUND` on custom domain
If Vercel shows a platform-level `404: NOT_FOUND` page (with an ID from Vercel), it usually means the domain is not currently pointing at a successful production deployment alias, rather than a Next.js route-level 404.

Checklist:
1. Open **Deployments** and confirm at least one recent **Production** deployment is `Ready`.
2. In **Project Settings → Domains**, confirm `pawllpet.com` and `www.pawllpet.com` are attached to this exact project.
3. Confirm build command is `npm run vercel-build` (also pinned in `vercel.json`).
4. Verify Production env vars are set (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
5. Click **Redeploy** the latest commit and then click **Refresh** on domain entries.

Useful smoke checks after deploy:
- `https://pawllpet.com/`
- `https://pawllpet.com/api/auth/me` (should return JSON 401 when not logged in, not platform 404)
## Commands
```bash
npm run lint
npm run build
npm run db:studio
```

## Deployment (Vercel)
1. Push to Git provider and import project in Vercel.
2. Provision PostgreSQL and set `DATABASE_URL`.
3. Set all env vars from `.env.example`.
4. Run build command `npm run build` and start command `npm run start`.
5. Execute migrations/seed in production workflow (without default admin password).

## Notes
- Brand identity is original to PawLL Pet and intentionally avoids third-party IP/trade dress.
- This version prioritizes architecture completeness and scalable scaffolding; payments/notifications can now be wired to Stripe/Resend via existing models and env contract.

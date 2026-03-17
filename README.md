# PawLL Pet Ecommerce Platform

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

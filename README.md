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

Useful smoke checks after deploy:
- `https://pawllpet.com/`
- `https://pawllpet.com/api/auth/me` (should return JSON 401 when not logged in, not platform 404)

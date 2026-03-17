# PawLL Pet Implementation Plan

## 1) Audit & preserve
- Preserve PawLL logo (`/logo.svg`) and existing warm playful style.
- Keep current navigation rhythm and card/button language; extend instead of redesign.

## 2) Build reliability + auth hardening
- Ensure all Prisma-backed auth routes run in Node runtime and are force-dynamic.
- Keep Prisma usage inside request handlers only.
- Standardize a production-safe Prisma singleton (`lib/prisma.ts`).
- Add Vercel-safe Prisma generation scripts.

## 3) Brand fixes requested
- Keep existing logo placement and reintroduce logo in nav/footer.
- Add external social links (TikTok/Instagram) in footer.

## 4) Commerce architecture continuation
- Maintain existing storefront route map for shop/discovery/PDP/account/admin architecture.
- Keep data/content scaffolding while avoiding dead links for core navigation.

## 5) Validation
- Run lint + Prisma generation + production build before commit.

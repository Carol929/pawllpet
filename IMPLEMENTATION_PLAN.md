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
## Audit snapshot
- Existing repo had a basic Next.js storefront, custom JWT auth endpoints, and minimal Prisma auth schema.
- Gaps: no modern ecommerce IA, no comprehensive data model, limited merchandising flows, no admin route architecture, and docs not aligned to launch scope.

## Vertical slices
1. **Foundation and guardrails**
   - Add AGENTS.md standards.
   - Refresh docs and environment contract.
2. **Commerce data platform**
   - Expand Prisma schema for catalog, cart, orders, aftersales, loyalty, CMS, and admin audit entities.
   - Seed realistic starter catalog and operations data.
3. **Storefront architecture**
   - Build homepage merchandising rhythm and core route map (shop, drops, bundles, mystery boxes, PDP, collections, policies, blog).
   - Add search/filter parameters on shop page.
4. **Customer/account architecture**
   - Add account, cart, track-order, rewards, help center, quiz, and shop-by-* entry-point pages.
5. **Admin architecture**
   - Add dashboard shells for product/order/content ops.
6. **Stabilize and document**
   - Lint + build validation.
   - Update README with setup, route map, env vars, and deployment guidance.

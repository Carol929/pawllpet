# PawLL Pet Implementation Plan

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

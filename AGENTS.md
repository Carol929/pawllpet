# PawLL Pet Agent Instructions

## Scope
These instructions apply to the entire repository.

## Product direction
- Keep the brand original to PawLL Pet.
- Do not copy third-party trademarks, mascots, product names, copyrighted copy, or proprietary visual identities.
- Prioritize production-ready architecture and complete user flows over throwaway demos.

## Engineering standards
- Use TypeScript for app code and Prisma for data modeling.
- Prefer reusable utilities and shared data modules over duplicated literals.
- Ensure all new pages have meaningful loading/empty states when data may be absent.
- Keep routes coherent and linked from navigation/footer when they are key storefront flows.

## Documentation
- Keep `README.md` and `IMPLEMENTATION_PLAN.md` synchronized with what is actually implemented.
- Document required environment variables in `.env.example` style docs.

## Validation
- Run lint at minimum after modifications.
- If adding tests, run them and report outcomes.

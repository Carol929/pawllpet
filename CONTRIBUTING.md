# Contributing to PawLL

Welcome! This guide walks you through getting the project running locally and the workflow we use for changes.

## Quick Start

```bash
git clone https://github.com/Carol929/pawllpet.git
cd pawllpet
cp .env.example .env       # fill in real values — ask Carol for shared secrets
npm install
npm run db:push            # apply schema to your dev database
npm run db:seed            # optional: seed admin + sample data
npm run dev                # http://localhost:3000
```

You should be running on Node 20.x (pinned in `package.json` `engines.node`).

## Branch Workflow

```
main (production, deployed to pawllpet.com)
 └── dev (staging, Vercel preview)
      └── feature/<short-name>     ← your work goes here
```

- **`main`** is production. Never commit directly. Only merge from `dev` after validation.
- **`dev`** is staging. Feature PRs target `dev` first. Vercel auto-deploys a preview.
- **`feature/<name>`** is where you build. Branch off `dev`, push, open a PR back to `dev`.
- **`fix/<name>`** for bug fixes. Same flow.
- **`chore/<name>`** for tooling / deps / config.
- **Hotfixes** to production: branch off `main`, PR to `main`, then back-merge into `dev`.

### Example flow

```bash
git checkout dev
git pull origin dev
git switch -c feature/cart-empty-state
# ... work, commit ...
git push -u origin feature/cart-empty-state
gh pr create --base dev      # or open via GitHub UI
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) loosely. Not enforced, but please use these prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling, deps, internal
- `refactor:` — restructure, no behavior change
- `docs:` — docs only
- `test:` — tests only

One-line subject under 70 chars. Add a body if the why isn't obvious.

## PR Process

1. Open PR with the template filled out (`.github/pull_request_template.md` populates automatically).
2. CI runs: lint, typecheck, test. Must be green before merge.
3. At least 1 approval required on `main`. `dev` allows self-merge.
4. Squash-merge to keep history clean.
5. Delete the branch after merge.

## Local Commands

```bash
npm run dev              # start dev server
npm run lint             # ESLint
npx tsc --noEmit         # typecheck
npm test                 # vitest run
npm run test:watch       # vitest watch mode
npm run test:coverage    # coverage report
npm run format           # prettier write
npm run format:check     # prettier check (CI doesn't run this yet, but local is good)
npm run db:push          # push schema changes (dev only)
npm run db:migrate       # create migration
npm run db:seed          # seed sample data
npm run db:studio        # open Prisma Studio
```

## Environment Variables

- `.env.example` shows every variable the app reads, with **placeholder** values only.
- Real secrets live in:
  - Local `.env` (gitignored) — ask Carol or the admin in Vercel
  - Vercel Project Settings → Environment Variables (separately for Production and Preview)
- **Never commit `.env` or real keys.** PRs that contain real secrets will be rejected.

> ⚠️ **Known issue**: an older version of `.env.example` previously contained a real Resend API key that is now in git history. We plan to rotate it; until then, do not reuse keys you find in history. If you ever find a real secret in this repo, flag it to Carol immediately.

## Database Changes

Schema changes go through Prisma migrations:

```bash
# Edit prisma/schema.prisma
npm run db:migrate -- --name short_description_of_change
# Commit BOTH the schema change AND the generated migration file
```

Reviewers should run `npm run db:push` (or the migration) on their own dev DB before testing.

## Tests

- We use [vitest](https://vitest.dev/) with jsdom for component tests and Node env for utility tests.
- Test files live next to the code: `__tests__/*.test.ts` or alongside the file.
- **Mock external APIs** (Stripe, Resend, Shippo, OAuth providers) — never hit live services in tests.
- Aim to cover at least the happy path and one edge case for new code.

## Architecture Notes

See [CLAUDE.md](./CLAUDE.md) for a tour of the codebase, conventions, and gotchas. (It's written for AI agents but humans benefit too.)

## Questions

Ping Carol on whatever channel you usually use, or open a draft PR with a question in the description.

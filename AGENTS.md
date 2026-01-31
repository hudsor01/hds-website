# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router pages, layouts, and API routes.
- `src/components/`: UI building blocks (`layout/`, `forms/`, `ui/`, feature folders).
- `src/lib/`, `src/types/`, `src/hooks/`: shared utilities, types, and hooks.
- `public/`: static assets.
- `scripts/`: maintenance tasks (sitemap, env validation, image optimization).
- `tests/`: Bun unit tests and helpers.
- `e2e/`: Playwright end-to-end specs.
- `docs/`: project documentation.

## Build, Test, and Development Commands
Use Bun (see `package.json` and `bun.lock`):
- `bun run dev`: local dev server.
- `bun run build`: production build.
- `bun run start`: run the built app.
- `bun run lint`: ESLint checks.
- `bun run typecheck`: TypeScript check.
- `bun run test:unit`: Bun unit tests.
- `bun run test:e2e`: Playwright E2E tests (all browsers).
- `bun run test:e2e:fast`: quick E2E run (chromium only).
- `bun run generate-sitemap`: regenerate sitemap.
- `bun run env:setup`: create `.env.local` from template.

## Coding Style & Architecture Rules
- No emojis in repo content unless explicitly requested.
- Formatting: Prettier uses tabs (width 2), single quotes, no semicolons.
- TypeScript is strict; avoid `any`, validate inputs with Zod `safeParse`.
- Server Components by default; add `"use client"` only for hooks, events, or browser APIs.
- Simplicity first (YAGNI), composition over inheritance, single responsibility per module.
- Use `src/lib/logger` instead of `console.*`.
- Tailwind-first styling; prefer semantic utilities and CSS custom properties.

## Testing Guidelines
- Unit tests live in `tests/` and use Bun’s test runner; name files `*.test.ts` or `*.test.tsx`.
- E2E tests live in `e2e/` and use Playwright; name files `*.spec.ts`.
- Ensure validation schemas and critical user flows have coverage.

## Commit & Pull Request Guidelines
- Conventional Commits with optional scope (e.g., `fix(admin): ...`).
- Subject line under 50 chars, followed by a blank line and bullet points explaining why.
- Lefthook runs lint, typecheck, and unit tests on commit/push.
- PRs should include a clear summary, testing notes, and screenshots for UI changes.

## Security & Configuration
- Use `.env.local` (from `.env.example`) for local secrets.
- Required: `RESEND_API_KEY` for email. Optional: `CSRF_SECRET`, `CRON_SECRET`, `DATABASE_URL`, and `NEON_AUTH_BASE_URL`.

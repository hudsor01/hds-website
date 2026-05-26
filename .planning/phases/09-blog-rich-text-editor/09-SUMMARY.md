# Phase 09 — Blog rich-text editor — SUMMARY

**Date completed:** 2026-05-26
**Branch:** `blog-rich-text-editor`
**Milestone:** v5 — Admin hardening + content authoring
**Status:** Complete (3 commits + this metadata commit)
**Spec:** `.planning/phases/09-blog-rich-text-editor/09-CONTEXT.md`

## One-liner

Replaced the plain `<textarea>` for `blog_posts.content` on `/admin/blog/new` and `/admin/blog/[id]/edit` with a Tiptap-based rich-text editor (StarterKit + Link + Image). HTML output is a strict subset of the existing `sanitize-html` allowedTags on `BlogPostContent.tsx`, so storage + public render are untouched.

## Commits

| # | SHA | Type | Description |
|---|-----|------|-------------|
| 1 | `c678508` | feat | add Tiptap dependencies (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/pm`) |
| 2 | `ba4858f` | feat | `RichTextEditor.tsx` + `rich-text-editor-tags.ts` (round-trip guard helper) + `tests/unit/rich-text-editor.test.ts` (3 cases) |
| 3 | `2b13731` | feat | wire `RichTextEditor` into `CreateBlogForm` and `EditBlogForm`; correct hint copy from `Markdown` to `Rich text` |

## Files added

- `src/components/admin/RichTextEditor.tsx` — `'use client'` Tiptap component. Toolbar buttons: bold, italic, h1-h3, bullet list, ordered list, blockquote, inline code, code block, link (window.prompt), image (window.prompt), undo, redo, clear formatting. SSR-safe via `immediatelyRender: false` plus a pre-init `aria-busy` shell. ARIA attributes (`id`, `aria-describedby`, `aria-invalid`) are stitched onto the actual contenteditable via Tiptap's `editorProps.attributes` seam. Editor scope styling is inline Tailwind utilities (no global `@utility`) to avoid bleed.
- `src/components/admin/rich-text-editor-tags.ts` — pure helper `isWithinAllowedHtmlTags(html, allowed)` + `ALLOWED_HTML_TAGS` const that mirrors the sanitize-html allowedTags list in `BlogPostContent.tsx`. Acts as the round-trip contract guard.
- `tests/unit/rich-text-editor.test.ts` — 3 cases: allowed tags pass, disallowed tags fail, allowlist covers StarterKit + Link + Image output.

## Files modified

- `src/app/(admin)/admin/blog/new/CreateBlogForm.tsx` — added `RichTextEditor` import, replaced the content `<textarea>` block with `<RichTextEditor>`, dropped the now-unused `CODE_TEXTAREA_CLASS` const, and changed the FormFieldSet hint from `Markdown` to `Rich text`.
- `src/app/(admin)/admin/blog/[id]/edit/EditBlogForm.tsx` — identical swap on the edit form.
- `package.json` + `bun.lock` — Tiptap deps (commit 1).

## Files NOT touched (hard-constraint guard)

`git diff origin/main` is empty for all of:

- `src/components/blog/BlogPostContent.tsx` (public render path)
- `src/lib/schemas/blog.ts`
- `src/lib/admin/blog-queries.ts`
- `src/lib/auth/admin.ts`
- `proxy.ts`
- `src/app/api/**`

Phase 06 / 07 / 08 outputs functionally unchanged (no files moved, no shared helpers altered).

## Gate results

| Gate | Result |
|------|--------|
| `bun run lint` | exit 0 |
| `bun run typecheck` | exit 0 |
| `bun run test:unit` | 581 pass / 0 fail (baseline 578 + 3 new cases) |
| `bun run build` | exit 0; 199 static pages generated |
| Em / en-dash sweep on changed files | zero matches |
| Protected-file diff vs `origin/main` | empty for `BlogPostContent.tsx`, `schemas/blog.ts`, `admin/blog-queries.ts`, `auth/admin.ts`, `proxy.ts`, `src/app/api/**` |
| `console.*` / `process.env.X` / `any` in new code | none |
| Lefthook pre-commit hooks | green on all 3 commits |

## Round-trip contract

Editor produces (via Tiptap StarterKit + Link + Image): `p, h1, h2, h3, strong, em, ul, ol, li, blockquote, code, pre, br, a, img`.

Sanitizer accepts (per `BlogPostContent.tsx` SANITIZE_OPTIONS): `p, h1, h2, h3, h4, h5, h6, strong, em, u, a, ul, ol, li, blockquote, code, pre, br, img`.

Editor output is a strict subset; nothing the operator types in the editor is stripped on render. Unit test in `tests/unit/rich-text-editor.test.ts` guards this invariant: if a future Tiptap upgrade or new extension widens the produced-tag set, the allowlist alignment test fails before reaching production.

## Operator smoke checklist (deferred to operator pre-PR)

1. Sign in to `/admin/blog/new`. Verify the content field renders the editor toolbar (bold, italic, h1-h3, lists, link, image, undo). Type a heading, a paragraph, a list. Add a link via the toolbar (paste a URL into the prompt).
2. Submit the form. Navigate to the public `/blog/[your-slug]` page. Confirm the content renders matching what you typed in the editor (headings styled, list rendered, link clickable). The existing `.typography` class from `BlogPostContent` styles the rendered HTML.
3. Edit the post via `/admin/blog/[id]/edit`. Confirm the editor initializes with the previously-submitted HTML preserved. Make a small change, save, verify the change persists on the public page.

## Deviations from plan

None substantive. Two minor in-task cleanups:

- Removed the now-unused `CODE_TEXTAREA_CLASS` const from both blog forms (Rule 3 — would have tripped Biome's unused-variable lint inside the same commit that did the swap).
- Biome auto-formatted import sort + a long-line wrap in `RichTextEditor.tsx` and `tests/unit/rich-text-editor.test.ts` during `lint:fix`; no functional impact.

Commit 1 (`c678508`) was already present from an earlier execution attempt on this branch — `bun add` was a no-op (deps already pinned at 3.23.6), so the existing commit was kept as-is rather than amended.

## Self-Check

- `src/components/admin/RichTextEditor.tsx`: FOUND
- `src/components/admin/rich-text-editor-tags.ts`: FOUND
- `tests/unit/rich-text-editor.test.ts`: FOUND
- Commit `c678508` (Tiptap deps): FOUND
- Commit `ba4858f` (RichTextEditor + tests): FOUND
- Commit `2b13731` (wire into forms): FOUND
- `bun run lint`, `bun run typecheck`, `bun run test:unit`, `bun run build`: all green

## Self-Check: PASSED

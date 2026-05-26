# Phase 09 — Blog rich-text editor

**Date:** 2026-05-26
**Branch:** `blog-rich-text-editor`
**Milestone:** v5 — Admin hardening + content authoring
**Scope:** Replace the plain `<textarea>` for `blog_posts.content` in the two blog admin forms with a Tiptap-based rich-text editor. Editor outputs HTML matching the existing render pipeline's `sanitize-html` allowed-tag set, so storage and read paths are untouched. Per-form integration only; no schema migration, no public-route change.

## 1. Goal

After this phase, the operator authors blog posts in a real WYSIWYG editor (bold/italic/headings/lists/links/blockquotes/code blocks/images) instead of hand-typing HTML or wrestling with Markdown the renderer doesn't actually parse. The form still submits `content` as a string of HTML; the existing `BlogPostContent` component still sanitizes and renders it via React's raw-HTML escape hatch (with `sanitize-html` as defense in depth). Round-trip is symmetric: anything the editor produces, the renderer accepts; anything the renderer would strip, the editor doesn't produce.

Visible value: massive (currently the textarea hint says "Markdown" but the renderer expects HTML — the editor surface was effectively broken for non-technical operators). Architectural value: removes a misleading affordance and aligns the input surface with the actual storage format.

## 2. Non-goals

- **No backend / schema change.** `blog_posts.content` stays `text`. The Server Action submission contract is unchanged: `content: string` of HTML.
- **No change to `src/components/blog/BlogPostContent.tsx`.** The public render path keeps `sanitize-html` + its raw-HTML render escape hatch. Editor output is constrained to be a strict subset of what the sanitizer allows, so round-trip is lossless.
- **No collaborative editing, no real-time sync, no version history.** Single-author single-session editor; the Server Action submit is the only persistence boundary.
- **No code-syntax highlighting in the editor.** A code block renders as a monospace `<pre><code>` — what the public render also produces. Syntax highlighting on the read side is a future concern (deferred).
- **No image alt-text editing in the editor.** Inserted images get an empty `alt` by default; operator can paste the URL via a prompt that asks for `src` only (alt defaults to filename or empty). Inline alt-text editing requires a dedicated image-properties modal that's overkill for this phase.
- **No inline image upload via Phase 08's `ImageUploadField`.** The image button in the editor accepts a URL (paste/type). Wiring the editor's image-insert flow to the Vercel Blob upload pipeline is a Phase 11+ concern (clean integration requires either a token-issue dance or a custom upload command).
- **No tables.** Tiptap's table extension is optional and not aligned with the existing `BlogPostContent` allowedTags list (which excludes `table`, `thead`, `tbody`, `tr`, `td`). Adding tables requires expanding the sanitizer allowlist too. Defer.
- **No removal of the `<textarea>` from any other admin form.** Only the blog `content` field gets the editor. Excerpt stays a textarea (single-paragraph plain text).
- **No CSS prose typography change.** The existing `.typography` class on `BlogPostContent` already styles the rendered HTML; the editor styles the in-editor view independently.

## 3. Editor choice (locked)

**Tiptap** (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-image`). Rationale:

- **HTML-native output.** `editor.getHTML()` matches the existing `BlogPostContent` consumer with no transform. MDXEditor would have forced a markdown→HTML migration on the read side; Tiptap is a drop-in.
- **Extension set aligns with `sanitize-html` allowedTags.** Default StarterKit produces: `p`, `h1`-`h3`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`, `code`, `pre`, `br`. Adding the link + image extensions completes the match with the existing allowlist (`p, h1-h6, strong, em, u, a, ul, ol, li, blockquote, code, pre, br, img`). The only allowlist entries the editor won't produce are `h4`-`h6` (StarterKit's Heading extension can be configured to enable them, but operator practice is h1-h3; defer) and `u` (underline; not in starter-kit, can be added if anyone requests it).
- **Industry-standard, well-maintained.** ProseMirror underneath. Active development, large extension ecosystem. Used by Vercel, GitHub Issues, Notion-style apps.
- **Bundle cost is acceptable.** Tiptap + StarterKit + Link + Image is ~80kb gzipped, only loaded on `/admin/blog/{new,[id]/edit}` (two admin-only routes). Public bundle untouched.

## 4. File-level changes

### New files

- `src/components/admin/RichTextEditor.tsx` — `'use client'`. Controlled component:
  - Props: `value: string` (HTML), `onChange: (html: string) => void`, `ariaDescribedby?: string`, `ariaInvalid?: 'true' | undefined`, `id?: string`
  - Toolbar: bold, italic, h1, h2, h3, bullet list, ordered list, blockquote, code, code block, link (with prompt for URL), image (with prompt for URL), undo, redo
  - Active-state styling on toolbar buttons (matches editor selection state)
  - Min height matches the existing 18-row textarea (~432px); editor area scrolls within bounds for very long posts
  - Sets `aria-busy` semantics on a wrapping container during initialization; editor itself renders a `[contenteditable]` div which Tiptap manages
  - Bridges `useEditor`'s `onUpdate` to call props.onChange with `editor.getHTML()` so the parent form keeps the value in state
  - **Hydration safety:** wrap the editor mount in `useEffect` (or `immediatelyRender: false` per Tiptap's SSR guidance) so React 19 + Next.js 16 don't hydrate-mismatch on first paint
- `src/components/admin/RichTextEditor.module.css` (or inline tailwind, decide during build): styles for the toolbar + editable area. Use existing OKLCH tokens.
- `tests/unit/rich-text-editor.test.ts` — bun:test cases:
  - Editor renders with initial HTML value
  - onChange fires when content updates
  - Toolbar bold/italic buttons toggle marks
  - Tiptap output stays within the `sanitize-html` allowedTags set (defensive; if Tiptap ever adds a new HTML tag in a future major, this test fails before prod)

### Modified files

- `src/app/(admin)/admin/blog/new/CreateBlogForm.tsx` — swap the content `<textarea>` for `<RichTextEditor>`. Update the field hint from "Markdown" to "Rich text (HTML)". Submit path unchanged (content stays a string of HTML in the FormData).
- `src/app/(admin)/admin/blog/[id]/edit/EditBlogForm.tsx` — same swap. Editor initializes with the existing `content` value loaded from the post.
- `package.json` — add `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`.
- `.planning/STATE.md` and `.planning/ROADMAP.md` — phase status after the phase ships.

### Deleted files

None.

## 5. Constraints (do not violate)

- All project conventions in `/CLAUDE.md`. Highlights: NO em/en-dashes in user-facing strings (toolbar tooltip text, hint text, prompt copy), NO emojis, server-first by default (editor is client by necessity), Logger not `console.*`, Zod `safeParse`, env via `@/env`.
- `src/lib/auth/admin.ts` (Bearer cron guard) byte-equal to `origin/main`.
- `proxy.ts` byte-equal.
- All `src/app/api/**` byte-equal — no new API route.
- Phase 02-08 admin / auth / chrome / logger files functionally unchanged.
- `src/components/blog/BlogPostContent.tsx` byte-equal to `origin/main`. The public render path is the load-bearing contract — Phase 09 only changes the input side.
- `src/lib/schemas/blog.ts` byte-equal — the `content text` column stays as-is.
- `src/lib/admin/blog-queries.ts` byte-equal — read/write helpers don't care what's in the string.
- Editor output MUST be a subset of the `BlogPostContent` allowedTags. If a future extension produces a tag outside that list, the sanitizer strips it on render — but the editor would display it in the preview and the form would submit it, creating a silent diff between author intent and public output. The unit test in `tests/unit/rich-text-editor.test.ts` guards against this.

## 6. Verification

- `bun run lint && bun run typecheck && bun run build` exit 0
- `bun run test:unit` — pass count rises by however many `rich-text-editor.test.ts` adds (target ~4-6 cases)
- New blog post created via the rich-text editor renders correctly on the public `/blog/[slug]` page (operator smoke step pre-PR)
- Existing blog posts open in the edit form with their HTML loaded correctly into the editor (round-trip lossless)
- Em / en-dash sweep on changed files: zero
- `src/components/blog/BlogPostContent.tsx`, `src/lib/schemas/blog.ts`, `src/lib/admin/blog-queries.ts` all show `git diff origin/main` empty
- `src/lib/auth/admin.ts`, `proxy.ts`, `src/app/api/**` diff vs `origin/main` empty
- Bundle size delta on `/admin/blog/[id]/edit` route — log the before / after JS bundle size; Tiptap should add ~80kb gzipped to that route's chunk, zero impact on any non-admin route

## 7. Out of scope (deferred to future phases)

- Inline image upload via the editor's image button → Phase 08's Vercel Blob upload pipeline (Phase 11?)
- Code-block syntax highlighting on the public render side
- Inline image alt-text editing
- Tables (requires sanitizer allowlist extension)
- Embedded YouTube / Vimeo / Twitter
- Per-post custom CSS or scripts
- Mention / @-handles
- Collaborative editing
- Document version history

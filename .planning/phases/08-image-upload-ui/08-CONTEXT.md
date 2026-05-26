# Phase 08 — Image upload UI

**Date:** 2026-05-26
**Branch:** `image-uploads`
**Milestone:** v5 — Admin hardening + content authoring
**Scope:** Replace the paste-URL friction on the 6 admin form image fields with a real upload widget backed by Vercel Blob. Per-resource integration into showcase (3 fields: `imageUrl`, `ogImageUrl`, `galleryImages[]`), blog (1 field: `featureImage`), testimonials (1 field: `imageUrl`). Paste-URL stays as a fallback so the PR ships and works even before the operator wires `BLOB_READ_WRITE_TOKEN` to Vercel.

## 1. Goal

After this phase, the operator clicks "Upload" on any image field in any admin form, picks (or drag/drops) a file, and the resulting Vercel Blob URL drops into the field. Paste-URL still works for: external images the operator wants to reference rather than re-host, fields where Blob isn't configured yet, and quick edits where typing a URL is faster than file picker.

Visible value: high (removes the "where do I host this?" question every time an operator edits a showcase row). Architectural value: medium (one new isomorphic upload component reused across all 6 fields; one new API route; opens the door to Phase 09's rich-text editor inserting inline images from the same uploader).

## 2. Non-goals

- **No image transformation pipeline.** No resizing on upload, no format conversion, no automatic alt-text generation, no AI background removal. Operator uploads exactly the bytes they pick; Vercel's image optimization happens at render time via Next.js `<Image>` as it already does.
- **No image CDN beyond Vercel Blob.** Cloudflare R2, S3, Bunny, etc. are not in scope. Vercel Blob is the prime candidate because the deploy target is already Vercel and the SDK is one package.
- **No drag-into-rich-text uploader.** Inline image inserts inside the blog content textarea wait for Phase 09 (`blog-rich-text-editor`). Phase 08 only covers the per-field upload buttons on the existing forms.
- **No bulk upload.** The gallery field on showcase accepts files one at a time. Multi-file pickers can come later if real load justifies; the default `<input type="file">` already supports `multiple` but the UX of partial-success states isn't worth designing for the gallery's typical ~5-file use.
- **No client-side image preview before submit.** The upload completes synchronously (user clicks pick → upload fires → URL appears in the field), then the existing form submit takes over. No "review then commit" two-step.
- **No video upload.** The `testimonials.videoUrl` and `showcase.testimonialVideoUrl` fields stay as paste-URL only. Video adds size limits + format detection + thumbnail extraction that aren't justified by current usage.
- **No image deletion from Vercel Blob on form delete.** When the operator deletes a showcase row, the underlying Blob files persist (orphaned). Acceptable for now; the orphan-sweep job is a future ops phase. Deleting an uploaded file mid-edit (operator chose A, then changed mind to B) does leave A orphaned — same trade-off.

## 3. Pattern (locked)

**Vercel Blob client-direct upload.** The recommended pattern per Vercel docs: client component requests a one-shot upload token from our server (admin-session-protected); browser PUTs directly to Vercel Blob's edge endpoint with that token; server returns the public URL on completion. Avoids streaming the file through our Next.js server (large files, edge function memory limits).

**Token endpoint:** `POST /api/admin/images/upload-token`
- Body: `{ filename: string, contentType: string }`
- Auth: `requireAdminSession()` first
- MIME validation: must match `^image/(png|jpe?g|webp|gif|avif)$`
- Filename validation: extension matches MIME; sanitize to safe-chars
- Size: enforced by Vercel Blob via the `maximumSizeInBytes` field on the token (cap at 8 MB, matches Vercel's free-tier per-blob default)
- Returns: `{ clientToken: string, blobPath: string }` from `@vercel/blob/client::generateClientToken` (or whatever the current API surface is — verify in implementation against canonical docs)
- 503 if `BLOB_READ_WRITE_TOKEN` is unset (operator hasn't wired Vercel Blob yet); the client falls back to paste-URL.

**Upload component:** `src/components/admin/ImageUploadField.tsx`
- Client component. Single-image variant.
- Props: `name`, `value` (current URL or null), `onChange` (new URL), `htmlFor` (for label association), `accept` (optional, defaults to image MIMEs)
- Two side-by-side controls inside a `FormFieldSet`:
  - "Upload" button → opens file picker → on file selected → fetch token from API → upload to Blob → call `onChange(blobUrl)`
  - "URL" text input → existing paste-URL flow → call `onChange(input.value)` on blur
- Preview: if `value` is set, show a small thumbnail (Next.js `<Image>`) + a "Remove" button that calls `onChange(null)`
- Upload-in-flight state: button shows a spinner; the URL input is disabled
- Error state: failed uploads show a one-line error under the field (`Upload failed: <reason>`); the URL input stays available so the operator can paste-fallback
- If the API returns 503 (token not configured), the "Upload" button is hidden and the URL input is the only control

**Gallery variant:** `src/components/admin/ImageGalleryField.tsx`
- Client component. Array variant.
- Props: `name`, `values` (string[] of URLs), `onChange` (new string[])
- Renders the list of current URLs with per-row thumbnail + Remove button
- One "Upload" + one "URL" control at the bottom that appends to the list
- Reuses the same upload logic as the single variant via a shared hook (see §4)

**No new dependencies beyond `@vercel/blob`.** Drag/drop is native HTML5; file picker is `<input type="file">`. No react-dropzone, no react-uploady. The "drag-and-drop" affordance is a `<label>` with a dashed border that wraps the file input; the browser handles file dispatch.

## 4. File-level changes

### New files

- `src/lib/admin/blob-upload.ts` — `'server-only'`. Exports:
  - `isBlobConfigured(): boolean` — returns `!!env.BLOB_READ_WRITE_TOKEN`
  - `generateUploadToken({ filename, contentType }): Promise<{ clientToken, blobPath }>` — wraps `@vercel/blob/client.generateClientToken` (or current canonical API) with our MIME validation, filename sanitization, and 8 MB size cap. Throws on validation failure; caller maps to 400 response.
- `src/app/api/admin/images/upload-token/route.ts` — `POST` handler. `await requireAdminSession()`, Zod-validate body, call `generateUploadToken`, return `{ clientToken, blobPath }` or appropriate error status (400 invalid input, 503 not configured, 500 server error).
- `src/lib/schemas/admin-image-upload.ts` — Zod schema for the upload-token POST body.
- `src/components/admin/ImageUploadField.tsx` — single-image client component (per §3 spec).
- `src/components/admin/ImageGalleryField.tsx` — gallery client component (per §3 spec).
- `src/hooks/use-blob-upload.ts` — client hook factoring the token-fetch + browser-PUT logic shared by the two components.
- `tests/unit/admin-image-upload.test.ts` — bun:test cases for:
  - Token endpoint Zod validation (rejects bad MIME, bad filename, oversize hint)
  - `isBlobConfigured` toggle
  - Filename sanitization (path traversal, special chars)

### Modified files

- `src/env.ts` — add `BLOB_READ_WRITE_TOKEN: z.string().optional()` to server schema. Optional everywhere; the API route returns 503 when missing.
- `package.json` — add `@vercel/blob` dependency.
- `next.config.ts` — add `public.blob.vercel-storage.com` to `images.remotePatterns` so the `<Image>` previews render.
- 6 form files (Phase 06 paths):
  - `src/app/(admin)/admin/showcase/new/CreateShowcaseForm.tsx`: 3 fields (`imageUrl`, `ogImageUrl`, `galleryImages`) — swap the existing inputs for `<ImageUploadField>` (single, single, gallery)
  - `src/app/(admin)/admin/showcase/[id]/edit/EditShowcaseForm.tsx`: same 3 fields
  - `src/app/(admin)/admin/blog/new/CreateBlogForm.tsx`: 1 field (`featureImage`) — swap for `<ImageUploadField>` (single)
  - `src/app/(admin)/admin/blog/[id]/edit/EditBlogForm.tsx`: same 1 field
  - `src/app/(admin)/admin/testimonials/new/CreateTestimonialForm.tsx`: 1 field (`imageUrl`)
  - `src/app/(admin)/admin/testimonials/[id]/edit/EditTestimonialForm.tsx`: same 1 field
- `.planning/STATE.md` and `.planning/ROADMAP.md` — phase status updates after the phase ships.

### Deleted files

None.

## 5. Constraints (do not violate)

- All project conventions in `/CLAUDE.md`. Highlights: NO em/en-dashes in user-facing strings, server-first components except where browser APIs (file picker, fetch) are required, Logger not `console.*`, Zod `safeParse`, env via `@/env`, T3 env types.
- `src/lib/auth/admin.ts` (Bearer cron guard) stays byte-equal to `origin/main`.
- `proxy.ts` stays untouched. CORS / cache-control / UA blocklist already covers the new API route via the `/api/*` matcher; no per-route exception needed.
- All existing public-API surfaces (`src/app/api/auth/**`, `src/app/api/contact/**`, `src/app/api/newsletter/**`, `src/app/api/process-emails/**`, `src/app/api/blog/posts/**`) stay byte-equal.
- Phase 02-07 admin / auth / chrome / logger files stay functionally untouched (the form files in §4 are intentional edits; nothing else).
- New API route follows the existing admin-API pattern: same `requireAdminSession()` first, same Zod validation, same logger usage (now sink-redacted per Phase 07).
- Upload component is client-only; the field is rendered inside server-rendered form pages that already have the surrounding admin auth check. The token endpoint itself is server-only and gates on `requireAdminSession()` — defense in depth.

## 6. Operator step required after merge

Before the upload feature works in production OR local dev, the operator must:

1. Create a Vercel Blob store: Vercel dashboard → project → Storage → Create Database → Blob → name it `hds-images` (or similar).
2. Vercel will auto-inject `BLOB_READ_WRITE_TOKEN` into the project's Production env. Optionally also add to Preview + Development scopes.
3. Locally: `vercel env pull .env.local` to sync the token to the dev environment, OR add the token manually to `.env.local`.
4. Redeploy.

Until then, the paste-URL fallback continues to work; the "Upload" button is hidden by the API's 503 response.

## 7. Verification

- `bun run lint && bun run typecheck && bun run build` exit 0
- `bun run test:unit` — pass count rises by however many the new test file adds (target ~5-10 cases)
- With `BLOB_READ_WRITE_TOKEN` unset: forms render, "Upload" button is HIDDEN, URL input works as before, submit succeeds with pasted URL
- With `BLOB_READ_WRITE_TOKEN` set (operator step): file picker works end-to-end, uploaded URL appears in the field, submit persists the Blob URL to the DB
- Em/en-dash sweep on changed files: zero
- Phase 02-07 admin / auth / chrome / logger files diff vs `origin/main`: only the 6 form files in §4 changed (plus the planning docs and the new component/route/hook/test files); no drift elsewhere
- `src/lib/auth/admin.ts` diff vs `origin/main`: empty
- Em/en-dash sweep on new code AND any new user-facing copy: zero

## 8. Out of scope (deferred)

- Image transformation / resizing on upload (Phase 11+? or never — Vercel `<Image>` renders at the right size already)
- Inline image inserts inside the blog rich-text editor (Phase 09's responsibility)
- Bulk multi-file picker (revisit if galleries grow past ~10 items)
- Client-side preview before submit
- Video upload
- Orphan-blob cleanup job (delete `Blob` objects whose URL no longer appears in any DB row); pure ops, separate phase

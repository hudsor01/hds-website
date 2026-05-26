---
phase: 08
slug: image-upload-ui
milestone: v5
status: complete
shipped: 2026-05-26
branch: image-uploads
---

# Phase 08 — Image upload UI Summary

Replaced the paste-URL friction on all 6 admin form image fields with a real Vercel Blob upload widget while preserving paste-URL as a graceful fallback. One new isomorphic upload component family (`ImageUploadField` + `ImageGalleryField` + `useBlobUpload` hook) reused across showcase (imageUrl, ogImageUrl, galleryImages), blog (featureImage), and testimonials (imageUrl). One new API route (`POST /api/admin/images/upload`) backed by `@vercel/blob/client::handleUpload` per Vercel's canonical client-direct upload pattern.

## Tasks shipped

| # | Commit  | Summary |
| - | ------- | ------- |
| 1 | `5012223` | `feat(08): add @vercel/blob dep, env var, next.config image pattern` — `bun add @vercel/blob`, `BLOB_READ_WRITE_TOKEN` added to `src/env.ts`, `*.public.blob.vercel-storage.com` added to `next.config.ts` remotePatterns. |
| 2 | `31dff69` | `feat(08): admin image upload API route via @vercel/blob handleUpload` — single POST endpoint, auth gates the token via `requireAdminSession` inside `onBeforeGenerateToken`, MIME allowlist (png/jpeg/webp/gif/avif), 8 MB cap, 503 fast-fail when token unset. |
| 3 | `5de4147` | `feat(08): ImageUploadField + ImageGalleryField + use-blob-upload hook` — single-image and gallery variants; native drag-and-drop via label + file input; 503 detection sticky per session. |
| 4 | `3005c54` | `feat(08): wire upload widgets into 6 admin form files + add tests` — replaced 5 single-image inputs and 1 gallery textarea across showcase/blog/testimonials create+edit forms; 4 new unit tests in `tests/unit/admin-image-upload.test.ts`. |

## Files touched

### Added

- `src/app/api/admin/images/upload/route.ts` — POST handler using `handleUpload`. Token-issue phase auth-gates inside `onBeforeGenerateToken`; completion callback logs the URL (best-effort; only fires when Vercel can reach the app via a public URL).
- `src/components/admin/ImageUploadField.tsx` — single-image client component. Thumbnail preview with `<Image unoptimized>`, file picker via `<label>` wrapping `<input type="file">` with a dashed border. Upload button hidden once 503 is detected; URL paste input always present.
- `src/components/admin/ImageGalleryField.tsx` — gallery variant. Renders the array as a 2/3-col grid of thumbnails with per-row Remove. Shared Upload + URL controls at the bottom.
- `src/hooks/use-blob-upload.ts` — shared hook. Wraps `@vercel/blob/client::upload`. On any upload error, probes the endpoint with a tiny POST to read the status code; a 503 flips a sticky `uploadsDisabled` flag for the rest of the session.
- `tests/unit/admin-image-upload.test.ts` — 4 cases covering the route's 503/400/200/500 responses.

### Modified

- `src/env.ts` — `BLOB_READ_WRITE_TOKEN: z.string().optional()` added to server schema + runtimeEnv block. Optional everywhere; the API route returns 503 when missing.
- `next.config.ts` — `*.public.blob.vercel-storage.com` added to `images.remotePatterns` so `<Image>` previews render uploaded files.
- `package.json` + `bun.lock` — `@vercel/blob@2.4.0` added.
- 6 admin form files — image inputs replaced with `<ImageUploadField>` and `<ImageGalleryField>`:
  - `src/app/(admin)/admin/showcase/new/CreateShowcaseForm.tsx` (imageUrl + ogImageUrl + galleryImages)
  - `src/app/(admin)/admin/showcase/[id]/edit/EditShowcaseForm.tsx` (same 3 fields)
  - `src/app/(admin)/admin/blog/new/CreateBlogForm.tsx` (featureImage)
  - `src/app/(admin)/admin/blog/[id]/edit/EditBlogForm.tsx` (featureImage)
  - `src/app/(admin)/admin/testimonials/new/CreateTestimonialForm.tsx` (imageUrl)
  - `src/app/(admin)/admin/testimonials/[id]/edit/EditTestimonialForm.tsx` (imageUrl)

### Deleted

None.

## Deviations from CONTEXT spec

CONTEXT proposed a 4-file split for the server side (`src/lib/admin/blob-upload.ts` helper + `src/lib/schemas/admin-image-upload.ts` Zod schema + `src/app/api/admin/images/upload-token/route.ts` token route + completion handling elsewhere). The actual canonical Vercel Blob v2 SDK is `handleUpload` which combines token issuance, MIME validation, size enforcement, and completion-callback handling in a single function. The plan ships those three concerns as one route (`/api/admin/images/upload`) without the helper or schema files. The MIME allowlist and 8 MB size cap live inline in the route, validated by `handleUpload` itself before the token is minted.

Net effect: 3 fewer files than CONTEXT proposed, identical security posture, simpler test surface, no client-visible behavior difference.

## Gate results

- `bun run lint` → exit 0
- `bun run typecheck` → exit 0
- `bun run test:unit` → 578 pass / 0 fail (up from 574; +4 cases from `admin-image-upload.test.ts`)
- `bun run build` → Compiled successfully; 199 static pages generated
- Em/en-dash sweep on changed user-facing strings (JSX text, JSON, alt, title, placeholder, log messages that surface in errors) → zero matches. Code-comment em-dashes in two file docstrings are exempt per CLAUDE.md.
- Protected files diff vs `origin/main` → empty:
  - `src/lib/auth/admin.ts` byte-equal
  - `proxy.ts` byte-equal
  - `src/app/api/**` byte-equal except the new `/api/admin/images/upload/route.ts`

## Operator step required before the upload feature works

Until the operator wires Vercel Blob, the Upload control returns a 503 and the client UI shows "Uploads disabled. Paste a URL instead." Paste-URL continues to work normally for every field. Steps:

1. Vercel dashboard → project (hudson-digital-solutions) → Storage → Create Database → Blob → name `hds-images` (or similar).
2. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` into the project's Production env. Optionally also add to Preview + Development.
3. Local dev: `vercel env pull .env.local` to sync the token, OR add `BLOB_READ_WRITE_TOKEN=...` manually to `.env.local`.
4. Redeploy.

After that the Upload button stays visible and uploaded files land at `https://<store-id>.public.blob.vercel-storage.com/<filename>-<random>.<ext>`.

## Out of scope (deferred)

- Image transformation / resizing on upload (Next.js `<Image>` renders at the right size at request time)
- Inline image inserts inside the blog rich-text editor (Phase 09's responsibility)
- Bulk multi-file picker
- Client-side preview before submit
- Video upload (testimonials.videoUrl, showcase.testimonialVideoUrl remain paste-URL only)
- Orphan-blob cleanup job (delete Blob objects whose URL no longer appears in any DB row)

## Self-Check: PASSED

Files verified to exist:
- `src/app/api/admin/images/upload/route.ts` — FOUND
- `src/components/admin/ImageUploadField.tsx` — FOUND
- `src/components/admin/ImageGalleryField.tsx` — FOUND
- `src/hooks/use-blob-upload.ts` — FOUND
- `tests/unit/admin-image-upload.test.ts` — FOUND

Commits verified in git log:
- `5012223` — FOUND
- `31dff69` — FOUND
- `5de4147` — FOUND
- `3005c54` — FOUND

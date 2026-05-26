/**
 * Admin image upload — single POST endpoint backed by Vercel Blob.
 *
 * This route is the server side of Vercel Blob's "client-direct upload"
 * pattern. The browser calls `@vercel/blob/client::upload(...)` which
 * sends two requests to this URL:
 *
 *  1. A token-issue request. `handleUpload` invokes
 *     `onBeforeGenerateToken` so we can authorize the operator and
 *     declare MIME / size limits before any bytes leave the browser.
 *  2. A completion callback (Vercel's edge -> our server) AFTER the
 *     browser finishes PUTting the file to Blob. `onUploadCompleted`
 *     gets the final `{ url, pathname }`.
 *
 * The completion callback fires only when Vercel can reach this app
 * via a public URL. On localhost without a tunnel the callback is
 * skipped and the upload still succeeds (the URL is returned to the
 * browser by the `upload()` call directly). That's why DB-writing
 * logic (e.g. recording the URL on a row) lives on the form submit,
 * NOT in this callback.
 *
 * Auth runs inside `onBeforeGenerateToken` so it gates the *token*,
 * not just the route response. A forged completion callback from
 * something other than Vercel's edge would still fail Vercel's
 * signature check before this handler runs.
 *
 * 503 when `BLOB_READ_WRITE_TOKEN` is unset: the client UI uses that
 * status as the signal to hide the Upload button for the rest of the
 * session and fall back to paste-URL. See `use-blob-upload.ts`.
 */
import { type HandleUploadBody, handleUpload } from '@vercel/blob/client'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { requireAdminSession } from '@/lib/admin/auth'
import { logger } from '@/lib/logger'

const ALLOWED_CONTENT_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
	'image/avif'
]

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

// GET /api/admin/images/upload — lightweight probe endpoint used by the
// client hook to detect whether Vercel Blob is configured without sending
// a malformed POST that would trip handleUpload's body validation and
// produce a noise logger.error entry. Returns 200 with the configured
// state. Not auth-gated: the configured/unconfigured signal is not
// sensitive (anyone with the bundled JS can infer the same).
export function GET(): NextResponse {
	return NextResponse.json({ configured: Boolean(env.BLOB_READ_WRITE_TOKEN) })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	if (!env.BLOB_READ_WRITE_TOKEN) {
		return NextResponse.json(
			{ error: 'Vercel Blob is not configured. Paste a URL instead.' },
			{ status: 503 }
		)
	}

	let body: HandleUploadBody
	try {
		body = (await request.json()) as HandleUploadBody
	} catch (error) {
		logger.warn('Admin image upload: malformed JSON body', {
			metadata: { reason: error instanceof Error ? error.message : 'unknown' }
		})
		return NextResponse.json(
			{ error: 'Invalid request body.' },
			{ status: 400 }
		)
	}

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async () => {
				// Defense in depth: the admin layout already blocks GET on
				// /admin/*, but this endpoint is hit directly by the browser
				// from a client component, so we re-check the session here.
				await requireAdminSession()
				return {
					allowedContentTypes: ALLOWED_CONTENT_TYPES,
					maximumSizeInBytes: MAX_BYTES,
					addRandomSuffix: true,
					validUntil: Date.now() + 60 * 60 * 1000
				}
			},
			onUploadCompleted: async ({ blob }) => {
				// Best-effort audit log. On localhost without a public URL
				// this callback never fires, so do not put critical logic
				// here. The form submit is where the URL gets persisted.
				logger.info('Admin image upload completed', {
					metadata: { url: blob.url, pathname: blob.pathname }
				})
			}
		})
		return NextResponse.json(jsonResponse)
	} catch (error) {
		logger.error('Admin image upload-token handler failed', error)
		return NextResponse.json(
			{ error: 'Upload failed. Try again or paste a URL.' },
			{ status: 500 }
		)
	}
}

'use client'

// Browser-side hook for the admin Vercel Blob upload flow.
//
// Wraps `@vercel/blob/client::upload(...)` so each consuming component
// (ImageUploadField, ImageGalleryField) keeps its render logic clean.
//
// 503 detection is the tricky part. The `upload()` SDK call throws a
// generic `BlobError("Failed to retrieve the client token")` on any
// non-2xx response from our `/api/admin/images/upload` route, so the
// thrown error alone does not tell us whether Blob is misconfigured
// (503) or whether the operator's session expired (401), etc.
//
// Detection strategy: on every error, probe the upload endpoint with
// a tiny payload to read the actual HTTP status. A 503 means
// `BLOB_READ_WRITE_TOKEN` is unset on the server, so we set
// `uploadsDisabled` (sticky for the rest of the session) and the
// component hides the Upload button. Any other status surfaces a
// generic error and leaves Upload available for a retry.
//
// The hook intentionally does not auto-probe on mount; operators in
// a Blob-configured env should never see a phantom probe request that
// does nothing. The probe runs only on the failure path.

import { upload } from '@vercel/blob/client'
import { useCallback, useRef, useState } from 'react'

const UPLOAD_URL = '/api/admin/images/upload'

export interface UseBlobUploadResult {
	upload: (file: File) => Promise<string | null>
	isUploading: boolean
	error: string | null
	uploadsDisabled: boolean
	clearError: () => void
}

async function probeUploadDisabled(): Promise<boolean> {
	try {
		// Send a body the route can parse but that handleUpload will not
		// produce a successful response for. We only care about the status
		// code: 503 means BLOB_READ_WRITE_TOKEN is unset.
		const res = await fetch(UPLOAD_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ type: 'probe' })
		})
		return res.status === 503
	} catch {
		return false
	}
}

export function useBlobUpload(): UseBlobUploadResult {
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [uploadsDisabled, setUploadsDisabled] = useState(false)
	// Sticky lock: once we've confirmed Blob is unconfigured, do not
	// hit the server again on subsequent clicks.
	const disabledRef = useRef(false)

	const clearError = useCallback(() => setError(null), [])

	const runUpload = useCallback(async (file: File): Promise<string | null> => {
		if (disabledRef.current) {
			return null
		}
		setError(null)
		setIsUploading(true)
		try {
			const blob = await upload(file.name, file, {
				access: 'public',
				handleUploadUrl: UPLOAD_URL,
				contentType: file.type
			})
			return blob.url
		} catch (err) {
			const disabled = await probeUploadDisabled()
			if (disabled) {
				disabledRef.current = true
				setUploadsDisabled(true)
				setError(null)
				return null
			}
			setError(err instanceof Error ? err.message : 'Upload failed.')
			return null
		} finally {
			setIsUploading(false)
		}
	}, [])

	return {
		upload: runUpload,
		isUploading,
		error,
		uploadsDisabled,
		clearError
	}
}

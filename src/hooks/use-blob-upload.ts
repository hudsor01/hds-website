'use client'

// Browser-side hook for the admin Vercel Blob upload flow.
//
// Wraps `@vercel/blob/client::upload(...)` so each consuming component
// (ImageUploadField, ImageGalleryField) keeps its render logic clean.
//
// Adapted from Vercel's canonical `blob-starter` example at
// https://github.com/vercel/examples/tree/main/storage/blob-starter
// to add `onUploadProgress` -> `progress: number` state. The example
// uses it to render an upload progress bar; we surface the same state
// to the field components so the operator gets immediate visual
// feedback during multi-megabyte uploads.
//
// Failure handling has three layers:
//
//  1. 503 detection (Blob unconfigured). On every error, probe the
//     upload endpoint with a lightweight GET that returns
//     `{ configured: boolean }`. When `configured` is false,
//     `BLOB_READ_WRITE_TOKEN` is unset on the server; set
//     `uploadsDisabled` (sticky) and the component hides the Upload
//     button. The probe runs only on the failure path.
//
//  2. Retry cap. After MAX_CONSECUTIVE_FAILURES (3) failed uploads,
//     stop accepting new attempts and surface a visible error -- this
//     keeps a flaky upstream from letting the operator hammer the
//     button until they get bored. The cap resets on the first
//     success or on `clearError()`.
//
//  3. Visible error state. `error` is set with the last failure
//     message; the consuming component renders it in a styled error
//     block. The Upload button stays clickable so the operator can
//     retry, except when uploadsDisabled or retryExceeded is set.
//
// The hook intentionally does not auto-probe on mount; operators in
// a Blob-configured env should never see a phantom probe request that
// does nothing.

import { upload } from '@vercel/blob/client'
import { useCallback, useRef, useState } from 'react'

const UPLOAD_URL = '/api/admin/images/upload'
const MAX_CONSECUTIVE_FAILURES = 3

export interface UseBlobUploadResult {
	upload: (file: File) => Promise<string | null>
	isUploading: boolean
	progress: number
	error: string | null
	uploadsDisabled: boolean
	retryExceeded: boolean
	clearError: () => void
}

async function probeUploadDisabled(): Promise<boolean> {
	try {
		// GET the lightweight probe endpoint, which returns
		// { configured: boolean } without invoking handleUpload. A
		// `configured: false` response means BLOB_READ_WRITE_TOKEN is
		// unset on the server.
		const res = await fetch(UPLOAD_URL, { method: 'GET' })
		if (!res.ok) {
			return false
		}
		const data = (await res.json()) as { configured?: boolean }
		return data.configured === false
	} catch {
		return false
	}
}

export function useBlobUpload(): UseBlobUploadResult {
	const [isUploading, setIsUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const [uploadsDisabled, setUploadsDisabled] = useState(false)
	const [retryExceeded, setRetryExceeded] = useState(false)
	// Sticky lock: once we've confirmed Blob is unconfigured, do not
	// hit the server again on subsequent clicks.
	const disabledRef = useRef(false)
	// Consecutive failure counter. Reset on success or clearError.
	const failureCountRef = useRef(0)

	const clearError = useCallback(() => {
		setError(null)
		setRetryExceeded(false)
		failureCountRef.current = 0
	}, [])

	const runUpload = useCallback(async (file: File): Promise<string | null> => {
		if (disabledRef.current) {
			return null
		}
		if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
			return null
		}
		setError(null)
		setProgress(0)
		setIsUploading(true)
		try {
			const blob = await upload(file.name, file, {
				access: 'public',
				handleUploadUrl: UPLOAD_URL,
				contentType: file.type,
				// Surface byte-level progress so the field can render a
				// progress bar. The SDK fires this periodically as the PUT
				// streams to Vercel's edge. Pattern lifted from Vercel's
				// blob-starter example.
				onUploadProgress: progressEvent => {
					setProgress(progressEvent.percentage)
				}
			})
			// Success resets the failure counter so a flaky network
			// doesn't permanently disable retries after the next failure.
			failureCountRef.current = 0
			return blob.url
		} catch (err) {
			const disabled = await probeUploadDisabled()
			if (disabled) {
				disabledRef.current = true
				setUploadsDisabled(true)
				setError(null)
				return null
			}
			failureCountRef.current += 1
			const baseMessage = err instanceof Error ? err.message : 'Upload failed.'
			if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
				setRetryExceeded(true)
				setError(
					`Upload failed after ${MAX_CONSECUTIVE_FAILURES} attempts: ${baseMessage}. Paste a URL instead.`
				)
			} else {
				setError(baseMessage)
			}
			return null
		} finally {
			setIsUploading(false)
			// Reset progress so the next upload starts the bar at 0
			// instead of jumping back from the last streamed value.
			// (The bar is gated on isUploading so this is cosmetic, but
			// it keeps the state clean for any future caller that reads
			// progress outside the uploading window.)
			setProgress(0)
		}
	}, [])

	return {
		upload: runUpload,
		isUploading,
		progress,
		error,
		uploadsDisabled,
		retryExceeded,
		clearError
	}
}

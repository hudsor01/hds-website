'use client'

/**
 * Admin single-image field with upload + paste-URL controls.
 *
 * Renders inside a `useAppForm` AppField wrapper. The caller binds
 * `value`/`onChange` to its TanStack Form field; this component owns
 * the file picker, drag-drop zone, live preview, and Remove button.
 *
 * Patterns adapted from Vercel's `blob-starter` reference example
 * (https://github.com/vercel/examples/tree/main/storage/blob-starter):
 *
 *   - Inline `onDragEnter/Over/Leave/Drop` handlers + `dragActive`
 *     state for visual feedback while a file hovers.
 *   - `URL.createObjectURL(file)` for an immediate local preview
 *     during the upload, with `URL.revokeObjectURL` cleanup on
 *     unmount, on success, and on remove so the blob is not retained.
 *   - Pre-upload `validateImageFile(file)` so type and size errors
 *     surface BEFORE the SDK round-trip (drag-drop bypasses the
 *     `accept` attribute on `<input type="file">`).
 *   - `useBlobUpload`'s `onUploadProgress` -> `progress` state
 *     rendered as a thin `<UploadProgressBar>` next to the drop zone.
 *
 * Two controls are always present:
 *  - Upload zone (hidden once the API returns 503 OR retries are
 *    exhausted in this session).
 *  - URL text input (the paste-URL fallback that ships with the form).
 *
 * Switching between uploaded and pasted URLs is just an onChange swap
 * via the form field; no extra state to track.
 *
 * Thumbnail rendering uses `<Image unoptimized>` because the URL may
 * point to an arbitrary remote host (paste-URL) that next.config.ts
 * has not whitelisted. Vercel Blob URLs ARE whitelisted via the
 * `*.public.blob.vercel-storage.com` remote pattern, but the
 * unoptimized fallback keeps the preview from crashing on any
 * non-whitelisted host an operator pastes.
 */
import Image from 'next/image'
import {
	type DragEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState
} from 'react'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { UploadProgressBar } from '@/components/admin/UploadProgressBar'
import { useBlobUpload } from '@/hooks/use-blob-upload'
import {
	ACCEPT_ATTRIBUTE,
	formatBytes,
	MAX_IMAGE_BYTES,
	validateImageFile
} from '@/lib/admin/image-upload'

interface ImageUploadFieldProps {
	label: string
	htmlFor: string
	value: string | null
	onChange: (next: string | null) => void
	required?: boolean
	hint?: string
	error?: string
}

const URL_INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'

const REMOVE_BUTTON_CLS =
	'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-destructive border border-destructive/40 hover:bg-destructive/10 transition-smooth'

const DROP_ZONE_BASE_CLS =
	'flex items-center justify-center rounded-md border border-dashed px-3 py-2 text-sm transition-smooth cursor-pointer'

const DROP_ZONE_IDLE_CLS =
	'border-border text-muted-foreground hover:border-accent-text hover:text-foreground'

const DROP_ZONE_ACTIVE_CLS =
	'border-accent-text text-foreground bg-accent-text/10'

export function ImageUploadField({
	label,
	htmlFor,
	value,
	onChange,
	required,
	hint,
	error
}: ImageUploadFieldProps) {
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [dragActive, setDragActive] = useState(false)
	const [localPreview, setLocalPreview] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)

	const {
		upload,
		isUploading,
		progress,
		error: uploadError,
		uploadsDisabled,
		retryExceeded,
		clearError
	} = useBlobUpload()

	// Reset any stale upload / validation error on mount. Without this,
	// an error surfaced before a route navigation (e.g. an old store ID
	// from a previous session) could persist as a phantom message on
	// first paint after the user navigates back.
	useEffect(() => {
		clearError()
	}, [clearError])

	// Revoke object URL on unmount so the in-memory preview blob is
	// released. URL.createObjectURL retains the file in memory until
	// the page unloads OR the URL is explicitly revoked.
	useEffect(() => {
		return () => {
			if (localPreview) {
				URL.revokeObjectURL(localPreview)
			}
		}
	}, [localPreview])

	const handleFile = useCallback(
		async (file: File | null | undefined) => {
			if (!file) {
				return
			}
			setValidationError(null)
			const invalid = validateImageFile(file)
			if (invalid) {
				setValidationError(invalid.message)
				return
			}
			// Show the local file IMMEDIATELY so the operator has visual
			// confirmation while the upload streams. Revoke when the
			// remote URL takes over (on success) or on a clean reset.
			const objectUrl = URL.createObjectURL(file)
			setLocalPreview(objectUrl)
			const url = await upload(file)
			URL.revokeObjectURL(objectUrl)
			setLocalPreview(null)
			if (url) {
				onChange(url)
			}
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		},
		[onChange, upload]
	)

	const onDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(true)
	}, [])
	const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])
	const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
		e.preventDefault()
		e.stopPropagation()
		// Vercel pattern: only flip inactive when leaving the wrapper
		// itself, not when crossing into a child element.
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
			return
		}
		setDragActive(false)
	}, [])
	const onDrop = useCallback(
		(e: DragEvent<HTMLElement>) => {
			e.preventDefault()
			e.stopPropagation()
			setDragActive(false)
			const file = e.dataTransfer?.files?.[0]
			if (file) {
				void handleFile(file)
			}
		},
		[handleFile]
	)

	// Field-level error from the form (Zod / Server Action) takes
	// precedence. Upload/validation errors surface in a dedicated alert
	// below the controls so they read clearly.
	const formError = error
	const showUploadButton = !uploadsDisabled && !retryExceeded
	const previewSrc = localPreview ?? value ?? null
	const inlineError = validationError ?? uploadError ?? null

	return (
		<FormFieldSet
			label={label}
			htmlFor={htmlFor}
			required={required}
			hint={hint ?? `Max ${formatBytes(MAX_IMAGE_BYTES)}`}
			error={formError}
		>
			{aria => (
				<div className="space-y-2">
					{previewSrc && (
						<div className="flex items-start gap-3">
							<div className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-surface-base">
								<Image
									src={previewSrc}
									alt={`${label} preview`}
									fill
									sizes="80px"
									className="object-cover"
									unoptimized
								/>
							</div>
							<button
								type="button"
								onClick={() => {
									if (localPreview) {
										URL.revokeObjectURL(localPreview)
										setLocalPreview(null)
									}
									onChange(null)
								}}
								className={REMOVE_BUTTON_CLS}
							>
								Remove
							</button>
						</div>
					)}

					{/* aria-busy belongs on a wrapping container -- <label> does not
					    accept it semantically. aria-live="polite" because upload
					    progress is informational, not urgent. */}
					<div className="space-y-2" aria-busy={isUploading} aria-live="polite">
						{showUploadButton && (
							<>
								<label
									htmlFor={fileInputId}
									onDragEnter={onDragEnter}
									onDragOver={onDragOver}
									onDragLeave={onDragLeave}
									onDrop={onDrop}
									className={`${DROP_ZONE_BASE_CLS} ${
										dragActive ? DROP_ZONE_ACTIVE_CLS : DROP_ZONE_IDLE_CLS
									}`}
								>
									{isUploading
										? `Uploading... ${Math.round(progress)}%`
										: dragActive
											? 'Drop image here'
											: 'Upload or drop image'}
								</label>
								<input
									ref={fileInputRef}
									id={fileInputId}
									type="file"
									accept={ACCEPT_ATTRIBUTE}
									className="sr-only"
									disabled={isUploading}
									onChange={e => {
										const file = e.target.files?.[0]
										void handleFile(file)
									}}
								/>
								{isUploading && <UploadProgressBar value={progress} />}
							</>
						)}
						{uploadsDisabled && (
							<p className="text-xs text-muted-foreground">
								Uploads disabled. Paste a URL instead.
							</p>
						)}
						{retryExceeded && !uploadsDisabled && (
							<button
								type="button"
								onClick={clearError}
								className="text-xs font-medium text-accent-text hover:underline"
							>
								Reset upload
							</button>
						)}
					</div>

					{inlineError && (
						<div
							role="alert"
							className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
						>
							{inlineError}
						</div>
					)}

					<input
						{...aria}
						type="url"
						className={URL_INPUT_CLS}
						placeholder="Or paste an image URL"
						value={value ?? ''}
						disabled={isUploading}
						onChange={e =>
							onChange(e.target.value === '' ? null : e.target.value)
						}
					/>
				</div>
			)}
		</FormFieldSet>
	)
}

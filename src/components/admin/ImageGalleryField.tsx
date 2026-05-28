'use client'

/**
 * Admin gallery image field — array variant of `ImageUploadField`.
 *
 * Renders the current `values` as a grid of thumbnails, each with a
 * Remove button. The bottom row carries the shared Upload + URL
 * controls; both append to the array via the same `onChange` seam.
 *
 * Same Vercel `blob-starter`-derived patterns as the single-image
 * variant: inline drag-drop handlers + `dragActive` state, local
 * `URL.createObjectURL` preview during upload + `revokeObjectURL`
 * cleanup, pre-upload `validateImageFile` for drag-drop-bypass-safe
 * validation, `onUploadProgress` -> visible progress bar.
 *
 * Multi-file selection is not supported here; the spec calls for
 * one file at a time per CONTEXT.md "no bulk upload" non-goal.
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

interface ImageGalleryFieldProps {
	label: string
	htmlFor: string
	values: string[]
	onChange: (next: string[]) => void
	hint?: string
	error?: string
}

const URL_INPUT_CLS =
	'flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground'

const ADD_BUTTON_CLS =
	'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-surface-base bg-accent-text hover:opacity-90 transition-smooth disabled:opacity-60'

const REMOVE_BUTTON_CLS =
	'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-destructive border border-destructive/40 hover:bg-destructive/10 transition-smooth'

const DROP_ZONE_BASE_CLS =
	'flex items-center justify-center rounded-md border border-dashed px-3 py-2 text-sm transition-smooth cursor-pointer'

const DROP_ZONE_IDLE_CLS =
	'border-border text-muted-foreground hover:border-accent-text hover:text-foreground'

const DROP_ZONE_ACTIVE_CLS =
	'border-accent-text text-foreground bg-accent-text/10'

export function ImageGalleryField({
	label,
	htmlFor,
	values,
	onChange,
	hint,
	error
}: ImageGalleryFieldProps) {
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [urlDraft, setUrlDraft] = useState('')
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

	useEffect(() => {
		clearError()
	}, [clearError])

	useEffect(() => {
		return () => {
			if (localPreview) {
				URL.revokeObjectURL(localPreview)
			}
		}
	}, [localPreview])

	function removeAt(index: number) {
		onChange(values.filter((_, i) => i !== index))
	}

	function addUrl() {
		const trimmed = urlDraft.trim()
		if (!trimmed) {
			return
		}
		onChange([...values, trimmed])
		setUrlDraft('')
	}

	const handleFile = useCallback(
		async (file: File | null | undefined) => {
			if (!file) {
				return
			}
			// Concurrency guard: drag-drop bypasses the file <input
			// disabled> attribute. In the gallery, a rapid second drop
			// during an in-flight upload races on `values` -- the second
			// onChange call reads stale values (without url1 appended)
			// and silently overwrites url1 with [...values, url2].
			// Explicit rejection is the safer contract. See PR #232
			// round-1 SHOULD-FIX.
			if (isUploading) {
				return
			}
			setValidationError(null)
			const invalid = validateImageFile(file)
			if (invalid) {
				setValidationError(invalid.message)
				return
			}
			const objectUrl = URL.createObjectURL(file)
			setLocalPreview(objectUrl)
			const url = await upload(file)
			URL.revokeObjectURL(objectUrl)
			setLocalPreview(null)
			if (url) {
				onChange([...values, url])
			}
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		},
		[onChange, upload, values, isUploading]
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

	const formError = error
	const showUploadButton = !uploadsDisabled && !retryExceeded
	const inlineError = validationError ?? uploadError ?? null

	return (
		<FormFieldSet
			label={label}
			htmlFor={htmlFor}
			hint={hint ?? `Max ${formatBytes(MAX_IMAGE_BYTES)} per image`}
			error={formError}
		>
			{aria => (
				<div className="space-y-3">
					{(values.length > 0 || localPreview) && (
						<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{values.map((url, index) => (
								// key={url} works because Vercel Blob's addRandomSuffix=true guarantees
								// uploaded URLs are unique; the duplicate-pasted-URL corner case is
								// acceptable for an internal admin gallery (~5 items max in practice).
								<li
									key={url}
									className="flex flex-col gap-2 rounded-md border border-border p-2"
								>
									<div className="relative h-24 w-full overflow-hidden rounded bg-surface-base">
										<Image
											src={url}
											alt={`${label} ${index + 1}`}
											fill
											sizes="(min-width: 640px) 160px, 50vw"
											className="object-cover"
											unoptimized
										/>
									</div>
									<div className="flex items-center justify-between gap-2">
										<span
											className="truncate text-xs text-muted-foreground"
											title={url}
										>
											{url.split('/').pop()}
										</span>
										<button
											type="button"
											onClick={() => removeAt(index)}
											className={REMOVE_BUTTON_CLS}
											aria-label={`Remove image ${index + 1}`}
										>
											Remove
										</button>
									</div>
								</li>
							))}
							{localPreview && (
								<li
									key="local-preview"
									aria-busy="true"
									className="flex flex-col gap-2 rounded-md border border-dashed border-accent-text/60 p-2"
								>
									<div className="relative h-24 w-full overflow-hidden rounded bg-surface-base">
										<Image
											src={localPreview}
											alt={`${label} uploading`}
											fill
											sizes="(min-width: 640px) 160px, 50vw"
											className="object-cover opacity-70"
											unoptimized
										/>
									</div>
									<UploadProgressBar
										value={progress}
										label="Image upload progress"
									/>
								</li>
							)}
						</ul>
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
							</>
						)}
						{uploadsDisabled && (
							<p className="text-xs text-muted-foreground">
								Uploads disabled. Paste URLs instead.
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

					<div className="flex items-center gap-2">
						<input
							{...aria}
							type="url"
							className={URL_INPUT_CLS}
							placeholder="Paste an image URL and click Add"
							value={urlDraft}
							disabled={isUploading}
							onChange={e => setUrlDraft(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault()
									addUrl()
								}
							}}
						/>
						<button
							type="button"
							onClick={addUrl}
							disabled={isUploading || urlDraft.trim() === ''}
							className={ADD_BUTTON_CLS}
						>
							Add
						</button>
					</div>
				</div>
			)}
		</FormFieldSet>
	)
}

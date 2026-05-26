'use client'

/**
 * Admin gallery image field — array variant of `ImageUploadField`.
 *
 * Renders the current `values` as a grid of thumbnails, each with a
 * Remove button. The bottom row carries the shared Upload + URL
 * controls; both append to the array via the same `onChange` seam.
 *
 * Same Upload vs paste-URL trade-off as the single-image variant:
 * `useBlobUpload` toggles `uploadsDisabled` on 503 and the Upload
 * label is hidden for the rest of the session. The URL input is
 * always visible, so a paste-only operator (or a paste-only env)
 * still has a working flow.
 *
 * Multi-file selection is not supported here; the spec calls for
 * one file at a time per CONTEXT.md "no bulk upload" non-goal.
 */
import Image from 'next/image'
import { useId, useRef, useState } from 'react'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { useBlobUpload } from '@/hooks/use-blob-upload'

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

const DROP_ZONE_CLS =
	'flex items-center justify-center rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-accent-text hover:text-foreground transition-smooth cursor-pointer'

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
	const {
		upload,
		isUploading,
		error: uploadError,
		uploadsDisabled
	} = useBlobUpload()

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

	async function handleFile(file: File | null | undefined) {
		if (!file) {
			return
		}
		const url = await upload(file)
		if (url) {
			onChange([...values, url])
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const combinedError = error ?? uploadError ?? undefined

	return (
		<FormFieldSet
			label={label}
			htmlFor={htmlFor}
			hint={hint}
			error={combinedError}
		>
			{aria => (
				<div className="space-y-3">
					{values.length > 0 && (
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
						</ul>
					)}

					{/* aria-busy belongs on a wrapping container -- <label> does not
					    accept it semantically. aria-live="polite" because upload
					    progress is informational, not urgent. */}
					<div
						className="flex flex-wrap items-center gap-2"
						aria-busy={isUploading}
						aria-live="polite"
					>
						{!uploadsDisabled && (
							<>
								<label htmlFor={fileInputId} className={DROP_ZONE_CLS}>
									{isUploading ? 'Uploading...' : 'Upload or drop image'}
								</label>
								<input
									ref={fileInputRef}
									id={fileInputId}
									type="file"
									accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
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
					</div>

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

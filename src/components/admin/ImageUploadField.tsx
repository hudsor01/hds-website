'use client'

/**
 * Admin single-image field with upload + paste-URL controls.
 *
 * Renders inside a `useAppForm` AppField wrapper. The caller binds
 * `value`/`onChange` to its TanStack Form field; this component owns
 * the file picker, thumbnail preview, and Remove button.
 *
 * Two controls are always present in the DOM:
 *  - "Upload" button (hidden once the API returns 503 in this session)
 *  - URL text input (the paste-URL fallback that ships with the form)
 *
 * Operators can freely mix the two. Switching between uploaded and
 * pasted URLs is just an onChange swap; no extra state to track.
 *
 * Thumbnail rendering uses `<Image unoptimized>` because the URL may
 * point to an arbitrary remote host (paste-URL) that next.config.ts
 * has not whitelisted. Vercel Blob URLs ARE whitelisted via the
 * `*.public.blob.vercel-storage.com` remote pattern, but the
 * unoptimized fallback keeps the preview from crashing on any
 * non-whitelisted host an operator pastes.
 */
import Image from 'next/image'
import { useId, useRef } from 'react'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { useBlobUpload } from '@/hooks/use-blob-upload'

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

const DROP_ZONE_CLS =
	'flex items-center justify-center rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-accent-text hover:text-foreground transition-smooth cursor-pointer'

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
	const {
		upload,
		isUploading,
		error: uploadError,
		uploadsDisabled
	} = useBlobUpload()

	async function handleFile(file: File | null | undefined) {
		if (!file) {
			return
		}
		const url = await upload(file)
		if (url) {
			onChange(url)
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
			required={required}
			hint={hint}
			error={combinedError}
		>
			{aria => (
				<div className="space-y-2">
					{value && (
						<div className="flex items-start gap-3">
							<div className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-surface-base">
								<Image
									src={value}
									alt={`${label} preview`}
									fill
									sizes="80px"
									className="object-cover"
									unoptimized
								/>
							</div>
							<button
								type="button"
								onClick={() => onChange(null)}
								className={REMOVE_BUTTON_CLS}
							>
								Remove
							</button>
						</div>
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
								Uploads disabled. Paste a URL instead.
							</p>
						)}
					</div>

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

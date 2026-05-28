/**
 * Slim horizontal progress bar shown beside the admin image upload
 * drop zone while a file streams to Vercel Blob.
 *
 * Adapted from Vercel's `blob-starter` `progress-bar.tsx` example, with
 * the Tailwind utility colors swapped for the project's design tokens
 * (accent-text on a muted background) so it visually matches the rest
 * of the admin shell.
 *
 * `value` is a percentage 0-100. The component clamps to that range
 * so callers do not have to.
 */

interface UploadProgressBarProps {
	value: number
	label?: string
}

export function UploadProgressBar({ value, label }: UploadProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value))
	return (
		<div
			role="progressbar"
			aria-valuenow={Math.round(clamped)}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={label ?? 'Upload progress'}
			className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
		>
			<div
				className="h-full bg-accent-text transition-[width] duration-150 ease-out"
				style={{ width: `${clamped}%` }}
			/>
		</div>
	)
}

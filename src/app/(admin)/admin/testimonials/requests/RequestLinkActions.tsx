'use client'

/**
 * Copy / email actions for one private testimonial request link (client).
 *
 * The link is built from `window.location.origin` so a link created on a
 * preview or local deploy points at that deploy's database. Copy shows an
 * honest Sonner toast for success or failure. Email opens the admin's mail
 * client with the link prefilled; it only renders when the request has an
 * email address.
 */
import { Copy, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface RequestLinkActionsProps {
	token: string
	clientName: string
	clientEmail?: string
}

function requestLink(token: string): string {
	return `${window.location.origin}/testimonials/submit/${token}`
}

export async function copyRequestLink(token: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(requestLink(token))
		toast.success('Review link copied')
	} catch {
		toast.error('Could not copy the link. Select it and copy it by hand.')
	}
}

const BUTTON_CLS =
	'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-accent-text hover:bg-surface-base transition-smooth'

export function RequestLinkActions({
	token,
	clientName,
	clientEmail
}: RequestLinkActionsProps) {
	const openEmail = () => {
		const subject = 'Would you share a quick review?'
		const body = `Hi ${clientName},\n\nThanks again for working with me. If you have two minutes, I would appreciate a short review here:\n\n${requestLink(token)}\n\nThe link works once and expires in 30 days.\n\nRichard`
		window.location.href = `mailto:${encodeURIComponent(clientEmail ?? '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
	}

	return (
		<div className="inline-flex items-center gap-1">
			<button
				type="button"
				onClick={() => void copyRequestLink(token)}
				className={BUTTON_CLS}
				aria-label={`Copy review link for ${clientName}`}
			>
				<Copy size={14} aria-hidden="true" />
				Copy link
			</button>
			{clientEmail ? (
				<button
					type="button"
					onClick={openEmail}
					className={BUTTON_CLS}
					aria-label={`Email review link to ${clientName}`}
				>
					<Mail size={14} aria-hidden="true" />
					Email
				</button>
			) : null}
		</div>
	)
}

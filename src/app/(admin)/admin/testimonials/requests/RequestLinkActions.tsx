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
import { Button } from '@/components/ui/button'

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
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => void copyRequestLink(token)}
				aria-label={`Copy review link for ${clientName}`}
			>
				<Copy aria-hidden="true" />
				Copy link
			</Button>
			{clientEmail ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={openEmail}
					aria-label={`Email review link to ${clientName}`}
				>
					<Mail aria-hidden="true" />
					Email
				</Button>
			) : null}
		</div>
	)
}

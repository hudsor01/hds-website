'use client'

import { useEffect, useState } from 'react'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

const STORAGE_KEY = 'hds-exit-intent-shown'
const TOP_THRESHOLD_PX = 50

export function ExitIntentModal() {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		// Skip on touch / coarse-pointer devices — mouseleave at viewport top
		// is not a meaningful signal when there's no cursor.
		if (
			typeof window === 'undefined' ||
			!window.matchMedia('(hover: hover) and (pointer: fine)').matches
		) {
			return
		}

		// Fire at most once per browser session.
		if (window.sessionStorage.getItem(STORAGE_KEY) === '1') {
			return
		}

		const handleMouseOut = (event: MouseEvent) => {
			// Only when the cursor exits via the top edge AND has actually
			// left the document (relatedTarget=null means it left the window).
			if (event.clientY < TOP_THRESHOLD_PX && event.relatedTarget === null) {
				window.sessionStorage.setItem(STORAGE_KEY, '1')
				setOpen(true)
			}
		}

		document.addEventListener('mouseout', handleMouseOut)
		return () => document.removeEventListener('mouseout', handleMouseOut)
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						Wait — one practical playbook before you go.
					</DialogTitle>
					<DialogDescription>
						If you&apos;re weighing whether a website is worth the cost, get the
						short list of decisions that actually move the needle for small
						businesses. One email, no follow-ups, unsubscribe anytime.
					</DialogDescription>
				</DialogHeader>
				<NewsletterSignup variant="modal" title="" description="" />
			</DialogContent>
		</Dialog>
	)
}

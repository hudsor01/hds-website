'use client'

import { useEffect, useRef, useState } from 'react'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

const STORAGE_KEY = 'hds-exit-intent-shown'
const MIN_DWELL_MS = 30_000
const POST_CLICK_SUPPRESS_MS = 2_000

/**
 * Exit-intent modal scoped to the homepage. Fires once per session when
 * the cursor truly exits the document via the top edge (clientY <= 0
 * with relatedTarget=null on a body mouseleave), the user has been on
 * the page at least 30s, and they haven't clicked anything in the
 * preceding 2s. The browser cannot distinguish "user is closing the
 * tab" from "user is moving cursor to the URL bar" — these heuristics
 * minimize false positives for the second case.
 */
export function ExitIntentModal() {
	const [open, setOpen] = useState(false)
	const lastClickAtRef = useRef<number>(0)
	const armedAtRef = useRef<number>(0)

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

		armedAtRef.current = Date.now()

		const handleClick = () => {
			lastClickAtRef.current = Date.now()
		}

		const handleMouseLeave = (event: MouseEvent) => {
			// Cursor must have actually crossed the top edge of the viewport,
			// not merely approached the navbar. clientY is 0 or negative when
			// the pointer has truly left via the top.
			if (event.clientY > 0 || event.relatedTarget !== null) {
				return
			}

			// Suppress when the document is not focused. Opening DevTools or
			// alt-tabbing fires mouseleave through the same code path; we
			// only want true viewport-exit gestures while the page is focused.
			if (!document.hasFocus()) {
				return
			}

			const now = Date.now()
			if (now - armedAtRef.current < MIN_DWELL_MS) {
				return
			}
			if (now - lastClickAtRef.current < POST_CLICK_SUPPRESS_MS) {
				return
			}

			window.sessionStorage.setItem(STORAGE_KEY, '1')
			setOpen(true)
		}

		// Listen on <html> rather than <body>. mouseleave on body is
		// unreliable in Safari for true viewport exits; documentElement
		// is the direct parent and consistently fires across browsers.
		document.documentElement.addEventListener('mouseleave', handleMouseLeave)
		document.addEventListener('click', handleClick, { capture: true })

		return () => {
			document.documentElement.removeEventListener(
				'mouseleave',
				handleMouseLeave
			)
			document.removeEventListener('click', handleClick, { capture: true })
		}
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>One practical playbook before you go.</DialogTitle>
					<DialogDescription>
						The short list of decisions that actually move the needle for small
						businesses building or rebuilding their website. One email, no
						follow-ups, unsubscribe anytime.
					</DialogDescription>
				</DialogHeader>
				<NewsletterSignup variant="compact" title="" description="" />
			</DialogContent>
		</Dialog>
	)
}

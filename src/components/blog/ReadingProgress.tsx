'use client'

import { useEffect, useState } from 'react'

/**
 * Thin fixed bar at the top of the viewport that fills as the reader scrolls
 * through the article. Accessibility: exposed as a progressbar with a live
 * aria-valuenow so assistive tech can announce reading position.
 */
export function ReadingProgress() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function update() {
			const doc = document.documentElement
			const scrollable = doc.scrollHeight - doc.clientHeight
			const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0
			setProgress(Math.min(100, Math.max(0, Math.round(pct))))
		}
		update()
		window.addEventListener('scroll', update, { passive: true })
		window.addEventListener('resize', update)
		return () => {
			window.removeEventListener('scroll', update)
			window.removeEventListener('resize', update)
		}
	}, [])

	return (
		<div
			className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
			role="progressbar"
			aria-label="Reading progress"
			aria-valuenow={progress}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className="h-full bg-accent transition-[width] duration-150 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	)
}

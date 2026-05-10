import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackLinkProps {
	href: string
	label: string
}

/**
 * Standard back-navigation link used at the top of blog detail / author /
 * tag pages. Wrapped in the canonical container so all blog routes get
 * consistent spacing.
 */
export function BackLink({ href, label }: BackLinkProps) {
	return (
		<div className="container-wide px-4 sm:px-6 py-8">
			<Link
				href={href}
				className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
			>
				<ArrowLeft className="w-5 h-5" />
				{label}
			</Link>
		</div>
	)
}

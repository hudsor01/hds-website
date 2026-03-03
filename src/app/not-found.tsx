import { Home, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
	title: '404 - Page Not Found | Hudson Digital Solutions',
	description:
		'Page not found. Return to Hudson Digital Solutions for premium web development and digital strategy services.',
	robots: {
		index: false,
		follow: false,
		'max-snippet': -1,
		'max-image-preview': 'large',
		'max-video-preview': -1
	}
}

export default function NotFound() {
	return (
		<main className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
			<div
				className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
				aria-hidden="true"
			/>
			<div
				className="hero-spotlight absolute inset-0 pointer-events-none"
				aria-hidden="true"
			/>

			<div className="relative z-10 container-narrow text-center">
				{/* 404 Visual */}
				<div className="mb-10">
					<h1 className="text-8xl lg:text-9xl font-black text-accent mb-4">
						404
					</h1>
					<div className="w-32 h-1 bg-border mx-auto rounded-full"></div>
				</div>

				{/* Error Message */}
				<div className="mb-10">
					<h2 className="text-section-title text-foreground mb-4 text-balance">
						Page Not Found
					</h2>
					<p className="text-lead text-muted-foreground max-w-xl mx-auto">
						The page you&apos;re looking for has vanished into the digital void.
						But don&apos;t worry—our navigation system is still operational.
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-wrap justify-center gap-4 mb-10">
					<Button asChild variant="accent" size="xl" trackConversion={false}>
						<Link href="/">
							<Home className="w-5 h-5" />
							Return Home
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="xl"
						className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
					>
						<Link href="/contact">
							<MessageSquare className="w-5 h-5" />
							Get Help
						</Link>
					</Button>
				</div>

				{/* Quick Links */}
				<div className="mt-8">
					<p className="text-sm font-semibold text-muted-foreground mb-4">
						Or explore these sections:
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Button asChild variant="link" size="sm" className="px-0">
							<Link href="/services">Services</Link>
						</Button>
						<Button asChild variant="link" size="sm" className="px-0">
							<Link href="/about">About</Link>
						</Button>
						<Button asChild variant="link" size="sm" className="px-0">
							<Link href="/showcase">Portfolio</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	)
}

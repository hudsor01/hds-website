import Link from 'next/link'
import './globals.css'

export default function GlobalNotFound() {
	return (
		<html lang="en">
			<body className="min-h-screen flex items-center justify-center p-6 font-sans bg-background text-foreground">
				<div className="max-w-2xl w-full text-center">
					<div className="w-32 h-32 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center text-5xl text-muted-foreground">
						404
					</div>

					<h1 className="text-3xl font-bold mb-4 text-foreground">
						Page Not Found
					</h1>

					<p className="text-muted-foreground mb-8 text-lg leading-relaxed">
						The page you&apos;re looking for doesn&apos;t exist or has been
						moved. Let&apos;s get you back on track.
					</p>

					<div className="flex gap-4 justify-center flex-wrap">
						<Link
							href="/"
							className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold inline-block no-underline"
						>
							Go Home
						</Link>

						<Link
							href="/contact"
							className="px-6 py-3 bg-transparent text-primary rounded-lg font-semibold inline-block border-2 border-primary no-underline"
						>
							Contact Us
						</Link>
					</div>

					<div className="mt-12 p-6 bg-muted rounded-lg border border-border">
						<h2 className="text-lg font-semibold mb-4 text-foreground">
							Popular Pages
						</h2>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<Link
								href="/services"
								className="text-primary text-sm no-underline"
							>
								Services
							</Link>
							<Link
								href="/showcase"
								className="text-primary text-sm no-underline"
							>
								Portfolio
							</Link>
							<Link href="/about" className="text-primary text-sm no-underline">
								About Us
							</Link>
							<Link href="/blog" className="text-primary text-sm no-underline">
								Blog
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	)
}

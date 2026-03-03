import type { Metadata } from 'next'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
	title: 'Privacy Policy | Hudson Digital Solutions',
	description:
		'Learn how Hudson Digital Solutions collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
	robots: 'index, follow'
}

// Pre-compute date at module load time (safe for RSC)
const lastUpdated = formatDate(new Date())

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Legal
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Privacy Policy
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Your privacy matters to us. Learn how we handle your data.
					</p>
					<p className="text-sm text-muted-foreground mt-3">
						Last updated: {lastUpdated}
					</p>
				</div>
			</section>

			{/* Content */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					<div className="rounded-xl border border-border bg-surface-raised p-8 sm:p-12 space-y-10">
						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Information We Collect
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									We collect information you provide directly to us, such as
									when you:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Fill out our contact form</li>
									<li>Subscribe to our newsletter</li>
									<li>Request a consultation</li>
									<li>Communicate with us via email or phone</li>
								</ul>
								<p>
									This may include your name, email address, phone number,
									company information, and project details.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Automatically Collected Information
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									We automatically collect certain information when you visit
									our website:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>IP address and browser information</li>
									<li>Pages visited and time spent on our site</li>
									<li>Referring website information</li>
									<li>Device and operating system information</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Cookies and Tracking
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>We use cookies and similar technologies to:</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Improve your browsing experience</li>
									<li>Analyze website traffic and usage patterns</li>
									<li>Remember your preferences</li>
									<li>Measure the effectiveness of our marketing campaigns</li>
								</ul>
								<p>
									You can control cookie settings through our cookie consent
									banner or your browser settings.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								How We Use Your Information
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>We use the information we collect to:</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Respond to your inquiries and provide our services</li>
									<li>Send you project updates and important communications</li>
									<li>Improve our website and services</li>
									<li>Comply with legal obligations</li>
									<li>Prevent fraud and ensure security</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Information Sharing
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									We do not sell, trade, or rent your personal information. We
									may share your information only in these limited
									circumstances:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>With your explicit consent</li>
									<li>To comply with legal requirements</li>
									<li>
										With trusted service providers who assist in our operations
										(under strict confidentiality agreements)
									</li>
									<li>To protect our rights, property, or safety</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Third-Party Services
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									Our website uses third-party services that may collect
									information:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>
										<strong className="text-foreground">Analytics:</strong>{' '}
										Product analytics and user experience optimization
									</li>
									<li>
										<strong className="text-foreground">
											Vercel Analytics:
										</strong>{' '}
										Performance monitoring
									</li>
									<li>
										<strong className="text-foreground">Resend:</strong> Email
										communications
									</li>
									<li>
										<strong className="text-foreground">Google Maps:</strong>{' '}
										Location services
									</li>
								</ul>
								<p>
									Each service has its own privacy policy governing the use of
									your information.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Data Security</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									We implement appropriate technical and organizational measures
									to protect your personal information against unauthorized
									access, alteration, disclosure, or destruction. This includes:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>SSL encryption for data transmission</li>
									<li>Secure hosting infrastructure</li>
									<li>Regular security assessments</li>
									<li>Limited access to personal information</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Your Rights</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>You have the right to:</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Access the personal information we hold about you</li>
									<li>Request correction of inaccurate information</li>
									<li>Request deletion of your personal information</li>
									<li>Object to or restrict processing of your information</li>
									<li>Withdraw consent where processing is based on consent</li>
								</ul>
								<p>
									To exercise these rights, contact us at{' '}
									<a
										href="mailto:hello@hudsondigitalsolutions.com"
										className="text-accent hover:text-accent/80 transition-colors"
									>
										hello@hudsondigitalsolutions.com
									</a>
									.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Data Retention</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									We retain your personal information only as long as necessary
									to fulfill the purposes for which it was collected, including:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Providing our services to you</li>
									<li>Complying with legal obligations</li>
									<li>Resolving disputes</li>
									<li>Enforcing our agreements</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Children&apos;s Privacy
							</h2>
							<div className="text-sm text-muted-foreground leading-relaxed">
								<p>
									Our services are not directed to children under 13. We do not
									knowingly collect personal information from children under 13.
									If you become aware that a child has provided us with personal
									information, please contact us.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Changes to This Policy
							</h2>
							<div className="text-sm text-muted-foreground leading-relaxed">
								<p>
									We may update this privacy policy from time to time. We will
									notify you of any changes by posting the new policy on this
									page and updating the &quot;Last updated&quot; date.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Contact Us</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									If you have any questions about this privacy policy or our
									privacy practices, please contact us:
								</p>
								<div className="rounded-lg bg-muted/30 p-4 space-y-2 border border-border">
									<p>
										<strong className="text-foreground">Email:</strong>{' '}
										<a
											href="mailto:hello@hudsondigitalsolutions.com"
											className="text-accent hover:text-accent/80 transition-colors"
										>
											hello@hudsondigitalsolutions.com
										</a>
									</p>
									<p>
										<strong className="text-foreground">Website:</strong>{' '}
										<a
											href="https://hudsondigitalsolutions.com"
											className="text-accent hover:text-accent/80 transition-colors"
										>
											hudsondigitalsolutions.com
										</a>
									</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</section>
		</main>
	)
}

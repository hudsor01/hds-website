import type { Metadata } from 'next'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
	title: 'Terms of Service | Hudson Digital Solutions',
	description:
		'Read the Terms of Service for Hudson Digital Solutions. Understand your rights and obligations when using our website and services.',
	robots: 'index, follow'
}

// Pre-compute date at module load time (safe for RSC)
const lastUpdated = formatDate(new Date())

export default function TermsPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Legal
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Terms of Service
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Please read these terms carefully before using our website or
						services.
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
								Agreement to Terms
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									By accessing or using the Hudson Digital Solutions website at
									hudsondigitalsolutions.com, you agree to be bound by these
									Terms of Service and all applicable laws and regulations. If
									you do not agree with any of these terms, you are prohibited
									from using this site.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Our Services</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									Hudson Digital Solutions provides web design, development, and
									digital automation services for small businesses. Our services
									include, but are not limited to:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>Custom website design and development</li>
									<li>Business process automation</li>
									<li>Website performance optimization</li>
									<li>Ongoing website maintenance and support</li>
									<li>Free tools and calculators on this website</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Use of the Website
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									You may use this website for lawful purposes only. You agree
									not to:
								</p>
								<ul className="list-disc pl-6 space-y-2">
									<li>
										Use the site in any way that violates applicable local,
										national, or international law
									</li>
									<li>
										Transmit any unsolicited or unauthorized advertising or
										promotional material
									</li>
									<li>
										Attempt to gain unauthorized access to any part of the
										website or its related systems
									</li>
									<li>
										Engage in any conduct that restricts or inhibits anyone
										else&apos;s use or enjoyment of the website
									</li>
									<li>
										Use automated tools to scrape or harvest data from the
										website without permission
									</li>
								</ul>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Intellectual Property
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									The content on this website — including text, graphics, logos,
									images, and software — is the property of Hudson Digital
									Solutions and is protected by applicable intellectual property
									laws. You may not reproduce, distribute, or create derivative
									works without our express written permission.
								</p>
								<p>
									Our free tools and calculators are provided for your personal,
									non-commercial use. You may not copy, redistribute, or sell
									these tools without prior written consent.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Client Projects and Work Product
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									When we complete a project for you, ownership of the final
									deliverables transfers to you upon receipt of full payment.
									Specific terms regarding deliverables, revisions, timelines,
									and payment are detailed in your individual project agreement
									or statement of work.
								</p>
								<p>
									We retain the right to display completed work in our portfolio
									unless otherwise agreed in writing.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Disclaimer of Warranties
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									This website and its content are provided &quot;as is&quot;
									without any warranties, express or implied. Hudson Digital
									Solutions makes no warranties regarding the accuracy,
									completeness, or reliability of any content on this site,
									including our free tools and calculators.
								</p>
								<p>
									Calculator results are estimates only and should not be relied
									upon as professional financial, legal, or tax advice.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Limitation of Liability
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									To the fullest extent permitted by law, Hudson Digital
									Solutions shall not be liable for any indirect, incidental,
									special, consequential, or punitive damages arising from your
									use of this website or our services. Our total liability for
									any claim shall not exceed the amount paid by you for the
									specific service giving rise to the claim.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Third-Party Links
							</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									This website may contain links to third-party websites. These
									links are provided for your convenience only. We have no
									control over the content of those sites and accept no
									responsibility for them or for any loss or damage that may
									arise from your use of them.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Privacy</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									Your use of this website is also governed by our{' '}
									<a
										href="/privacy"
										className="text-accent hover:text-accent/80 transition-colors"
									>
										Privacy Policy
									</a>
									, which is incorporated into these Terms of Service by
									reference.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Governing Law</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									These Terms of Service are governed by the laws of the State
									of Texas, United States, without regard to its conflict of law
									provisions. Any disputes arising from these terms shall be
									subject to the exclusive jurisdiction of the courts located in
									Texas.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">
								Changes to These Terms
							</h2>
							<div className="text-sm text-muted-foreground leading-relaxed">
								<p>
									We reserve the right to update these Terms of Service at any
									time. Changes will be posted on this page with an updated
									&quot;Last updated&quot; date. Your continued use of the
									website after any changes constitutes your acceptance of the
									new terms.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-h3 text-foreground mb-4">Contact Us</h2>
							<div className="text-sm text-muted-foreground space-y-4 leading-relaxed">
								<p>
									If you have any questions about these Terms of Service, please
									contact us:
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

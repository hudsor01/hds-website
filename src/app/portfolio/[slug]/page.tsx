import { ArrowLeft, Calendar, Code2, ExternalLink, Eye } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Analytics } from '@/components/utilities/Analytics'
import {
	getAllShowcaseSlugs,
	getShowcaseBySlug,
	getShowcaseItems
} from '@/lib/showcase'
import { formatDate } from '@/lib/utils'

// Enable ISR with 1-hour revalidation for database data
// React cache() handles request deduplication at data layer
export const revalidate = 3600

// Generate static params for all projects
export async function generateStaticParams() {
	const slugs = await getAllShowcaseSlugs()
	const results = slugs.map(slug => ({ slug }))

	// Next.js 16: cacheComponents requires at least one static param
	if (results.length === 0) {
		return [{ slug: '__placeholder__' }]
	}

	return results
}

// Generate metadata for SEO
export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const project = await getShowcaseBySlug(slug)

	if (!project) {
		return {
			title: 'Project Not Found',
			description: 'The requested project could not be found.'
		}
	}

	const title = `${project.title} - Case Study | Hudson Digital`
	const description = project.description || 'View this project case study.'
	const ogImage = project.ogImageUrl || project.imageUrl || '/og-image.jpg'

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [ogImage],
			type: 'article',
			publishedTime:
				project.publishedAt?.toISOString() ?? project.createdAt?.toISOString(),
			modifiedTime: project.updatedAt?.toISOString()
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImage]
		},
		alternates: {
			canonical: `/portfolio/${project.slug}`
		}
	}
}

// Async component that fetches project data
async function ProjectContent({ slug }: { slug: string }) {
	const project = await getShowcaseBySlug(slug)

	if (!project) {
		notFound()
	}

	const stats = project.metrics
	const allProjects = await getShowcaseItems()
	const relatedProjects = allProjects
		.filter(
			p =>
				p.id !== project.id &&
				(p.category === project.category ||
					p.technologies.some(t => project.technologies.includes(t)))
		)
		.slice(0, 3)

	// Schema markup for rich results
	const schemaMarkup = {
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: project.title,
		description: project.description,
		image: project.imageUrl,
		author: {
			'@type': 'Organization',
			name: 'Hudson Digital Solutions',
			url: 'https://hudsondigitalsolutions.com'
		},
		datePublished:
			project.publishedAt?.toISOString() ?? project.createdAt?.toISOString(),
		dateModified: project.updatedAt?.toISOString(),
		url: `https://hudsondigitalsolutions.com/portfolio/${project.slug}`
	}

	return (
		<>
			{/* Schema Markup */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
			/>

			{/* Hero Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Project Info */}
						<div className="space-y-comfortable">
							<span className="inline-flex items-center gap-tight px-3 py-1 rounded-full border border-border bg-surface-raised text-sm text-muted-foreground">
								<Code2 className="w-4 h-4" aria-hidden="true" />
								{project.category}
							</span>

							<h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
								{project.title}
							</h1>

							<p className="text-xl text-muted-foreground leading-relaxed">
								{project.description}
							</p>

							{project.longDescription && (
								<div className="typography">
									<p className="text-muted-foreground leading-relaxed">
										{project.longDescription}
									</p>
								</div>
							)}

							{/* Meta Info */}
							<div className="flex flex-wrap gap-comfortable text-sm text-muted-foreground">
								{project.publishedAt && (
									<div className="flex items-center gap-tight">
										<Calendar className="w-4 h-4" aria-hidden="true" />
										{formatDate(project.publishedAt.toISOString(), 'long')}
									</div>
								)}
								{project.viewCount > 0 && (
									<div className="flex items-center gap-tight">
										<Eye className="w-4 h-4" aria-hidden="true" />
										{project.viewCount.toLocaleString()} views
									</div>
								)}
							</div>

							{/* CTA Buttons */}
							<div className="flex flex-wrap gap-content">
								{project.externalLink && (
									<Button asChild variant="default" size="lg">
										<Link
											href={project.externalLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											View Live Site
											<ExternalLink className="w-5 h-5" />
										</Link>
									</Button>
								)}
								{project.githubLink && (
									<Button asChild variant="outline" size="lg">
										<Link
											href={project.githubLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											View Code
											<Code2 className="w-5 h-5" />
										</Link>
									</Button>
								)}
							</div>
						</div>

						{/* Project Image */}
						{project.imageUrl && (
							<div
								className={`relative overflow-hidden rounded-2xl ${project.gradientClass} p-1`}
							>
								<div className="relative h-96 lg:h-125 overflow-hidden bg-background/20">
									<Image
										src={project.imageUrl}
										alt={project.title}
										fill
										className="object-cover"
										sizes="(max-width: 1024px) 100vw, 50vw"
										priority
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			{Object.keys(stats).length > 0 && (
				<section className="py-section-sm px-4 sm:px-6">
					<div className="container-wide">
						<div className="rounded-xl border border-border bg-surface-raised p-8">
							<h2 className="text-section-title text-foreground mb-comfortable">
								Project Impact
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-sections">
								{Object.entries(stats).map(([key, value]) => (
									<div key={key} className="text-center">
										<div className="text-3xl md:text-4xl font-bold text-foreground mb-subheading">
											{value}
										</div>
										<div className="text-sm text-muted-foreground capitalize">
											{key.replace(/([A-Z])/g, ' $1').trim()}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Tech Stack */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="rounded-xl border border-border bg-surface-raised p-8">
						<h2 className="text-section-title text-foreground mb-content-block">
							Technologies Used
						</h2>
						<div className="flex flex-wrap gap-3">
							{project.technologies.map(tech => (
								<span
									key={tech}
									className="px-4 py-2 rounded-full border border-border bg-background text-sm text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
								>
									{tech}
								</span>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Related Projects */}
			{relatedProjects.length > 0 && (
				<section className="py-section-sm px-4 sm:px-6">
					<div className="container-wide">
						<div className="text-center mb-10">
							<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
								More Work
							</p>
							<h2 className="text-section-title text-foreground mb-comfortable text-balance">
								Related Projects
							</h2>
						</div>
						<div className="grid md:grid-cols-3 gap-sections">
							{relatedProjects.map(relatedProject => (
								<Link
									key={relatedProject.id}
									href={`/portfolio/${relatedProject.slug}`}
									className="group block"
								>
									<div className="rounded-xl border border-border bg-surface-raised hover:border-border-strong transition-colors overflow-hidden">
										{relatedProject.imageUrl && (
											<div
												className={`${relatedProject.gradientClass} h-48 relative overflow-hidden`}
											>
												<Image
													src={relatedProject.imageUrl}
													alt={relatedProject.title}
													fill
													className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
													sizes="(max-width: 768px) 100vw, 33vw"
												/>
											</div>
										)}
										<div className="p-6">
											<div className="text-sm text-accent mb-subheading">
												{relatedProject.category}
											</div>
											<h3 className="text-xl font-bold text-foreground mb-subheading group-hover:text-accent transition-colors">
												{relatedProject.title}
											</h3>
											<p className="text-muted-foreground text-sm line-clamp-2">
												{relatedProject.description}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* CTA Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to create your{' '}
								<span className="text-accent">success story?</span>
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Let&apos;s build something amazing together. Get in touch to
								discuss your project.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Start Your Project
									<ExternalLink className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default async function ProjectPage({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return (
		<main className="min-h-screen bg-background">
			<Analytics />

			{/* Back Button - Static, prerendered */}
			<div className="container-wide px-4 sm:px-6 pt-24 pb-8">
				<Link
					href="/showcase"
					className="inline-flex items-center gap-tight text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="w-4 h-4" aria-hidden="true" />
					Back to Showcase
				</Link>
			</div>

			{/* Dynamic content with Suspense */}
			<Suspense
				fallback={
					<div className="container-wide px-4 sm:px-6 py-section text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent" />
						<p className="text-muted-foreground text-lg mt-4">
							Loading project...
						</p>
					</div>
				}
			>
				<ProjectContent slug={slug} />
			</Suspense>
		</main>
	)
}

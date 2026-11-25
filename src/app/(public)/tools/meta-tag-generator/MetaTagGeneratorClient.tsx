/**
 * Meta Tag Generator
 * Generate title, description, canonical, Open Graph and X (Twitter) card tags.
 * Markup is built (and HTML-escaped) in src/lib/meta-tag-generator.ts.
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import { Code, ExternalLink, Eye } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Card } from '@/components/ui/card'
import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import {
	buildMetaTags,
	type MetaTagInput,
	previewHostname
} from '@/lib/meta-tag-generator'

type Tab = 'code' | 'preview'

type TextField = Exclude<keyof MetaTagInput, 'includeDocumentBasics'>

const TABS: ReadonlyArray<{ id: Tab; label: string; Icon: LucideIcon }> = [
	{ id: 'code', label: 'HTML code', Icon: Code },
	{ id: 'preview', label: 'Preview', Icon: Eye }
]

const TITLE_LINK_DOC =
	'https://developers.google.com/search/docs/appearance/title-link'
const SNIPPET_DOC =
	'https://developers.google.com/search/docs/appearance/snippet'
const OGP_DOC = 'https://ogp.me/'
const FACEBOOK_IMAGE_DOC =
	'https://developers.facebook.com/docs/sharing/webmasters/images/'

const INITIAL_INPUTS: Required<Omit<MetaTagInput, 'includeDocumentBasics'>> = {
	title: '',
	description: '',
	pageUrl: '',
	imageUrl: '',
	imageAlt: '',
	siteName: '',
	siteHandle: '',
	creatorHandle: '',
	author: ''
}

export default function MetaTagGeneratorClient() {
	const [inputs, setInputs] = useState(INITIAL_INPUTS)
	const [includeDocumentBasics, setIncludeDocumentBasics] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [activeTab, setActiveTab] = useState<Tab>('code')
	const [copyStatus, setCopyStatus] = useState('')
	const [imageFailed, setImageFailed] = useState(false)
	const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
		code: null,
		preview: null
	})

	const baseId = useId()
	const descriptionCountId = `${baseId}-description-count`
	const basicsFieldId = `${baseId}-basics`
	const tabId = (tab: Tab) => `${baseId}-tab-${tab}`
	const panelId = (tab: Tab) => `${baseId}-panel-${tab}`

	const result = useMemo(
		() => buildMetaTags({ ...inputs, includeDocumentBasics }),
		[inputs, includeDocumentBasics]
	)

	const handleInputChange = (field: TextField, value: string) => {
		setInputs(prev => ({ ...prev, [field]: value }))
		if (field === 'imageUrl') {
			setImageFailed(false)
		}
		setCopyStatus('')
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		setSubmitted(true)
		trackEvent('calculator_used', {
			calculator_type: 'meta-tag-generator',
			has_og_image: Boolean(inputs.imageUrl.trim()),
			has_twitter: Boolean(inputs.siteHandle.trim())
		})
	}

	const errors = submitted && !result.ok ? result.errors : {}
	const hasResult = submitted && result.ok

	const copyToClipboard = async () => {
		if (!result.ok) {
			return
		}
		try {
			await navigator.clipboard.writeText(result.html)
			setCopyStatus('Meta tags copied to the clipboard.')
			toast.success('Meta tags copied')
			trackEvent('calculator_used', {
				calculator_type: 'meta-tag-generator',
				action: 'copy'
			})
		} catch (error) {
			logger.error('Copy meta tags failed', error)
			setCopyStatus('Copy failed. Select the code and copy it instead.')
			toast.error(
				'Could not copy the tags. Select the code and copy it instead.'
			)
		}
	}

	const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
			return
		}
		event.preventDefault()
		const next: Tab = activeTab === 'code' ? 'preview' : 'code'
		setActiveTab(next)
		tabRefs.current[next]?.focus()
	}

	const titleLength = inputs.title.trim().length
	const descriptionLength = inputs.description.trim().length

	const actions: ToolAction[] = hasResult
		? [{ type: 'copy', label: 'Copy code', onClick: copyToClipboard }]
		: []

	const formSlot = (
		<div className="space-y-comfortable">
			<form onSubmit={handleSubmit} className="space-y-comfortable" noValidate>
				{/* Required Fields */}
				<div className="space-y-content">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Required
					</h2>

					<CalculatorInput
						label="Page title"
						id="pageTitle"
						type="text"
						value={inputs.title}
						onChange={e => handleInputChange('title', e.target.value)}
						helpText={`${titleLength} characters. Google sets no length limit and cuts long titles to fit the screen, often around 50 to 60 characters.`}
						error={errors.title}
						required
					/>

					<div className="space-y-tight">
						<label
							htmlFor="pageDescription"
							className="block text-sm font-medium text-foreground"
						>
							Page description
						</label>
						<textarea
							id="pageDescription"
							name="pageDescription"
							value={inputs.description}
							onChange={e => handleInputChange('description', e.target.value)}
							className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
							rows={3}
							required
							aria-invalid={errors.description ? true : undefined}
							aria-describedby={descriptionCountId}
							placeholder="A plain summary of what the page offers"
						/>
						<p
							id={descriptionCountId}
							className="text-xs text-muted-foreground"
						>
							{descriptionLength} characters. Google sets no length limit and
							trims the snippet to fit the screen.
							{errors.description ? (
								<span role="alert" className="block text-destructive">
									{errors.description}
								</span>
							) : null}
						</p>
					</div>

					<CalculatorInput
						label="Page URL"
						id="pageUrl"
						type="url"
						value={inputs.pageUrl}
						onChange={e => handleInputChange('pageUrl', e.target.value)}
						helpText="Full URL including https://. Also used for the canonical link."
						error={errors.pageUrl}
						required
						placeholder="https://example.com/page"
					/>
				</div>

				{/* Optional Fields */}
				<div className="space-y-content border-t border-border pt-6">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Optional
					</h2>

					<div className="grid gap-content md:grid-cols-2">
						<CalculatorInput
							label="Image URL"
							id="imageUrl"
							type="url"
							value={inputs.imageUrl}
							onChange={e => handleInputChange('imageUrl', e.target.value)}
							helpText="Open Graph lists og:image as required. Facebook recommends at least 1200 x 630 pixels."
							error={errors.imageUrl}
							placeholder="https://example.com/og-image.jpg"
						/>

						<CalculatorInput
							label="Image alt text"
							id="imageAlt"
							type="text"
							value={inputs.imageAlt}
							onChange={e => handleInputChange('imageAlt', e.target.value)}
							helpText="Describe what is in the image, not a caption."
							placeholder="Plumber fixing a kitchen sink"
						/>

						<CalculatorInput
							label="Site name"
							id="siteName"
							type="text"
							value={inputs.siteName}
							onChange={e => handleInputChange('siteName', e.target.value)}
							helpText="Your website or brand name"
							placeholder="Hudson Digital Solutions"
						/>

						<CalculatorInput
							label="Author name"
							id="author"
							type="text"
							value={inputs.author}
							onChange={e => handleInputChange('author', e.target.value)}
							helpText="Content author name"
							placeholder="Jane Doe"
						/>

						<CalculatorInput
							label="Site X (Twitter) handle"
							id="siteHandle"
							type="text"
							value={inputs.siteHandle}
							onChange={e => handleInputChange('siteHandle', e.target.value)}
							helpText="Becomes twitter:site. The @ is added for you."
							error={errors.siteHandle}
							placeholder="@yourbusiness"
						/>

						<CalculatorInput
							label="Author X (Twitter) handle"
							id="creatorHandle"
							type="text"
							value={inputs.creatorHandle}
							onChange={e => handleInputChange('creatorHandle', e.target.value)}
							helpText="Becomes twitter:creator. Leave blank if the author has none."
							error={errors.creatorHandle}
							placeholder="@authorname"
						/>
					</div>

					<label
						htmlFor={basicsFieldId}
						className="flex items-center gap-tight text-sm text-muted-foreground"
					>
						<input
							id={basicsFieldId}
							type="checkbox"
							checked={includeDocumentBasics}
							onChange={e => setIncludeDocumentBasics(e.target.checked)}
							className="rounded border-border text-accent"
						/>
						Include charset and viewport lines (once per page, only if your
						template lacks them)
					</label>
				</div>

				<button
					type="submit"
					className="w-full rounded-md bg-accent px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-accent/80"
				>
					Generate meta tags
				</button>
			</form>

			{/* Educational Content */}
			<section
				aria-labelledby={`${baseId}-tips`}
				className="space-y-content border-t border-border pt-8"
			>
				<h2
					id={`${baseId}-tips`}
					className="text-lg font-semibold text-foreground"
				>
					What the sources say
				</h2>

				<div className="grid gap-content sm:grid-cols-2">
					<TipCard title="Title tag" href={TITLE_LINK_DOC} source="Google">
						There is no limit on title length. Google truncates title links to
						fit the device width and suggests avoiding long or verbose titles.
					</TipCard>
					<TipCard title="Meta description" href={SNIPPET_DOC} source="Google">
						There is no length limit either. Google truncates snippets to fit
						the device width and may build the snippet from page text instead.
					</TipCard>
					<TipCard title="Open Graph image" href={OGP_DOC} source="ogp.me">
						og:image is one of four required Open Graph properties. A page with
						og:image should also set og:image:alt.
					</TipCard>
					<TipCard
						title="Image size"
						href={FACEBOOK_IMAGE_DOC}
						source="Facebook"
					>
						Facebook recommends share images of at least 1200 x 630 pixels for
						high resolution screens.
					</TipCard>
				</div>
			</section>
		</div>
	)

	const resultSlot = result.ok ? (
		<div className="space-y-comfortable">
			{result.warnings.length > 0 ? (
				<ul className="space-y-tight rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-text">
					{result.warnings.map(warning => (
						<li key={warning}>{warning}</li>
					))}
				</ul>
			) : null}

			<div
				role="tablist"
				aria-label="Generated output"
				className="flex border-b border-border"
			>
				{TABS.map(({ id, label, Icon }) => {
					const selected = activeTab === id
					return (
						<button
							key={id}
							ref={node => {
								tabRefs.current[id] = node
							}}
							type="button"
							role="tab"
							id={tabId(id)}
							aria-selected={selected}
							aria-controls={panelId(id)}
							tabIndex={selected ? 0 : -1}
							onClick={() => setActiveTab(id)}
							onKeyDown={handleTabKeyDown}
							className={`flex items-center gap-tight px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								selected
									? 'border-accent text-accent'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							<Icon className="w-4 h-4" aria-hidden="true" />
							{label}
						</button>
					)
				})}
			</div>

			{activeTab === 'code' ? (
				<div
					role="tabpanel"
					id={panelId('code')}
					aria-labelledby={tabId('code')}
				>
					<pre className="rounded-lg bg-background p-4 overflow-x-auto">
						<code className="text-sm text-foreground whitespace-pre-wrap break-all">
							{result.html}
						</code>
					</pre>
				</div>
			) : (
				<div
					role="tabpanel"
					id={panelId('preview')}
					aria-labelledby={tabId('preview')}
					className="space-y-comfortable"
				>
					{/* Google Preview */}
					<div>
						<h3 className="text-sm font-semibold text-muted-foreground mb-3">
							Search result preview (approximate)
						</h3>
						<Card size="sm">
							<p className="text-info-text text-lg truncate">
								{inputs.title.trim()}
							</p>
							<p className="text-success-text text-sm truncate">
								{inputs.pageUrl.trim()}
							</p>
							<p className="text-muted-foreground text-sm mt-1 line-clamp-2">
								{inputs.description.trim()}
							</p>
						</Card>
					</div>

					{/* Social Preview */}
					<div>
						<h3 className="text-sm font-semibold text-muted-foreground mb-3">
							Social share preview (approximate)
						</h3>
						<div className="rounded-lg border border-border overflow-hidden max-w-md">
							{result.imageUrl && !imageFailed ? (
								// biome-ignore lint/performance/noImgElement: arbitrary user-supplied image URL; next/image needs a configured remote host.
								<img
									src={result.imageUrl}
									alt={inputs.imageAlt.trim() || 'Share image preview'}
									className="h-48 w-full object-cover bg-surface-raised"
									onError={() => setImageFailed(true)}
								/>
							) : (
								<div className="h-48 bg-muted flex items-center justify-center p-4 text-center">
									<span className="text-foreground text-sm">
										{result.imageUrl
											? 'The image could not be loaded. Check the image URL.'
											: 'No image. X shows a small summary card.'}
									</span>
								</div>
							)}
							<Card size="sm" className="bg-surface-raised">
								<p className="text-xs text-muted-foreground uppercase mb-1">
									{inputs.siteName.trim() ||
										previewHostname(inputs.pageUrl, 'example.com')}
								</p>
								<p className="font-semibold text-foreground truncate">
									{inputs.title.trim()}
								</p>
								<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
									{inputs.description.trim()}
								</p>
							</Card>
						</div>
					</div>
				</div>
			)}

			<p
				role="status"
				aria-live="polite"
				className="text-xs text-muted-foreground"
			>
				{copyStatus}
			</p>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Meta Tag Generator"
			description="Generate title, description, Open Graph and X (Twitter) Card tags for your website"
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder={
				submitted
					? 'Fix the highlighted fields to generate meta tags'
					: 'Fill in the form to generate meta tags'
			}
			actions={actions}
		/>
	)
}

interface TipCardProps {
	title: string
	href: string
	source: string
	children: React.ReactNode
}

function TipCard({ title, href, source, children }: TipCardProps) {
	return (
		<Card size="sm">
			<h3 className="mb-subheading font-semibold text-foreground">{title}</h3>
			<p className="text-sm text-muted-foreground">{children}</p>
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
			>
				Source: {source}
				<span className="sr-only"> (opens in a new tab)</span>
				<ExternalLink className="h-3 w-3" aria-hidden="true" />
			</a>
		</Card>
	)
}

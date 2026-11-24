/**
 * Proposal Generator
 * Create professional project proposals with PDF download
 */

'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { DocumentDownloadPanel } from '@/components/tools/DocumentDownloadPanel'
import { DraftActions } from '@/components/tools/DraftActions'
import { TextAreaField } from '@/components/tools/TextAreaField'
import { Card } from '@/components/ui/card'
import { useClientDefaults } from '@/hooks/use-client-defaults'
import { useHydrated } from '@/hooks/use-hydrated'
import {
	createLocalStorageDraft,
	useLocalStorageDraft
} from '@/hooks/use-local-storage-draft'
import { usePdfDownload } from '@/hooks/use-pdf-download'
import { trackEvent } from '@/lib/analytics'
import { addDaysToDateInput, toDateInputValue } from '@/lib/documents/dates'
import { toFileSlug } from '@/lib/documents/format'
import { formatCents, parseNumberInput } from '@/lib/documents/money'
import {
	computeProposalPricing,
	getProposalIssues
} from '@/lib/documents/proposal'
import { proposalDraftSchema } from '@/lib/schemas/documents'
import type {
	ProposalData,
	ProposalMilestone,
	ProposalPricingItem
} from '@/types/pdf-templates'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const proposalDraft = createLocalStorageDraft(
	'hds-proposal-draft',
	proposalDraftSchema,
	'proposal'
)

const VALIDITY_DAYS = 30

const ROW_INPUT_CLASS =
	'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground'

const createPricingItem = (): ProposalPricingItem => ({
	id: crypto.randomUUID(),
	description: '',
	price: 0
})

const createMilestone = (phaseNumber: number): ProposalMilestone => ({
	id: crypto.randomUUID(),
	phase: `Phase ${phaseNumber}`,
	description: '',
	duration: ''
})

const EMPTY_PROPOSAL: ProposalData = {
	companyName: '',
	companyAddress: '',
	companyCity: '',
	companyState: '',
	companyZip: '',
	companyEmail: '',
	companyPhone: '',
	companyDescription: '',
	clientName: '',
	clientCompany: '',
	clientEmail: '',
	projectName: '',
	projectDate: '',
	validUntil: '',
	overview: '',
	scopeItems: ['', '', ''],
	milestones: [
		{ id: 'milestone-1', phase: 'Phase 1', description: '', duration: '' },
		{ id: 'milestone-2', phase: 'Phase 2', description: '', duration: '' }
	],
	pricingItems: [{ id: 'price-1', description: '', price: 0 }],
	paymentTerms: '50% deposit to begin work, 50% upon completion',
	terms:
		'This proposal is based on the scope defined above. Any changes to the scope may affect the timeline and pricing. All work remains the property of the provider until full payment is received. Client agrees to provide timely feedback and necessary materials to maintain the project timeline.'
}

/** Fresh defaults for each visit: today's local date, valid for 30 days. */
const createProposalDefaults = (): ProposalData => {
	const projectDate = toDateInputValue(new Date())
	return {
		...EMPTY_PROPOSAL,
		projectDate,
		validUntil: addDaysToDateInput(projectDate, VALIDITY_DAYS),
		milestones: [createMilestone(1), createMilestone(2)],
		pricingItems: [createPricingItem()]
	}
}

type TextField = {
	[K in keyof ProposalData]: ProposalData[K] extends string ? K : never
}[keyof ProposalData]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProposalGeneratorClient() {
	const isHydrated = useHydrated()
	const [defaults, regenerateDefaults] = useClientDefaults(
		createProposalDefaults,
		EMPTY_PROPOSAL
	)
	const savedDraft = useLocalStorageDraft(proposalDraft)
	const hasDraft = savedDraft !== null

	const [edits, setEdits] = useState<ProposalData | null>(null)
	const baseData = savedDraft ?? defaults
	const proposalData = edits ?? baseData

	const updateProposal = useCallback(
		(updater: (prev: ProposalData) => ProposalData) => {
			setEdits(prev => updater(prev ?? baseData))
		},
		[baseData]
	)

	const pricing = useMemo(
		() => computeProposalPricing(proposalData.pricingItems),
		[proposalData.pricingItems]
	)
	const issues = useMemo(() => getProposalIssues(proposalData), [proposalData])
	const { isGenerating, download } = usePdfDownload()

	const handleTextChange = (field: TextField, value: string) => {
		updateProposal(prev => ({ ...prev, [field]: value }))
	}

	const handleScopeItemChange = (index: number, value: string) => {
		updateProposal(prev => ({
			...prev,
			scopeItems: prev.scopeItems.map((item, i) => (i === index ? value : item))
		}))
	}

	const addScopeItem = () => {
		updateProposal(prev => ({ ...prev, scopeItems: [...prev.scopeItems, ''] }))
	}

	const removeScopeItem = (index: number) => {
		updateProposal(prev =>
			prev.scopeItems.length === 1
				? prev
				: { ...prev, scopeItems: prev.scopeItems.filter((_, i) => i !== index) }
		)
	}

	const handleMilestoneChange = (
		id: string,
		field: Exclude<keyof ProposalMilestone, 'id'>,
		value: string
	) => {
		updateProposal(prev => ({
			...prev,
			milestones: prev.milestones.map(m =>
				m.id === id ? { ...m, [field]: value } : m
			)
		}))
	}

	const addMilestone = () => {
		updateProposal(prev => ({
			...prev,
			milestones: [
				...prev.milestones,
				createMilestone(prev.milestones.length + 1)
			]
		}))
	}

	const removeMilestone = (id: string) => {
		updateProposal(prev =>
			prev.milestones.length === 1
				? prev
				: { ...prev, milestones: prev.milestones.filter(m => m.id !== id) }
		)
	}

	const handlePricingChange = (
		id: string,
		patch: Partial<Omit<ProposalPricingItem, 'id'>>
	) => {
		updateProposal(prev => ({
			...prev,
			pricingItems: prev.pricingItems.map(item =>
				item.id === id ? { ...item, ...patch } : item
			)
		}))
	}

	const addPricingItem = () => {
		updateProposal(prev => ({
			...prev,
			pricingItems: [...prev.pricingItems, createPricingItem()]
		}))
	}

	const removePricingItem = (id: string) => {
		updateProposal(prev =>
			prev.pricingItems.length === 1
				? prev
				: {
						...prev,
						pricingItems: prev.pricingItems.filter(item => item.id !== id)
					}
		)
	}

	const saveDraft = () => {
		if (!proposalDraft.write(proposalData)) {
			toast.error('Your browser blocked saving the draft.')
			return
		}
		toast.success('Draft saved in this browser.')
		trackEvent('proposal_draft_saved', {
			pricing_items: pricing.rows.length
		})
	}

	const clearDraft = () => {
		proposalDraft.clear()
		setEdits(null)
		regenerateDefaults()
		toast.success('Draft cleared.')
	}

	const handleDownload = () => {
		if (!isHydrated || issues.length > 0) {
			return
		}
		const snapshot = proposalData
		void download({
			documentLabel: 'proposal',
			fileName: `proposal_${toFileSlug(snapshot.projectName, 'project')}.pdf`,
			createBlob: async () => {
				// Import the template module directly: a next/dynamic wrapper
				// suspends via use(), which react-pdf's reconciler rejects (#438).
				const [{ pdf }, { ProposalDocument }] = await Promise.all([
					import('@react-pdf/renderer'),
					import('@/lib/pdf/proposal-template')
				])
				return pdf(<ProposalDocument data={snapshot} />).toBlob()
			},
			onSuccess: () => {
				trackEvent('proposal_downloaded', {
					scope_items: snapshot.scopeItems.filter(s => s.trim()).length,
					milestones: snapshot.milestones.filter(m => m.description.trim())
						.length,
					pricing_items: pricing.rows.length
				})
			}
		})
	}

	const resultSlot = (
		<DocumentDownloadPanel
			documentLabel="proposal"
			issues={issues}
			isGenerating={isGenerating}
			onDownload={handleDownload}
			summary={
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Project</dt>
						<dd className="font-medium text-foreground">
							{proposalData.projectName}
						</dd>
					</div>
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Client</dt>
						<dd className="font-medium text-foreground">
							{proposalData.clientCompany || proposalData.clientName}
						</dd>
					</div>
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Total</dt>
						<dd className="font-bold text-accent">
							{formatCents(pricing.totalCents)}
						</dd>
					</div>
				</dl>
			}
		/>
	)

	const formSlot = (
		<div className="space-y-sections">
			{/* Your Business Info */}
			<section className="space-y-content">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Your Business
				</h2>
				<div className="grid gap-content sm:grid-cols-2">
					<CalculatorInput
						label="Business Name"
						id="companyName"
						type="text"
						autoComplete="organization"
						value={proposalData.companyName}
						onChange={e => handleTextChange('companyName', e.target.value)}
						placeholder="Your business name"
						helpText="Required. Prints on the cover and every page."
						required
					/>
					<CalculatorInput
						label="Email"
						id="companyEmail"
						type="email"
						autoComplete="email"
						value={proposalData.companyEmail}
						onChange={e => handleTextChange('companyEmail', e.target.value)}
						placeholder="you@yourbusiness.com"
					/>
					<CalculatorInput
						label="Phone"
						id="companyPhone"
						type="tel"
						autoComplete="tel"
						value={proposalData.companyPhone}
						onChange={e => handleTextChange('companyPhone', e.target.value)}
						placeholder="(555) 555-0123"
					/>
					<CalculatorInput
						label="Address"
						id="companyAddress"
						type="text"
						autoComplete="street-address"
						value={proposalData.companyAddress}
						onChange={e => handleTextChange('companyAddress', e.target.value)}
						placeholder="123 Main St"
					/>
					<div className="grid grid-cols-3 gap-tight">
						<CalculatorInput
							label="City"
							id="companyCity"
							type="text"
							value={proposalData.companyCity}
							onChange={e => handleTextChange('companyCity', e.target.value)}
						/>
						<CalculatorInput
							label="State"
							id="companyState"
							type="text"
							value={proposalData.companyState}
							onChange={e => handleTextChange('companyState', e.target.value)}
						/>
						<CalculatorInput
							label="ZIP"
							id="companyZip"
							type="text"
							inputMode="numeric"
							value={proposalData.companyZip}
							onChange={e => handleTextChange('companyZip', e.target.value)}
						/>
					</div>
				</div>
				<TextAreaField
					id="companyDescription"
					label="About Your Business (Optional)"
					value={proposalData.companyDescription}
					onChange={e => handleTextChange('companyDescription', e.target.value)}
					placeholder="Two or three sentences on what you do, who you do it for and why a client should pick you."
				/>
			</section>

			{/* Client Info */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Client Information
				</h2>
				<div className="grid gap-content sm:grid-cols-3">
					<CalculatorInput
						label="Client Name"
						id="clientName"
						type="text"
						value={proposalData.clientName}
						onChange={e => handleTextChange('clientName', e.target.value)}
						helpText="Enter a client name, a company or both."
					/>
					<CalculatorInput
						label="Client Company"
						id="clientCompany"
						type="text"
						value={proposalData.clientCompany}
						onChange={e => handleTextChange('clientCompany', e.target.value)}
						helpText="Shown on the cover when you enter it."
					/>
					<CalculatorInput
						label="Client Email"
						id="clientEmail"
						type="email"
						value={proposalData.clientEmail}
						onChange={e => handleTextChange('clientEmail', e.target.value)}
					/>
				</div>
			</section>

			{/* Project Info */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Project Details
				</h2>
				<div className="grid gap-content sm:grid-cols-3">
					<CalculatorInput
						label="Project Name"
						id="projectName"
						type="text"
						value={proposalData.projectName}
						onChange={e => handleTextChange('projectName', e.target.value)}
						helpText="Required"
						required
					/>
					<CalculatorInput
						label="Proposal Date"
						id="projectDate"
						type="date"
						value={proposalData.projectDate}
						onChange={e => handleTextChange('projectDate', e.target.value)}
					/>
					<CalculatorInput
						label="Valid Until"
						id="validUntil"
						type="date"
						min={proposalData.projectDate || undefined}
						value={proposalData.validUntil}
						onChange={e => handleTextChange('validUntil', e.target.value)}
					/>
				</div>
				<TextAreaField
					id="overview"
					label="Project Overview"
					rows={4}
					value={proposalData.overview}
					onChange={e => handleTextChange('overview', e.target.value)}
					placeholder="Describe the project goals, background and objectives..."
				/>
			</section>

			{/* Scope of Work */}
			<section className="space-y-content border-t border-border pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Scope of Work
					</h2>
					<button
						type="button"
						onClick={addScopeItem}
						className="flex items-center gap-1 text-sm text-accent hover:text-accent/80"
					>
						<Plus className="w-4 h-4" aria-hidden="true" />
						Add Item
					</button>
				</div>
				{proposalData.scopeItems.map((item, index) => {
					const number = index + 1
					return (
						// Scope items are plain strings with no ID; position is the identity.
						<div key={index} className="flex gap-tight">
							<label htmlFor={`scope-${index}`} className="sr-only">
								Scope item {number}
							</label>
							<input
								id={`scope-${index}`}
								name={`scope-${index}`}
								type="text"
								value={item}
								onChange={e => handleScopeItemChange(index, e.target.value)}
								placeholder={`Scope item ${number}...`}
								className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground"
							/>
							<button
								type="button"
								onClick={() => removeScopeItem(index)}
								disabled={proposalData.scopeItems.length === 1}
								className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
								aria-label={`Remove scope item ${number}`}
							>
								<Trash2 className="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					)
				})}
			</section>

			{/* Timeline / Milestones */}
			<section className="space-y-content border-t border-border pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Timeline / Milestones
					</h2>
					<button
						type="button"
						onClick={addMilestone}
						className="flex items-center gap-1 text-sm text-accent hover:text-accent/80"
					>
						<Plus className="w-4 h-4" aria-hidden="true" />
						Add Phase
					</button>
				</div>
				{proposalData.milestones.map((milestone, index) => {
					const number = index + 1
					return (
						<div
							key={milestone.id}
							className="grid grid-cols-1 gap-tight items-end border-b border-border pb-3 last:border-0 sm:grid-cols-12 sm:border-0 sm:pb-0"
						>
							<div className="sm:col-span-2">
								<label
									htmlFor={`phase-${milestone.id}`}
									className="text-xs text-muted-foreground sm:sr-only"
								>
									Milestone {number} phase
								</label>
								<input
									id={`phase-${milestone.id}`}
									type="text"
									value={milestone.phase}
									onChange={e =>
										handleMilestoneChange(milestone.id, 'phase', e.target.value)
									}
									placeholder="Phase"
									className={ROW_INPUT_CLASS}
								/>
							</div>
							<div className="sm:col-span-7">
								<label
									htmlFor={`milestone-description-${milestone.id}`}
									className="text-xs text-muted-foreground sm:sr-only"
								>
									Milestone {number} deliverables
								</label>
								<input
									id={`milestone-description-${milestone.id}`}
									type="text"
									value={milestone.description}
									onChange={e =>
										handleMilestoneChange(
											milestone.id,
											'description',
											e.target.value
										)
									}
									placeholder="Description of deliverables..."
									className={ROW_INPUT_CLASS}
								/>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor={`duration-${milestone.id}`}
									className="text-xs text-muted-foreground sm:sr-only"
								>
									Milestone {number} duration
								</label>
								<input
									id={`duration-${milestone.id}`}
									type="text"
									value={milestone.duration}
									onChange={e =>
										handleMilestoneChange(
											milestone.id,
											'duration',
											e.target.value
										)
									}
									placeholder="Duration"
									className={ROW_INPUT_CLASS}
								/>
							</div>
							<div className="flex justify-end sm:col-span-1">
								<button
									type="button"
									onClick={() => removeMilestone(milestone.id)}
									disabled={proposalData.milestones.length === 1}
									className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
									aria-label={`Remove milestone ${number}`}
								>
									<Trash2 className="w-4 h-4" aria-hidden="true" />
								</button>
							</div>
						</div>
					)
				})}
			</section>

			{/* Pricing */}
			<section className="space-y-content border-t border-border pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Pricing
					</h2>
					<button
						type="button"
						onClick={addPricingItem}
						className="flex items-center gap-1 text-sm text-accent hover:text-accent/80"
					>
						<Plus className="w-4 h-4" aria-hidden="true" />
						Add Item
					</button>
				</div>
				{proposalData.pricingItems.map((item, index) => {
					const number = index + 1
					return (
						<div key={item.id} className="flex gap-tight items-start">
							<label
								htmlFor={`pricing-description-${item.id}`}
								className="sr-only"
							>
								Pricing item {number} description
							</label>
							<input
								id={`pricing-description-${item.id}`}
								type="text"
								value={item.description}
								onChange={e =>
									handlePricingChange(item.id, { description: e.target.value })
								}
								placeholder="Service or deliverable..."
								className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
							/>
							<label htmlFor={`pricing-price-${item.id}`} className="sr-only">
								Pricing item {number} price in dollars
							</label>
							<input
								id={`pricing-price-${item.id}`}
								type="number"
								min="0"
								step="0.01"
								inputMode="decimal"
								value={item.price || ''}
								onChange={e =>
									handlePricingChange(item.id, {
										price: parseNumberInput(e.target.value)
									})
								}
								placeholder="0.00"
								className="w-28 sm:w-32 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground text-right"
							/>
							<button
								type="button"
								onClick={() => removePricingItem(item.id)}
								disabled={proposalData.pricingItems.length === 1}
								className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
								aria-label={`Remove pricing item ${number}`}
							>
								<Trash2 className="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					)
				})}
				<div className="flex justify-end pt-4 border-t border-border">
					<p className="text-right">
						<span className="text-sm text-muted-foreground mr-4">Total:</span>
						<span className="text-xl font-bold text-accent">
							{formatCents(pricing.totalCents)}
						</span>
					</p>
				</div>
				<CalculatorInput
					label="Payment Terms"
					id="paymentTerms"
					type="text"
					value={proposalData.paymentTerms}
					onChange={e => handleTextChange('paymentTerms', e.target.value)}
					placeholder="e.g., 50% deposit, 50% upon completion"
				/>
			</section>

			{/* Terms */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Terms &amp; Conditions
				</h2>
				<TextAreaField
					id="terms"
					label="Terms and conditions"
					rows={4}
					value={proposalData.terms}
					onChange={e => handleTextChange('terms', e.target.value)}
					placeholder="Terms and conditions..."
				/>
			</section>

			<DraftActions
				hasDraft={hasDraft}
				onSave={saveDraft}
				onClear={clearDraft}
			/>

			{/* Educational Content */}
			<div className="mt-heading space-y-content border-t border-border pt-8">
				<h2 className="text-lg font-semibold text-foreground">Proposal Tips</h2>

				<div className="grid gap-content sm:grid-cols-2">
					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Clear Scope
						</h3>
						<p className="text-sm text-muted-foreground">
							Define exactly what&apos;s included (and excluded) to prevent
							scope creep and set clear expectations.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Value-Based Pricing
						</h3>
						<p className="text-sm text-muted-foreground">
							Focus on the value and outcomes you&apos;ll deliver rather than
							just listing hours or tasks.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Realistic Timeline
						</h3>
						<p className="text-sm text-muted-foreground">
							Include buffer time for revisions and unexpected delays.
							Under-promise and over-deliver.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Expiration Date
						</h3>
						<p className="text-sm text-muted-foreground">
							Set a proposal validity period (30 days is common) to create
							urgency and protect your pricing.
						</p>
					</Card>
				</div>
			</div>
		</div>
	)

	return (
		<ToolPageLayout
			title="Proposal Generator"
			description="Create professional project proposals and download them as PDF"
			columns="single"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={isHydrated}
		/>
	)
}

/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

'use client'

import { AlertTriangle } from 'lucide-react'
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
import {
	buildContractClauses,
	CONTRACT_TEMPLATE_TITLES,
	contractDisclaimer,
	contractPartyNames,
	contractRoles,
	getContractIssues,
	TEXAS_INTEREST_CAP
} from '@/lib/documents/contract'
import { toDateInputValue } from '@/lib/documents/dates'
import { isTexas, legalStateName, toFileSlug } from '@/lib/documents/format'
import { contractDraftSchema } from '@/lib/schemas/documents'
import type { ContractData, ContractTemplate } from '@/types/pdf-templates'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const contractDraft = createLocalStorageDraft(
	'hds-contract-draft',
	contractDraftSchema,
	'contract'
)

const TEMPLATES: {
	value: ContractTemplate
	description: string
}[] = [
	{
		value: 'service-agreement',
		description:
			'General agreement for professional services with payment terms and deliverables'
	},
	{
		value: 'nda',
		description:
			'Mutual agreement to protect confidential information both sides share'
	},
	{
		value: 'freelance-contract',
		description:
			'Independent contractor agreement with scope, payment and ownership terms'
	}
]

const EMPTY_CONTRACT: ContractData = {
	template: 'service-agreement',
	providerName: '',
	providerSignerName: '',
	providerSignerTitle: '',
	providerAddress: '',
	providerCity: '',
	providerState: '',
	providerZip: '',
	providerEmail: '',
	clientName: '',
	clientCompany: '',
	clientSignerTitle: '',
	clientAddress: '',
	clientCity: '',
	clientState: '',
	clientZip: '',
	clientEmail: '',
	effectiveDate: '',
	endDate: '',
	scopeOfWork: '',
	paymentTerms: '',
	paymentAmount: '',
	timeline: '',
	lateInterestRate: '',
	venueCounty: '',
	customClauses: ''
}

/** Fresh defaults for each visit: today's local date as the effective date. */
const createContractDefaults = (): ContractData => ({
	...EMPTY_CONTRACT,
	effectiveDate: toDateInputValue(new Date())
})

type TextField = Exclude<keyof ContractData, 'template'>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContractGeneratorClient() {
	const isHydrated = useHydrated()
	const [defaults, regenerateDefaults] = useClientDefaults(
		createContractDefaults,
		EMPTY_CONTRACT
	)
	const savedDraft = useLocalStorageDraft(contractDraft)
	const hasDraft = savedDraft !== null

	const [edits, setEdits] = useState<ContractData | null>(null)
	const baseData = savedDraft ?? defaults
	const contractData = edits ?? baseData

	const updateContract = useCallback(
		(updater: (prev: ContractData) => ContractData) => {
			setEdits(prev => updater(prev ?? baseData))
		},
		[baseData]
	)

	const issues = useMemo(() => getContractIssues(contractData), [contractData])
	const clauses = useMemo(
		() => buildContractClauses(contractData),
		[contractData]
	)
	const { isGenerating, download } = usePdfDownload()

	const isNda = contractData.template === 'nda'
	const roles = contractRoles(contractData.template)
	const names = contractPartyNames(contractData)
	const governingState = legalStateName(contractData.providerState)
	const texasDefault = isTexas(contractData.providerState)

	const handleTextChange = (field: TextField, value: string) => {
		updateContract(prev => ({ ...prev, [field]: value }))
	}

	const handleTemplateChange = (template: ContractTemplate) => {
		updateContract(prev => ({ ...prev, template }))
		trackEvent('contract_template_selected', { template })
	}

	const saveDraft = () => {
		if (!contractDraft.write(contractData)) {
			toast.error('Your browser blocked saving the draft.')
			return
		}
		toast.success('Draft saved in this browser.')
		trackEvent('contract_draft_saved', { template: contractData.template })
	}

	const clearDraft = () => {
		contractDraft.clear()
		setEdits(null)
		regenerateDefaults()
		toast.success('Draft cleared.')
	}

	const handleDownload = () => {
		if (!isHydrated || issues.length > 0) {
			return
		}
		const snapshot = contractData
		const templateName = snapshot.template.replaceAll('-', '_')
		const partyName = toFileSlug(
			snapshot.clientCompany || snapshot.clientName,
			'client'
		)
		void download({
			documentLabel: 'contract',
			fileName: `${templateName}_${partyName}.pdf`,
			createBlob: async () => {
				// Import the template module directly: a next/dynamic wrapper
				// suspends via use(), which react-pdf's reconciler rejects (#438).
				const [{ pdf }, { ContractDocument }] = await Promise.all([
					import('@react-pdf/renderer'),
					import('@/lib/pdf/contract-template')
				])
				return pdf(<ContractDocument data={snapshot} />).toBlob()
			},
			onSuccess: () => {
				trackEvent('contract_downloaded', {
					template: snapshot.template,
					has_scope: snapshot.scopeOfWork.trim() !== '',
					has_payment: snapshot.paymentAmount.trim() !== '',
					has_late_interest: snapshot.lateInterestRate.trim() !== ''
				})
			}
		})
	}

	const resultSlot = (
		<DocumentDownloadPanel
			documentLabel="contract"
			issues={issues}
			isGenerating={isGenerating}
			onDownload={handleDownload}
			summary={
				<div className="space-y-3">
					<dl className="space-y-2 text-sm">
						<div className="flex justify-between gap-content">
							<dt className="text-muted-foreground">Template</dt>
							<dd className="font-medium text-foreground">
								{CONTRACT_TEMPLATE_TITLES[contractData.template]}
							</dd>
						</div>
						<div className="flex justify-between gap-content">
							<dt className="text-muted-foreground">{roles.provider}</dt>
							<dd className="font-medium text-foreground">{names.provider}</dd>
						</div>
						<div className="flex justify-between gap-content">
							<dt className="text-muted-foreground">{roles.client}</dt>
							<dd className="font-medium text-foreground">{names.client}</dd>
						</div>
					</dl>
					<p className="text-sm text-muted-foreground">
						Read every clause in &ldquo;What this contract says&rdquo; above
						before you download and sign.
					</p>
				</div>
			}
		/>
	)

	const formSlot = (
		<div className="space-y-sections">
			{/* Not legal advice: first thing on the page */}
			<Card size="sm" className="bg-warning-light">
				<p className="flex gap-tight text-sm text-warning-text">
					<AlertTriangle
						className="mt-0.5 h-4 w-4 shrink-0"
						aria-hidden="true"
					/>
					<span>
						<strong>{contractDisclaimer(contractData.providerState)}</strong>{' '}
						These are plain-English starting points with {governingState} as the
						governing law. Laws change and every deal is different.
					</span>
				</p>
			</Card>

			{/* Template Selection */}
			<section className="space-y-content">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Select Contract Type
				</h2>
				<div className="grid gap-3 sm:grid-cols-3">
					{TEMPLATES.map(template => {
						const selected = contractData.template === template.value
						return (
							<button
								key={template.value}
								type="button"
								aria-pressed={selected}
								onClick={() => handleTemplateChange(template.value)}
								className={`p-4 rounded-lg border text-left transition-colors ${
									selected
										? 'border-accent bg-accent/10'
										: 'border-border hover:border-accent hover:bg-muted/50'
								}`}
							>
								<span className="block font-semibold text-foreground">
									{CONTRACT_TEMPLATE_TITLES[template.value]}
								</span>
								<span className="block text-xs text-muted-foreground mt-1">
									{template.description}
								</span>
							</button>
						)
					})}
				</div>
			</section>

			{/* Provider / Your Info */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					{isNda ? 'Party A (You)' : `${roles.provider} (You)`}
				</h2>
				<div className="grid gap-content sm:grid-cols-2">
					<CalculatorInput
						label="Business or Legal Name"
						id="providerName"
						type="text"
						autoComplete="organization"
						value={contractData.providerName}
						onChange={e => handleTextChange('providerName', e.target.value)}
						placeholder="Your business or full legal name"
						helpText="Required"
						required
					/>
					<CalculatorInput
						label="Email"
						id="providerEmail"
						type="email"
						autoComplete="email"
						value={contractData.providerEmail}
						onChange={e => handleTextChange('providerEmail', e.target.value)}
						placeholder="you@yourbusiness.com"
						helpText="Used for notices under the contract."
					/>
					<CalculatorInput
						label="Person Signing (Optional)"
						id="providerSignerName"
						type="text"
						autoComplete="name"
						value={contractData.providerSignerName}
						onChange={e =>
							handleTextChange('providerSignerName', e.target.value)
						}
						placeholder="Full name"
						helpText="Leave blank to write it in by hand."
					/>
					<CalculatorInput
						label="Signer Title (Optional)"
						id="providerSignerTitle"
						type="text"
						value={contractData.providerSignerTitle}
						onChange={e =>
							handleTextChange('providerSignerTitle', e.target.value)
						}
						placeholder="Owner, Managing Member, etc."
					/>
					<CalculatorInput
						label="Address"
						id="providerAddress"
						type="text"
						autoComplete="street-address"
						value={contractData.providerAddress}
						onChange={e => handleTextChange('providerAddress', e.target.value)}
						placeholder="123 Main St"
					/>
					<div className="grid grid-cols-3 gap-tight">
						<CalculatorInput
							label="City"
							id="providerCity"
							type="text"
							value={contractData.providerCity}
							onChange={e => handleTextChange('providerCity', e.target.value)}
						/>
						<CalculatorInput
							label="State"
							id="providerState"
							type="text"
							value={contractData.providerState}
							onChange={e => handleTextChange('providerState', e.target.value)}
							placeholder="TX"
						/>
						<CalculatorInput
							label="ZIP"
							id="providerZip"
							type="text"
							inputMode="numeric"
							value={contractData.providerZip}
							onChange={e => handleTextChange('providerZip', e.target.value)}
						/>
					</div>
				</div>
			</section>

			{/* Client Info */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					{isNda ? 'Party B' : roles.client}
				</h2>
				<div className="grid gap-content sm:grid-cols-2">
					<CalculatorInput
						label="Contact Name"
						id="clientName"
						type="text"
						value={contractData.clientName}
						onChange={e => handleTextChange('clientName', e.target.value)}
						helpText="Enter a contact name, a company or both."
					/>
					<CalculatorInput
						label="Company Name"
						id="clientCompany"
						type="text"
						value={contractData.clientCompany}
						onChange={e => handleTextChange('clientCompany', e.target.value)}
						helpText="When filled in, the company is the party and the contact signs for it."
					/>
					<CalculatorInput
						label="Signer Title (Optional)"
						id="clientSignerTitle"
						type="text"
						value={contractData.clientSignerTitle}
						onChange={e =>
							handleTextChange('clientSignerTitle', e.target.value)
						}
						placeholder="CEO, Owner, etc."
					/>
					<CalculatorInput
						label="Email"
						id="clientEmail"
						type="email"
						value={contractData.clientEmail}
						onChange={e => handleTextChange('clientEmail', e.target.value)}
					/>
					<CalculatorInput
						label="Address"
						id="clientAddress"
						type="text"
						value={contractData.clientAddress}
						onChange={e => handleTextChange('clientAddress', e.target.value)}
					/>
					<div className="grid grid-cols-3 gap-tight">
						<CalculatorInput
							label="City"
							id="clientCity"
							type="text"
							value={contractData.clientCity}
							onChange={e => handleTextChange('clientCity', e.target.value)}
						/>
						<CalculatorInput
							label="State"
							id="clientState"
							type="text"
							value={contractData.clientState}
							onChange={e => handleTextChange('clientState', e.target.value)}
						/>
						<CalculatorInput
							label="ZIP"
							id="clientZip"
							type="text"
							inputMode="numeric"
							value={contractData.clientZip}
							onChange={e => handleTextChange('clientZip', e.target.value)}
						/>
					</div>
				</div>
			</section>

			{/* Contract Details */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Contract Dates
				</h2>
				<div className="grid gap-content sm:grid-cols-2">
					<CalculatorInput
						label="Effective Date"
						id="effectiveDate"
						type="date"
						value={contractData.effectiveDate}
						onChange={e => handleTextChange('effectiveDate', e.target.value)}
					/>
					<CalculatorInput
						label="End Date (Optional)"
						id="endDate"
						type="date"
						min={contractData.effectiveDate || undefined}
						value={contractData.endDate}
						onChange={e => handleTextChange('endDate', e.target.value)}
						helpText={
							isNda
								? "Leave blank to run until either party ends it with 30 days' notice."
								: 'Leave blank to run until the work is complete.'
						}
					/>
				</div>
			</section>

			{/* Terms: not shown for NDA */}
			{!isNda && (
				<section className="space-y-content border-t border-border pt-6">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Work and Payment
					</h2>
					<div className="space-y-content">
						<TextAreaField
							id="scopeOfWork"
							label="Scope of Work"
							rows={4}
							value={contractData.scopeOfWork}
							onChange={e => handleTextChange('scopeOfWork', e.target.value)}
							placeholder="Describe the services to be provided..."
						/>
						<div className="grid gap-content sm:grid-cols-2">
							<CalculatorInput
								label="Payment Amount"
								id="paymentAmount"
								type="text"
								value={contractData.paymentAmount}
								onChange={e =>
									handleTextChange('paymentAmount', e.target.value)
								}
								placeholder="e.g., $5,000 or $150/hour"
							/>
							<CalculatorInput
								label="Payment Terms"
								id="paymentTerms"
								type="text"
								value={contractData.paymentTerms}
								onChange={e => handleTextChange('paymentTerms', e.target.value)}
								placeholder="e.g., 50% upfront, 50% on completion"
							/>
						</div>
						<CalculatorInput
							label="Late Payment Interest, % a Year (Optional)"
							id="lateInterestRate"
							type="number"
							min="0"
							max={texasDefault ? TEXAS_INTEREST_CAP : 100}
							step="any"
							inputMode="decimal"
							value={contractData.lateInterestRate}
							onChange={e =>
								handleTextChange('lateInterestRate', e.target.value)
							}
							placeholder="e.g., 10"
							helpText={
								texasDefault
									? 'Adds simple interest on overdue amounts. Texas generally caps contract interest at 10% a year unless another law allows more (Tex. Fin. Code 302.001). With no agreed rate, the default is 6% a year starting on the 30th day after the due date (302.002).'
									: "Adds simple interest on overdue amounts. Interest limits vary by state, so check your state's limit before you pick a rate."
							}
						/>
						<TextAreaField
							id="timeline"
							label="Timeline / Milestones"
							value={contractData.timeline}
							onChange={e => handleTextChange('timeline', e.target.value)}
							placeholder="Describe the project timeline and any key milestones..."
						/>
					</div>
				</section>
			)}

			{/* Purpose for NDA */}
			{isNda && (
				<section className="space-y-content border-t border-border pt-6">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Purpose of Disclosure
					</h2>
					<TextAreaField
						id="ndaPurpose"
						label="Purpose"
						value={contractData.scopeOfWork}
						onChange={e => handleTextChange('scopeOfWork', e.target.value)}
						placeholder="e.g., Evaluating a potential business partnership..."
					/>
				</section>
			)}

			{/* Disputes */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Disputes
				</h2>
				<CalculatorInput
					label="County for Lawsuits (Optional)"
					id="venueCounty"
					type="text"
					value={contractData.venueCounty}
					onChange={e => handleTextChange('venueCounty', e.target.value)}
					placeholder="e.g., Dallas"
					helpText={`Any lawsuit goes to the courts in this ${governingState} county. Leave blank to use the county where your business is located.`}
				/>
			</section>

			{/* Custom Clauses */}
			<section className="space-y-content border-t border-border pt-6">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
					Additional Terms (Optional)
				</h2>
				<TextAreaField
					id="customClauses"
					label="Additional terms"
					rows={4}
					value={contractData.customClauses}
					onChange={e => handleTextChange('customClauses', e.target.value)}
					placeholder="Add any custom clauses or special terms..."
				/>
			</section>

			{/* Every clause, on screen, before download */}
			<section className="space-y-content border-t border-border pt-6">
				<details className="group rounded-lg border border-border bg-surface-raised">
					<summary className="cursor-pointer list-none px-4 py-3 font-semibold text-foreground">
						<span className="flex items-center justify-between gap-content">
							<span>What this contract says ({clauses.length} sections)</span>
							<span
								className="text-sm font-normal text-accent group-open:hidden"
								aria-hidden="true"
							>
								Show
							</span>
							<span
								className="hidden text-sm font-normal text-accent group-open:inline"
								aria-hidden="true"
							>
								Hide
							</span>
						</span>
					</summary>
					<div className="space-y-content border-t border-border px-4 py-4 text-sm text-foreground">
						<h2 className="text-base font-semibold">
							{CONTRACT_TEMPLATE_TITLES[contractData.template]}
						</h2>
						<ol className="space-y-content">
							{clauses.map((clause, index) => (
								<li key={clause.id} className="space-y-2">
									<h3
										className={
											clause.conspicuous
												? 'font-bold uppercase'
												: 'font-semibold'
										}
									>
										{index + 1}. {clause.title}
									</h3>
									{clause.blocks.map((block, blockIndex) =>
										block.kind === 'bullets' ? (
											<ul
												key={blockIndex}
												className="list-disc space-y-1 pl-5 text-muted-foreground"
											>
												{block.items.map(item => (
													<li key={item}>{item}</li>
												))}
											</ul>
										) : (
											<p
												key={blockIndex}
												className={
													clause.conspicuous || block.conspicuous
														? 'font-bold text-foreground'
														: 'whitespace-pre-line text-muted-foreground'
												}
											>
												{block.text}
											</p>
										)
									)}
								</li>
							))}
						</ol>
					</div>
				</details>
			</section>

			<DraftActions
				hasDraft={hasDraft}
				onSave={saveDraft}
				onClear={clearDraft}
			/>

			{/* Educational Content */}
			<div className="space-y-content border-t border-border pt-8">
				<h2 className="text-lg font-semibold text-foreground">Contract Tips</h2>

				<div className="grid gap-content sm:grid-cols-2">
					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Be Specific
						</h3>
						<p className="text-sm text-muted-foreground">
							Clearly define the scope of work, deliverables and timelines to
							avoid misunderstandings.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Payment Terms
						</h3>
						<p className="text-sm text-muted-foreground">
							Spell out the amount and when each payment is due. Add a late
							payment interest rate if you want one in writing.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Legal Review
						</h3>
						<p className="text-sm text-muted-foreground">
							Have an attorney review the terms before you sign, especially for
							larger or longer engagements.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading font-semibold text-foreground">
							Keep Copies
						</h3>
						<p className="text-sm text-muted-foreground">
							Both parties should sign and keep copies of the executed contract.
						</p>
					</Card>
				</div>
			</div>
		</div>
	)

	return (
		<ToolPageLayout
			title="Contract Generator"
			description="Create professional contracts and download them as PDF"
			columns="single"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={isHydrated}
		/>
	)
}

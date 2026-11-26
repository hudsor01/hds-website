/**
 * Invoice Generator
 * Create professional invoices with PDF download
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
import { Button } from '@/components/ui/button'
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
	defaultInvoiceNote,
	dueDateForTerms,
	toDateInputValue
} from '@/lib/documents/dates'
import { toFileSlug } from '@/lib/documents/format'
import {
	computeInvoiceTotals,
	getInvoiceIssues,
	lineAmountCents
} from '@/lib/documents/invoice'
import { formatCents, parseNumberInput } from '@/lib/documents/money'
import {
	type InvoiceFormState,
	invoiceDraftSchema
} from '@/lib/schemas/documents'
import {
	INVOICE_PAYMENT_TERMS,
	type InvoiceLineItem,
	type InvoicePaymentTerms
} from '@/types/pdf-templates'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const invoiceDraft = createLocalStorageDraft(
	'hds-invoice-draft',
	invoiceDraftSchema,
	'invoice'
)

const DEFAULT_TERMS: InvoicePaymentTerms = 'Net 30'

const IRS_RECORDS_URL =
	'https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records'

const LINE_INPUT_CLASS = 'field'

const LINE_LABEL_CLASS = 'text-xs text-muted-foreground sm:sr-only'

const generateInvoiceNumber = (): string => {
	const date = new Date()
	const year = date.getFullYear().toString().slice(-2)
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const random = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, '0')
	return `INV-${year}${month}-${random}`
}

const createEmptyLineItem = (): InvoiceLineItem => ({
	id: crypto.randomUUID(),
	description: '',
	quantity: 1,
	rate: 0
})

const EMPTY_INVOICE: InvoiceFormState = {
	companyName: '',
	companyAddress: '',
	companyCity: '',
	companyState: '',
	companyZip: '',
	companyEmail: '',
	companyPhone: '',
	clientName: '',
	clientCompany: '',
	clientAddress: '',
	clientCity: '',
	clientState: '',
	clientZip: '',
	clientEmail: '',
	invoiceNumber: '',
	invoiceDate: '',
	dueDate: '',
	paymentTerms: DEFAULT_TERMS,
	lineItems: [{ id: 'line-1', description: '', quantity: 1, rate: 0 }],
	taxRate: 0,
	notes: defaultInvoiceNote(DEFAULT_TERMS),
	dueDateEdited: false,
	notesEdited: false
}

/** Fresh defaults for each visit: a new number, today's local date, Net 30. */
const createInvoiceDefaults = (): InvoiceFormState => {
	const invoiceDate = toDateInputValue(new Date())
	return {
		...EMPTY_INVOICE,
		invoiceNumber: generateInvoiceNumber(),
		invoiceDate,
		dueDate: dueDateForTerms(invoiceDate, DEFAULT_TERMS),
		lineItems: [createEmptyLineItem()]
	}
}

type TextField = {
	[K in keyof InvoiceFormState]: InvoiceFormState[K] extends string ? K : never
}[keyof InvoiceFormState]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InvoiceGeneratorClient() {
	const isHydrated = useHydrated()
	const [defaults, regenerateDefaults] = useClientDefaults(
		createInvoiceDefaults,
		EMPTY_INVOICE
	)
	const savedDraft = useLocalStorageDraft(invoiceDraft)
	const hasDraft = savedDraft !== null

	// Edits made in this visit. Until the first edit the form shows the saved
	// draft, or fresh defaults when there is none.
	const [edits, setEdits] = useState<InvoiceFormState | null>(null)
	const baseData = savedDraft ?? defaults
	const invoiceData = edits ?? baseData

	const updateInvoice = useCallback(
		(updater: (prev: InvoiceFormState) => InvoiceFormState) => {
			setEdits(prev => updater(prev ?? baseData))
		},
		[baseData]
	)

	const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])
	const issues = useMemo(() => getInvoiceIssues(invoiceData), [invoiceData])
	const { isGenerating, download } = usePdfDownload()

	const handleTextChange = (field: TextField, value: string) => {
		updateInvoice(prev => ({ ...prev, [field]: value }))
	}

	const handleInvoiceDateChange = (invoiceDate: string) => {
		updateInvoice(prev => ({
			...prev,
			invoiceDate,
			dueDate: prev.dueDateEdited
				? prev.dueDate
				: dueDateForTerms(invoiceDate, prev.paymentTerms)
		}))
	}

	const handleDueDateChange = (dueDate: string) => {
		updateInvoice(prev => ({ ...prev, dueDate, dueDateEdited: true }))
	}

	const handlePaymentTermsChange = (value: string) => {
		const paymentTerms = INVOICE_PAYMENT_TERMS.find(term => term === value)
		if (!paymentTerms) {
			return
		}
		updateInvoice(prev => ({
			...prev,
			paymentTerms,
			dueDate: prev.dueDateEdited
				? prev.dueDate
				: dueDateForTerms(prev.invoiceDate, paymentTerms),
			notes: prev.notesEdited ? prev.notes : defaultInvoiceNote(paymentTerms)
		}))
	}

	const handleNotesChange = (notes: string) => {
		updateInvoice(prev => ({ ...prev, notes, notesEdited: true }))
	}

	const handleLineItemChange = (
		id: string,
		patch: Partial<Omit<InvoiceLineItem, 'id'>>
	) => {
		updateInvoice(prev => ({
			...prev,
			lineItems: prev.lineItems.map(item =>
				item.id === id ? { ...item, ...patch } : item
			)
		}))
	}

	const addLineItem = () => {
		updateInvoice(prev => ({
			...prev,
			lineItems: [...prev.lineItems, createEmptyLineItem()]
		}))
	}

	const removeLineItem = (id: string) => {
		updateInvoice(prev =>
			prev.lineItems.length === 1
				? prev
				: { ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }
		)
	}

	const saveDraft = () => {
		if (!invoiceDraft.write(invoiceData)) {
			toast.error('Your browser blocked saving the draft.')
			return
		}
		toast.success('Draft saved in this browser.')
		trackEvent('invoice_draft_saved', {
			line_items: totals.lines.length
		})
	}

	const clearDraft = () => {
		invoiceDraft.clear()
		setEdits(null)
		// A fresh form gets a new invoice number and today's dates.
		regenerateDefaults()
		toast.success('Draft cleared.')
	}

	const handleDownload = () => {
		if (!isHydrated || issues.length > 0) {
			return
		}
		const snapshot = invoiceData
		void download({
			documentLabel: 'invoice',
			fileName: `${toFileSlug(snapshot.invoiceNumber, 'invoice')}.pdf`,
			createBlob: async () => {
				// Import the template module directly: a next/dynamic wrapper
				// suspends via use(), which react-pdf's reconciler rejects (#438).
				const [{ pdf }, { InvoiceDocument }] = await Promise.all([
					import('@react-pdf/renderer'),
					import('@/lib/pdf/invoice-template')
				])
				return pdf(<InvoiceDocument data={snapshot} />).toBlob()
			},
			onSuccess: () => {
				trackEvent('invoice_downloaded', {
					line_items: totals.lines.length,
					has_tax: snapshot.taxRate > 0,
					payment_terms: snapshot.paymentTerms
				})
			}
		})
	}

	const resultSlot = (
		<DocumentDownloadPanel
			documentLabel="invoice"
			issues={issues}
			isGenerating={isGenerating}
			onDownload={handleDownload}
			summary={
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Invoice #</dt>
						<dd className="font-medium text-foreground">
							{invoiceData.invoiceNumber}
						</dd>
					</div>
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Client</dt>
						<dd className="font-medium text-foreground">
							{invoiceData.clientName}
						</dd>
					</div>
					<div className="flex justify-between gap-content">
						<dt className="text-muted-foreground">Total</dt>
						<dd className="font-bold text-accent-text">
							{formatCents(totals.totalCents)}
						</dd>
					</div>
				</dl>
			}
		/>
	)

	const formSlot = (
		<div>
			<div className="space-y-sections">
				{/* Your Business Info */}
				<section className="space-y-content">
					<h2 className="text-eyebrow text-muted-foreground">Your Business</h2>
					<div className="grid gap-content sm:grid-cols-2">
						<CalculatorInput
							label="Business Name"
							id="companyName"
							type="text"
							autoComplete="organization"
							value={invoiceData.companyName}
							onChange={e => handleTextChange('companyName', e.target.value)}
							placeholder="Your business name"
							helpText="Required. Prints at the top of the invoice."
							required
						/>
						<CalculatorInput
							label="Email"
							id="companyEmail"
							type="email"
							autoComplete="email"
							value={invoiceData.companyEmail}
							onChange={e => handleTextChange('companyEmail', e.target.value)}
							placeholder="you@yourbusiness.com"
						/>
						<CalculatorInput
							label="Address"
							id="companyAddress"
							type="text"
							autoComplete="street-address"
							value={invoiceData.companyAddress}
							onChange={e => handleTextChange('companyAddress', e.target.value)}
							placeholder="123 Main St"
						/>
						<CalculatorInput
							label="Phone"
							id="companyPhone"
							type="tel"
							autoComplete="tel"
							value={invoiceData.companyPhone}
							onChange={e => handleTextChange('companyPhone', e.target.value)}
							placeholder="(555) 555-0123"
						/>
						<div className="grid grid-cols-3 gap-tight">
							<CalculatorInput
								label="City"
								id="companyCity"
								type="text"
								value={invoiceData.companyCity}
								onChange={e => handleTextChange('companyCity', e.target.value)}
							/>
							<CalculatorInput
								label="State"
								id="companyState"
								type="text"
								value={invoiceData.companyState}
								onChange={e => handleTextChange('companyState', e.target.value)}
							/>
							<CalculatorInput
								label="ZIP"
								id="companyZip"
								type="text"
								inputMode="numeric"
								value={invoiceData.companyZip}
								onChange={e => handleTextChange('companyZip', e.target.value)}
							/>
						</div>
					</div>
				</section>

				{/* Client Info */}
				<section className="space-y-content border-t border-border pt-6">
					<h2 className="text-eyebrow text-muted-foreground">
						Bill To (Client)
					</h2>
					<div className="grid gap-content sm:grid-cols-2">
						<CalculatorInput
							label="Client Name"
							id="clientName"
							type="text"
							value={invoiceData.clientName}
							onChange={e => handleTextChange('clientName', e.target.value)}
							helpText="Required"
							required
						/>
						<CalculatorInput
							label="Company (Optional)"
							id="clientCompany"
							type="text"
							value={invoiceData.clientCompany}
							onChange={e => handleTextChange('clientCompany', e.target.value)}
						/>
						<CalculatorInput
							label="Address"
							id="clientAddress"
							type="text"
							value={invoiceData.clientAddress}
							onChange={e => handleTextChange('clientAddress', e.target.value)}
						/>
						<CalculatorInput
							label="Email"
							id="clientEmail"
							type="email"
							value={invoiceData.clientEmail}
							onChange={e => handleTextChange('clientEmail', e.target.value)}
						/>
						<div className="grid grid-cols-3 gap-tight">
							<CalculatorInput
								label="City"
								id="clientCity"
								type="text"
								value={invoiceData.clientCity}
								onChange={e => handleTextChange('clientCity', e.target.value)}
							/>
							<CalculatorInput
								label="State"
								id="clientState"
								type="text"
								value={invoiceData.clientState}
								onChange={e => handleTextChange('clientState', e.target.value)}
							/>
							<CalculatorInput
								label="ZIP"
								id="clientZip"
								type="text"
								inputMode="numeric"
								value={invoiceData.clientZip}
								onChange={e => handleTextChange('clientZip', e.target.value)}
							/>
						</div>
					</div>
				</section>

				{/* Invoice Details */}
				<section className="space-y-content border-t border-border pt-6">
					<h2 className="text-eyebrow text-muted-foreground">
						Invoice Details
					</h2>
					<div className="grid gap-content sm:grid-cols-2 lg:grid-cols-4">
						<CalculatorInput
							label="Invoice Number"
							id="invoiceNumber"
							type="text"
							value={invoiceData.invoiceNumber}
							onChange={e => handleTextChange('invoiceNumber', e.target.value)}
						/>
						<CalculatorInput
							label="Invoice Date"
							id="invoiceDate"
							type="date"
							value={invoiceData.invoiceDate}
							onChange={e => handleInvoiceDateChange(e.target.value)}
						/>
						<div className="space-y-tight">
							<label
								htmlFor="paymentTerms"
								className="block text-sm font-medium text-foreground"
							>
								Payment Terms
							</label>
							<select
								id="paymentTerms"
								name="paymentTerms"
								value={invoiceData.paymentTerms}
								onChange={e => handlePaymentTermsChange(e.target.value)}
								className="field"
							>
								{INVOICE_PAYMENT_TERMS.map(term => (
									<option key={term} value={term}>
										{term}
									</option>
								))}
							</select>
						</div>
						<CalculatorInput
							label="Due Date"
							id="dueDate"
							type="date"
							min={invoiceData.invoiceDate || undefined}
							value={invoiceData.dueDate}
							onChange={e => handleDueDateChange(e.target.value)}
							helpText={
								invoiceData.dueDateEdited
									? 'You set this date, so the terms no longer change it.'
									: 'Set from the payment terms.'
							}
						/>
					</div>
				</section>

				{/* Line Items */}
				<section className="space-y-content border-t border-border pt-6">
					<div className="flex items-center justify-between">
						<h2 className="text-eyebrow text-muted-foreground">Line Items</h2>
						<Button
							type="button"
							variant="link"
							size="sm"
							className="px-0"
							onClick={addLineItem}
						>
							<Plus aria-hidden="true" />
							Add Item
						</Button>
					</div>

					{/* Column headings for sighted desktop users; inputs keep their own labels */}
					<div
						aria-hidden="true"
						className="hidden sm:grid sm:grid-cols-12 gap-tight text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border"
					>
						<div className="col-span-5">Description</div>
						<div className="col-span-2 text-center">Qty</div>
						<div className="col-span-2 text-right">Rate</div>
						<div className="col-span-2 text-right">Amount</div>
						<div className="col-span-1"></div>
					</div>

					{invoiceData.lineItems.map((item, index) => {
						const line = index + 1
						return (
							<div
								key={item.id}
								className="grid grid-cols-1 sm:grid-cols-12 gap-tight items-start pb-3 border-b border-border last:border-0"
							>
								<div className="sm:col-span-5">
									<label
										htmlFor={`description-${item.id}`}
										className={LINE_LABEL_CLASS}
									>
										Line {line} description
									</label>
									<input
										id={`description-${item.id}`}
										name={`description-${item.id}`}
										type="text"
										value={item.description}
										onChange={e =>
											handleLineItemChange(item.id, {
												description: e.target.value
											})
										}
										placeholder="Service or product description"
										className={LINE_INPUT_CLASS}
									/>
								</div>
								<div className="sm:col-span-2">
									<label
										htmlFor={`quantity-${item.id}`}
										className={LINE_LABEL_CLASS}
									>
										Line {line} quantity
									</label>
									<input
										id={`quantity-${item.id}`}
										name={`quantity-${item.id}`}
										type="number"
										min="0"
										step="any"
										inputMode="decimal"
										value={item.quantity}
										onChange={e =>
											handleLineItemChange(item.id, {
												quantity: parseNumberInput(e.target.value)
											})
										}
										className={`${LINE_INPUT_CLASS} text-center`}
									/>
								</div>
								<div className="sm:col-span-2">
									<label
										htmlFor={`rate-${item.id}`}
										className={LINE_LABEL_CLASS}
									>
										Line {line} rate
									</label>
									<input
										id={`rate-${item.id}`}
										name={`rate-${item.id}`}
										type="number"
										min="0"
										step="0.01"
										inputMode="decimal"
										value={item.rate || ''}
										onChange={e =>
											handleLineItemChange(item.id, {
												rate: parseNumberInput(e.target.value)
											})
										}
										placeholder="0.00"
										className={`${LINE_INPUT_CLASS} text-right`}
									/>
								</div>
								<p className="sm:col-span-2 px-3 py-2 text-sm text-right">
									<span className={`${LINE_LABEL_CLASS} mr-2`}>
										Line {line} amount
									</span>
									<span className="font-medium text-foreground">
										{formatCents(lineAmountCents(item))}
									</span>
								</p>
								<div className="sm:col-span-1 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="hover:text-destructive"
										onClick={() => removeLineItem(item.id)}
										disabled={invoiceData.lineItems.length === 1}
										aria-label={`Remove line item ${line}`}
									>
										<Trash2 aria-hidden="true" />
									</Button>
								</div>
							</div>
						)
					})}
				</section>

				{/* Totals */}
				<section
					aria-label="Totals"
					className="space-y-content border-t border-border pt-6"
				>
					<div className="flex justify-end">
						<div className="w-full sm:w-80 space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">
									{formatCents(totals.subtotalCents)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-content">
								<label
									htmlFor="taxRate"
									className="text-sm text-muted-foreground"
								>
									Tax Rate (%)
								</label>
								<input
									id="taxRate"
									name="taxRate"
									type="number"
									min="0"
									max="100"
									step="any"
									inputMode="decimal"
									value={invoiceData.taxRate || ''}
									onChange={e =>
										updateInvoice(prev => ({
											...prev,
											taxRate: parseNumberInput(e.target.value)
										}))
									}
									placeholder="0"
									className="field w-24 text-right"
								/>
							</div>
							{invoiceData.taxRate > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Tax ({invoiceData.taxRate}%)
									</span>
									<span className="font-medium">
										{formatCents(totals.taxCents)}
									</span>
								</div>
							)}
							<div className="flex justify-between pt-3 border-t border-border">
								<span className="text-lg font-semibold text-foreground">
									Total
								</span>
								<span className="text-xl font-bold text-accent-text">
									{formatCents(totals.totalCents)}
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Notes */}
				<section className="space-y-content border-t border-border pt-6">
					<TextAreaField
						id="notes"
						label="Notes / Terms"
						value={invoiceData.notes}
						onChange={e => handleNotesChange(e.target.value)}
						placeholder="Payment instructions, thank you message, etc."
						helpText={
							invoiceData.notesEdited
								? undefined
								: 'Matches your payment terms until you edit it.'
						}
					/>
				</section>

				<DraftActions
					hasDraft={hasDraft}
					onSave={saveDraft}
					onClear={clearDraft}
				/>
			</div>

			{/* Educational Content */}
			<div className="mt-heading space-y-content border-t border-border pt-8">
				<h2 className="text-h4 text-foreground">Invoice Best Practices</h2>

				<div className="grid gap-content sm:grid-cols-2">
					<Card size="sm">
						<h3 className="mb-subheading text-lg font-semibold text-foreground">
							Clear Payment Terms
						</h3>
						<p className="text-sm text-muted-foreground">
							Always specify payment terms upfront. Net 30 is standard, but
							consider offering discounts for early payment.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading text-lg font-semibold text-foreground">
							Detailed Descriptions
						</h3>
						<p className="text-sm text-muted-foreground">
							Include specific descriptions of services or products. This helps
							prevent disputes and makes record-keeping easier.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading text-lg font-semibold text-foreground">
							Consistent Numbering
						</h3>
						<p className="text-sm text-muted-foreground">
							Give every invoice its own number in a consistent sequence. It
							makes payments easy to match and old invoices easy to find.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-subheading text-lg font-semibold text-foreground">
							Keep Records
						</h3>
						<p className="text-sm text-muted-foreground">
							The IRS generally says to keep tax records for 3 years. Some cases
							call for longer.{' '}
							<a
								href={IRS_RECORDS_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="link-primary"
							>
								See how long the IRS says to keep records
							</a>
							.
						</p>
					</Card>
				</div>
			</div>
		</div>
	)

	return (
		<ToolPageLayout
			title="Invoice Generator"
			description="Create professional invoices and download them as PDF"
			columns="single"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={isHydrated}
		/>
	)
}

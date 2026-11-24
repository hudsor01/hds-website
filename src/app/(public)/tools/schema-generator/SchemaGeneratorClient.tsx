/**
 * LocalBusiness Schema Generator
 * Build schema.org LocalBusiness JSON-LD that follows Google's
 * LocalBusiness structured data guidelines.
 */

'use client'

import { useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import {
	buildLocalBusinessSchema,
	DAYS_OF_WEEK,
	type DayOfWeek,
	LOCAL_BUSINESS_TYPES,
	type LocalBusinessInput,
	type LocalBusinessType,
	type SchemaField,
	serializeSchema,
	validateLocalBusinessInput
} from '@/lib/schema-generator'

const TYPE_LABELS: Record<LocalBusinessType, string> = {
	LocalBusiness: 'Local business (general)',
	AutoRepair: 'Auto repair',
	AutomotiveBusiness: 'Automotive (other)',
	BeautySalon: 'Beauty salon',
	DaySpa: 'Day spa',
	Dentist: 'Dentist',
	Electrician: 'Electrician',
	EntertainmentBusiness: 'Entertainment',
	FinancialService: 'Financial service',
	FoodEstablishment: 'Food establishment (other)',
	HairSalon: 'Hair salon',
	HealthAndBeautyBusiness: 'Health and beauty (other)',
	HomeAndConstructionBusiness: 'Home and construction (other)',
	HVACBusiness: 'HVAC',
	LegalService: 'Legal service or attorney',
	MedicalBusiness: 'Medical business (other)',
	MedicalClinic: 'Medical clinic',
	Plumber: 'Plumber',
	RealEstateAgent: 'Real estate agent',
	Restaurant: 'Restaurant',
	RoofingContractor: 'Roofing contractor',
	Store: 'Store or retail'
}

const BUSINESS_TYPES = LOCAL_BUSINESS_TYPES.map(value => ({
	value,
	label: TYPE_LABELS[value]
})).sort((a, b) =>
	a.value === 'LocalBusiness'
		? -1
		: b.value === 'LocalBusiness'
			? 1
			: a.label.localeCompare(b.label)
)

const FIELD_LABELS: Record<SchemaField, string> = {
	name: 'Business name',
	street: 'Street',
	city: 'City',
	region: 'State or region',
	postalCode: 'Postal code',
	country: 'Country',
	latitude: 'Latitude',
	longitude: 'Longitude',
	priceRange: 'Price range'
}

function isLocalBusinessType(value: string): value is LocalBusinessType {
	return (LOCAL_BUSINESS_TYPES as readonly string[]).includes(value)
}

function lines(value: string): string[] {
	return value.split('\n')
}

export default function SchemaGeneratorClient() {
	const [type, setType] = useState<LocalBusinessType>('LocalBusiness')
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [url, setUrl] = useState('')
	const [telephone, setTelephone] = useState('')
	const [email, setEmail] = useState('')
	const [image, setImage] = useState('')
	const [priceRange, setPriceRange] = useState('')

	const [street, setStreet] = useState('')
	const [city, setCity] = useState('')
	const [region, setRegion] = useState('')
	const [postalCode, setPostalCode] = useState('')
	const [country, setCountry] = useState('')

	const [latitude, setLatitude] = useState('')
	const [longitude, setLongitude] = useState('')

	const [days, setDays] = useState<DayOfWeek[]>([])
	const [opens, setOpens] = useState('')
	const [closes, setCloses] = useState('')

	const [areaServed, setAreaServed] = useState('')
	const [socials, setSocials] = useState('')
	const [includeScriptTag, setIncludeScriptTag] = useState(true)
	// The copy message only shows for the output it was produced for.
	const [copyResult, setCopyResult] = useState<{
		output: string
		message: string
	} | null>(null)

	const baseId = useId()
	const typeFieldId = `${baseId}-type`
	const scriptTagFieldId = `${baseId}-script`
	const areaFieldId = `${baseId}-area`
	const socialsFieldId = `${baseId}-socials`
	const hoursHelpId = `${baseId}-hours-help`

	const input: LocalBusinessInput = useMemo(
		() => ({
			type,
			name,
			description,
			url,
			telephone,
			email,
			image,
			priceRange,
			address: { street, city, region, postalCode, country },
			geo: { latitude, longitude },
			openingHours: [{ days, opens, closes }],
			areaServed: lines(areaServed),
			sameAs: lines(socials)
		}),
		[
			type,
			name,
			description,
			url,
			telephone,
			email,
			image,
			priceRange,
			street,
			city,
			region,
			postalCode,
			country,
			latitude,
			longitude,
			days,
			opens,
			closes,
			areaServed,
			socials
		]
	)

	const { errors, warnings } = useMemo(
		() => validateLocalBusinessInput(input),
		[input]
	)
	const hasResult = Object.keys(errors).length === 0

	const output = useMemo(
		() =>
			hasResult
				? serializeSchema(buildLocalBusinessSchema(input), {
						pretty: true,
						scriptTag: includeScriptTag
					})
				: '',
		[hasResult, input, includeScriptTag]
	)

	// Format problems show inline as soon as the field has a value; missing
	// required fields are listed in the result panel instead of shouting at
	// an empty form.
	const formatError = (field: SchemaField, value: string) =>
		value.trim() ? errors[field] : undefined
	const latitudeError =
		latitude.trim() || longitude.trim() ? errors.latitude : undefined
	const longitudeError =
		latitude.trim() || longitude.trim() ? errors.longitude : undefined
	const missingFields = (Object.keys(errors) as SchemaField[]).map(
		field => FIELD_LABELS[field]
	)

	const toggleDay = (day: DayOfWeek) => {
		setDays(prev =>
			prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
		)
	}

	const copyToClipboard = async () => {
		if (!hasResult) {
			return
		}
		try {
			await navigator.clipboard.writeText(output)
			setCopyResult({ output, message: 'JSON-LD copied to the clipboard.' })
			toast.success('JSON-LD copied')
			trackEvent('calculator_used', {
				calculator_type: 'schema-generator',
				action: 'copy',
				business_type: type
			})
		} catch (error) {
			logger.error('Copy schema failed', error)
			setCopyResult({
				output,
				message: 'Copy failed. Select the code and copy it instead.'
			})
			toast.error(
				'Could not copy the JSON-LD. Select the code and copy it instead.'
			)
		}
	}

	const actions: ToolAction[] = hasResult
		? [{ type: 'copy', label: 'Copy', onClick: copyToClipboard }]
		: []

	const formSlot = (
		<div className="space-y-comfortable">
			{/* Core */}
			<div className="space-y-content">
				<div>
					<label
						htmlFor={typeFieldId}
						className="block text-sm font-medium text-foreground mb-subheading"
					>
						Business type
					</label>
					<select
						id={typeFieldId}
						value={type}
						onChange={event => {
							const next = event.target.value
							if (isLocalBusinessType(next)) {
								setType(next)
							}
						}}
						aria-describedby={`${typeFieldId}-help`}
						className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
					>
						{BUSINESS_TYPES.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<p
						id={`${typeFieldId}-help`}
						className="mt-1 text-xs text-muted-foreground"
					>
						Google asks for the most specific type that fits.
					</p>
				</div>

				<CalculatorInput
					id="schema-name"
					label="Business name (required)"
					value={name}
					onChange={event => setName(event.target.value)}
					placeholder="Acme Plumbing Co."
					required
				/>
				<CalculatorInput
					id="schema-description"
					label="Description"
					value={description}
					onChange={event => setDescription(event.target.value)}
					placeholder="Licensed plumbers serving the Dallas area."
				/>
				<CalculatorInput
					id="schema-url"
					label="Website URL"
					type="url"
					value={url}
					onChange={event => setUrl(event.target.value)}
					placeholder="https://example.com"
					helpText="Use the full URL. https:// is added if you leave it off."
				/>
				<CalculatorInput
					id="schema-phone"
					label="Phone"
					type="tel"
					value={telephone}
					onChange={event => setTelephone(event.target.value)}
					placeholder="+1 214 555 0100"
					helpText="Google asks you to include the country code and area code."
				/>
				<CalculatorInput
					id="schema-email"
					label="Email"
					type="email"
					value={email}
					onChange={event => setEmail(event.target.value)}
					placeholder="hello@example.com"
				/>
				<CalculatorInput
					id="schema-image"
					label="Image URL"
					type="url"
					value={image}
					onChange={event => setImage(event.target.value)}
					placeholder="https://example.com/storefront.jpg"
					helpText="A photo of the business. Use the full URL."
				/>
				<CalculatorInput
					id="schema-price"
					label="Price range"
					value={priceRange}
					onChange={event => setPriceRange(event.target.value)}
					placeholder="$$"
					helpText="$ to $$$$, or a range like $50-$200. Google requires fewer than 100 characters."
					error={formatError('priceRange', priceRange)}
				/>
			</div>

			{/* Address */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Address (required by Google)
				</legend>
				<CalculatorInput
					id="schema-street"
					label="Street"
					value={street}
					onChange={event => setStreet(event.target.value)}
					placeholder="123 Main St"
					required
				/>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-city"
						label="City"
						value={city}
						onChange={event => setCity(event.target.value)}
						placeholder="Dallas"
						required
					/>
					<CalculatorInput
						id="schema-region"
						label="State or region"
						value={region}
						onChange={event => setRegion(event.target.value)}
						placeholder="TX"
						required
					/>
				</div>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-postal"
						label="Postal code"
						value={postalCode}
						onChange={event => setPostalCode(event.target.value)}
						placeholder="75201"
						required
					/>
					<CalculatorInput
						id="schema-country"
						label="Country"
						value={country}
						onChange={event => setCountry(event.target.value)}
						placeholder="US"
						helpText="2-letter code, for example US."
						error={formatError('country', country)}
						maxLength={2}
						autoComplete="country"
						required
					/>
				</div>
			</fieldset>

			{/* Geo */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Map coordinates (optional)
				</legend>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-lat"
						label="Latitude"
						inputMode="decimal"
						value={latitude}
						onChange={event => setLatitude(event.target.value)}
						placeholder="32.77670"
						helpText="At least 5 decimal places (Google)."
						error={latitudeError}
					/>
					<CalculatorInput
						id="schema-lng"
						label="Longitude"
						inputMode="decimal"
						value={longitude}
						onChange={event => setLongitude(event.target.value)}
						placeholder="-96.79700"
						helpText="At least 5 decimal places (Google)."
						error={longitudeError}
					/>
				</div>
			</fieldset>

			{/* Hours */}
			<fieldset
				className="space-y-content border-t border-border pt-comfortable"
				aria-describedby={hoursHelpId}
			>
				<legend className="text-sm font-semibold text-foreground">
					Opening hours (optional)
				</legend>
				<p id={hoursHelpId} className="text-xs text-muted-foreground">
					These hours apply to every selected day. For days with different
					hours, leave them unchecked rather than entering the wrong times.
				</p>
				<div className="flex flex-wrap gap-2">
					{DAYS_OF_WEEK.map(day => {
						const checked = days.includes(day)
						return (
							<label
								key={day}
								className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background ${
									checked
										? 'border-accent bg-accent/10 text-accent'
										: 'border-border text-muted-foreground hover:text-foreground'
								}`}
							>
								<input
									type="checkbox"
									checked={checked}
									onChange={() => toggleDay(day)}
									className="sr-only"
								/>
								<span aria-hidden="true">{day.slice(0, 3)}</span>
								<span className="sr-only">{day}</span>
							</label>
						)
					})}
				</div>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-opens"
						label="Opens"
						type="time"
						value={opens}
						onChange={event => setOpens(event.target.value)}
					/>
					<CalculatorInput
						id="schema-closes"
						label="Closes"
						type="time"
						value={closes}
						onChange={event => setCloses(event.target.value)}
					/>
				</div>
				<div aria-live="polite">
					{warnings.map(warning => (
						<p key={warning} className="text-xs text-warning-text">
							{warning}
						</p>
					))}
				</div>
			</fieldset>

			{/* Service area */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Service area (optional)
				</legend>
				<label
					htmlFor={areaFieldId}
					className="block text-sm font-medium text-foreground"
				>
					Cities or areas you serve
				</label>
				<textarea
					id={areaFieldId}
					value={areaServed}
					onChange={event => setAreaServed(event.target.value)}
					aria-describedby={`${areaFieldId}-help`}
					className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
					rows={3}
					placeholder={'Dallas\nPlano\nIrving'}
				/>
				<p id={`${areaFieldId}-help`} className="text-xs text-muted-foreground">
					One per line. These become the schema.org areaServed property.
				</p>
			</fieldset>

			{/* Social profiles */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Social profiles (optional)
				</legend>
				<label
					htmlFor={socialsFieldId}
					className="block text-sm font-medium text-foreground"
				>
					Profile URLs
				</label>
				<textarea
					id={socialsFieldId}
					value={socials}
					onChange={event => setSocials(event.target.value)}
					aria-describedby={`${socialsFieldId}-help`}
					className="w-full rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
					rows={4}
					placeholder={
						'https://facebook.com/yourbusiness\nhttps://instagram.com/yourbusiness'
					}
					spellCheck={false}
				/>
				<p
					id={`${socialsFieldId}-help`}
					className="text-xs text-muted-foreground"
				>
					One profile URL per line. https:// is added if you leave it off. These
					become the schema&apos;s sameAs links.
				</p>
			</fieldset>

			<label
				htmlFor={scriptTagFieldId}
				className="flex items-center gap-tight text-sm text-muted-foreground"
			>
				<input
					id={scriptTagFieldId}
					type="checkbox"
					checked={includeScriptTag}
					onChange={event => setIncludeScriptTag(event.target.checked)}
					className="rounded border-border text-accent focus:ring-accent"
				/>
				Wrap in a &lt;script&gt; tag (paste straight into your page head)
			</label>
		</div>
	)

	const resultSlot = hasResult ? (
		<div>
			<pre className="w-full rounded-md border border-border bg-background p-4 overflow-x-auto">
				<code className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
					{output}
				</code>
			</pre>
			<p className="mt-2 text-xs text-muted-foreground">
				Paste this into the &lt;head&gt; of your page, then validate it with
				Google&apos;s Rich Results Test.
			</p>
			<p
				role="status"
				aria-live="polite"
				className="mt-1 text-xs text-muted-foreground"
			>
				{copyResult?.output === output ? copyResult.message : ''}
			</p>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="LocalBusiness Schema Generator"
			description="Build schema.org LocalBusiness JSON-LD that tells Google your business name, address, hours and contact details."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder={`Google requires a name and full address. Fix or fill in: ${missingFields.join(', ')}.`}
			actions={actions}
		/>
	)
}

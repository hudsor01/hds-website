/**
 * LocalBusiness Schema Generator
 * Build schema.org LocalBusiness JSON-LD for local SEO.
 */

'use client'

import { useId, useMemo, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { trackEvent } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import {
	buildLocalBusinessSchema,
	type LocalBusinessType,
	serializeSchema
} from '@/lib/schema-generator'

const BUSINESS_TYPES: ReadonlyArray<{
	value: LocalBusinessType
	label: string
}> = [
	{ value: 'LocalBusiness', label: 'Local Business (general)' },
	{ value: 'ProfessionalService', label: 'Professional Service' },
	{ value: 'Store', label: 'Store / Retail' },
	{ value: 'Restaurant', label: 'Restaurant' },
	{ value: 'FoodEstablishment', label: 'Food Establishment' },
	{ value: 'MedicalBusiness', label: 'Medical Business' },
	{ value: 'HealthAndBeautyBusiness', label: 'Health & Beauty' },
	{ value: 'HomeAndConstructionBusiness', label: 'Home & Construction' },
	{ value: 'AutomotiveBusiness', label: 'Automotive' },
	{ value: 'LegalService', label: 'Legal Service' },
	{ value: 'FinancialService', label: 'Financial Service' },
	{ value: 'EntertainmentBusiness', label: 'Entertainment' }
]

const DAYS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
] as const

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

	const [days, setDays] = useState<string[]>([])
	const [opens, setOpens] = useState('')
	const [closes, setCloses] = useState('')

	const [socials, setSocials] = useState('')
	const [includeScriptTag, setIncludeScriptTag] = useState(true)

	const typeFieldId = useId()
	const scriptTagFieldId = useId()

	const output = useMemo(() => {
		const schema = buildLocalBusinessSchema({
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
			sameAs: socials.split('\n')
		})
		return serializeSchema(schema, {
			pretty: true,
			scriptTag: includeScriptTag
		})
	}, [
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
		socials,
		includeScriptTag
	])

	const hasResult = name.trim().length > 0

	// Inline feedback when a coordinate isn't a single decimal number — the
	// most common mistake is pasting "lat, lng" into one field, which the
	// generator silently drops. Mirror the generator's decimal-only rule.
	const coordError = (raw: string, limit: number): string | undefined => {
		const trimmed = raw.trim()
		if (trimmed === '') {
			return undefined
		}
		if (!/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
			return `Enter a single decimal number (${limit === 90 ? '-90 to 90' : '-180 to 180'}). Put latitude and longitude in separate fields.`
		}
		return undefined
	}
	const latError = coordError(latitude, 90)
	const lngError = coordError(longitude, 180)

	const toggleDay = (day: string) => {
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
			trackEvent('calculator_used', {
				calculator_type: 'schema-generator',
				action: 'copy',
				business_type: type
			})
		} catch (error) {
			logger.debug('Clipboard API unavailable, using fallback', {
				error: error instanceof Error ? error.message : String(error)
			})
			const textArea = document.createElement('textarea')
			textArea.value = output
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
		}
	}

	const actions: ToolAction[] = [
		{ type: 'copy', label: 'Copy', onClick: copyToClipboard }
	]

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
						onChange={event => setType(event.target.value as LocalBusinessType)}
						className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
					>
						{BUSINESS_TYPES.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<CalculatorInput
					id="schema-name"
					label="Business name"
					value={name}
					onChange={event => setName(event.target.value)}
					placeholder="Acme Plumbing Co."
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
					helpText="Use the full URL including https://."
				/>
				<CalculatorInput
					id="schema-phone"
					label="Phone"
					type="tel"
					value={telephone}
					onChange={event => setTelephone(event.target.value)}
					placeholder="(555) 123-4567"
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
					label="Logo / image URL"
					type="url"
					value={image}
					onChange={event => setImage(event.target.value)}
					placeholder="https://example.com/logo.png"
					helpText="Use the full URL including https://."
				/>
				<CalculatorInput
					id="schema-price"
					label="Price range"
					value={priceRange}
					onChange={event => setPriceRange(event.target.value)}
					placeholder="$$"
					helpText="$ to $$$$, or a range like $50-$200."
				/>
			</div>

			{/* Address */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Address
				</legend>
				<CalculatorInput
					id="schema-street"
					label="Street"
					value={street}
					onChange={event => setStreet(event.target.value)}
					placeholder="123 Main St"
				/>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-city"
						label="City"
						value={city}
						onChange={event => setCity(event.target.value)}
						placeholder="Dallas"
					/>
					<CalculatorInput
						id="schema-region"
						label="State / region"
						value={region}
						onChange={event => setRegion(event.target.value)}
						placeholder="TX"
					/>
				</div>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="schema-postal"
						label="Postal code"
						value={postalCode}
						onChange={event => setPostalCode(event.target.value)}
						placeholder="75201"
					/>
					<CalculatorInput
						id="schema-country"
						label="Country"
						value={country}
						onChange={event => setCountry(event.target.value)}
						placeholder="US"
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
						value={latitude}
						onChange={event => setLatitude(event.target.value)}
						placeholder="32.7767"
						error={latError}
					/>
					<CalculatorInput
						id="schema-lng"
						label="Longitude"
						value={longitude}
						onChange={event => setLongitude(event.target.value)}
						placeholder="-96.7970"
						error={lngError}
					/>
				</div>
			</fieldset>

			{/* Hours */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Opening hours (optional)
				</legend>
				<p className="text-xs text-muted-foreground">
					These hours apply to every selected day. For days with different
					hours, leave them unchecked rather than entering the wrong times.
				</p>
				<div className="flex flex-wrap gap-2">
					{DAYS.map(day => {
						const checked = days.includes(day)
						return (
							<label
								key={day}
								className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors ${
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
								{day.slice(0, 3)}
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
			</fieldset>

			{/* Social profiles */}
			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Social profiles (optional)
				</legend>
				<textarea
					value={socials}
					onChange={event => setSocials(event.target.value)}
					className="w-full rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
					rows={4}
					placeholder={
						'https://facebook.com/yourbusiness\nhttps://instagram.com/yourbusiness'
					}
					spellCheck={false}
				/>
				<p className="text-xs text-muted-foreground">
					One full profile URL per line (include https://). These become the
					schema&apos;s sameAs links.
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
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="LocalBusiness Schema Generator"
			description="Build schema.org LocalBusiness JSON-LD to help Google understand your business and show you in local results."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Enter your business name to generate the JSON-LD"
			actions={actions}
		/>
	)
}

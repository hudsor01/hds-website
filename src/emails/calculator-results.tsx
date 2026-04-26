import { Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BrandButton } from './_components/brand-button'
import { BrandFooter } from './_components/brand-footer'
import { BrandLayout } from './_components/brand-layout'

interface CalculatorResultsProps {
	calculatorName: string
	results: Record<string, unknown>
}

// Outlook desktop (Word rendering engine) ignores linear-gradient. The
// solid backgroundColor is the fallback every client respects; modern
// clients additionally honor backgroundImage and render the gradient.
const HEADER_STYLE = {
	backgroundColor: BRAND.primary,
	backgroundImage: `linear-gradient(to right, ${BRAND.primary}, ${BRAND.primaryDeep})`,
	padding: '30px',
	textAlign: 'center' as const,
	borderRadius: '8px 8px 0 0'
}

const HEADER_TITLE_STYLE = {
	color: '#ffffff',
	margin: 0,
	fontSize: '24px',
	fontWeight: 700
}

const BODY_SECTION_STYLE = {
	backgroundColor: BRAND.muted,
	padding: '30px',
	borderRadius: '0 0 8px 8px'
}

const RESULTS_BOX_STYLE = {
	backgroundColor: '#ffffff',
	padding: '20px',
	borderRadius: '8px',
	marginBottom: '20px'
}

const RESULT_ROW_STYLE = {
	marginBottom: '15px',
	paddingBottom: '15px',
	borderBottom: `1px solid ${BRAND.border}`
}

const RESULT_LABEL_STYLE = {
	fontSize: '14px',
	color: BRAND.mutedForeground,
	marginBottom: '5px',
	margin: 0
}

const RESULT_VALUE_STYLE = {
	fontSize: '20px',
	fontWeight: 700,
	color: BRAND.primary,
	margin: 0
}

const NEXT_STEPS_BOX_STYLE = {
	backgroundColor: BRAND.muted,
	borderLeft: `4px solid ${BRAND.primary}`,
	padding: '15px',
	marginBottom: '20px'
}

const CTA_WRAP_STYLE = {
	textAlign: 'center' as const,
	marginTop: '30px'
}

export function CalculatorResults({
	calculatorName,
	results
}: CalculatorResultsProps) {
	const entries = Object.entries(results)
	const lastIndex = entries.length - 1

	return (
		<BrandLayout preview={`Your ${calculatorName} results are ready`}>
			<Section style={HEADER_STYLE}>
				<Text style={HEADER_TITLE_STYLE}>Your {calculatorName} Results</Text>
			</Section>

			<Section style={BODY_SECTION_STYLE}>
				<Text style={{ fontSize: '16px', marginBottom: '20px', margin: 0 }}>
					Thank you for using our {calculatorName}! Here&apos;s a summary of
					your results:
				</Text>

				<Section style={RESULTS_BOX_STYLE}>
					{entries.map(([key, value], index) => (
						<Section
							key={key}
							style={
								index === lastIndex
									? { ...RESULT_ROW_STYLE, borderBottom: 'none' }
									: RESULT_ROW_STYLE
							}
						>
							<Text style={RESULT_LABEL_STYLE}>{key}</Text>
							<Text style={RESULT_VALUE_STYLE}>{String(value)}</Text>
						</Section>
					))}
				</Section>

				<Section style={NEXT_STEPS_BOX_STYLE}>
					<Text style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
						<strong>Next Steps:</strong> Our team will review your results and
						send you personalized recommendations within 24 hours.
					</Text>
				</Section>

				<Section style={CTA_WRAP_STYLE}>
					<BrandButton href="https://hudsondigitalsolutions.com/contact">
						Schedule Free Consultation
					</BrandButton>
				</Section>
			</Section>

			<BrandFooter />
		</BrandLayout>
	)
}

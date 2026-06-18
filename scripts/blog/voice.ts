/**
 * Single source of truth for blog VOICE + anti-AI-tell rules.
 * Imported by generate.ts (prompt) and lib.ts (validator warn check) so the
 * guidance the model receives and the rules we lint against never drift.
 *
 * Voice derived from Richard Hudson's own writing (cover letters): a revenue
 * operations operator who now builds small-business websites. Confident first
 * person, hard metrics over adjectives, names real tools, systems/ROI lens,
 * plain-spoken, Texas/DFW-based.
 */

export const VOICE_GUIDE = [
	'VOICE: Write as Richard Hudson, founder of Hudson Digital Solutions, in first person ("I" and "we"). I spent almost a decade in revenue operations (Salesforce, Power BI, Workato, HubSpot, PartnerStack) before building websites, so I treat a website as a revenue system, not a brochure. I scaled a partner network 2,200%, hit 95% forecast accuracy, and drove $3.7M through forecasting work; I think in attribution, automation, and measurable outcomes.',
	'TONE: confident, direct, plain-spoken. Lead with the point. Short punchy sentences mixed with longer ones for rhythm; never uniform same-length paragraphs. Use contractions. Sound like a sharp operator talking to another business owner, not a marketing brochure.',
	'SUBSTANCE: prefer hard numbers, named tools, and concrete Dallas-Fort Worth scenarios over vague adjectives. Show the systems thinking: what to measure, what to automate, what it costs, what it returns. Real specifics beat generalities every time.',
	'STRUCTURE: vary paragraph and sentence length. It is fine to use a one-sentence paragraph for emphasis. Do not make every section the same shape.'
].join('\n')

/**
 * Phrases and constructions that read as machine-written. The generator is told
 * to avoid them; the validator warns if any slip through (rule AIVOICE), and
 * Claude scrubs them at finalization so published posts read human.
 */
export const AI_TELLS: string[] = [
	"in today's fast-paced",
	"in today's digital",
	"in today's competitive",
	"in today's world",
	'in the digital age',
	'in the ever-evolving',
	'ever-evolving',
	'ever-changing',
	'fast-paced world',
	'digital landscape',
	'digital age',
	"that's where we come in",
	'that is where we come in',
	'look no further',
	'in conclusion',
	'in summary',
	'at the end of the day',
	'when it comes to',
	'it is important to note',
	"it's important to note",
	'it is worth noting',
	"it's worth noting",
	'needless to say',
	'rest assured',
	'first and foremost',
	'navigate the complexities',
	'navigate the landscape',
	'unlock the power',
	'unlock the potential',
	'harness the power',
	'take it to the next level',
	'to the next level',
	'stand out from the crowd',
	'in a crowded market',
	'a testament to',
	'leverage',
	'leveraging',
	'seamless',
	'seamlessly',
	'robust',
	'elevate',
	'delve',
	'delve into',
	'dive into',
	"let's dive in",
	'embark on',
	'tapestry',
	'realm',
	'in the realm of',
	'game-changer',
	'game changer',
	'cutting-edge',
	'supercharge',
	'pave the way',
	'the world of',
	'more than just',
	'not just a',
	'not just about',
	'when it comes down to it',
	'reimagine',
	'unleash',
	'paradigm',
	'synergy',
	'best-in-class',
	'top-notch',
	'bustling'
]

/** Banned-phrase scan over a body of text. Returns the distinct tells found. */
export function findAiTells(text: string): string[] {
	const lower = text.toLowerCase()
	const hits = new Set<string>()
	for (const tell of AI_TELLS) {
		// Word-boundary-ish match so "realm" does not fire inside "overwhelmed".
		const re = new RegExp(
			`(^|[^a-z])${tell.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`,
			'i'
		)
		if (re.test(lower)) {
			hits.add(tell)
		}
	}
	return [...hits]
}

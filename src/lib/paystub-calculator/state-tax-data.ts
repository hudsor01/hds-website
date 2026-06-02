import type { TaxData } from '@/types/paystub'

// Official 2025 state income-tax data by year. Add or adjust per annual releases.
// Surtaxes (CA 1% Mental Health Services over $1M, MA 4% over $1,083,150) are
// encoded as additional top brackets so calculateStateTax needs no new math path.
type StateTaxBrackets = Record<string, TaxData['federalBrackets']>

function flatBrackets(rate: number): TaxData['federalBrackets'] {
	return {
		single: [{ limit: Infinity, rate }],
		marriedJoint: [{ limit: Infinity, rate }],
		marriedSeparate: [{ limit: Infinity, rate }],
		headOfHousehold: [{ limit: Infinity, rate }],
		qualifyingSurvivingSpouse: [{ limit: Infinity, rate }]
	}
}

// MA 2025: flat 5.0% on income up to 1083150, then 9.0% (5% + 4% surtax) over it.
// Not flatBrackets (that emits a single Infinity band only).
function massachusettsBrackets(): TaxData['federalBrackets'] {
	const bands = [
		{ limit: 1083150, rate: 0.05 },
		{ limit: Infinity, rate: 0.09 }
	]
	return {
		single: bands,
		marriedJoint: bands,
		marriedSeparate: bands,
		headOfHousehold: bands,
		qualifyingSurvivingSpouse: bands
	}
}

const stateTaxDataByYear: Record<number, StateTaxBrackets> = {
	2025: {
		// FTB 2025 Schedules X/Y/Z + 1% MHS surtax band over 1000000 (effective 13.3% top).
		CA: {
			// Schedule X (Single / MFS): 1000000 sits inside the 12.3% band (over 742953).
			single: [
				{ limit: 11079, rate: 0.01 },
				{ limit: 26264, rate: 0.02 },
				{ limit: 41452, rate: 0.04 },
				{ limit: 57542, rate: 0.06 },
				{ limit: 72724, rate: 0.08 },
				{ limit: 371479, rate: 0.093 },
				{ limit: 445771, rate: 0.103 },
				{ limit: 742953, rate: 0.113 },
				{ limit: 1000000, rate: 0.123 },
				{ limit: Infinity, rate: 0.133 }
			],
			// Schedule Y (MFJ / QSS): 1000000 sits inside the 11.3% band (891542..1485906).
			marriedJoint: [
				{ limit: 22158, rate: 0.01 },
				{ limit: 52528, rate: 0.02 },
				{ limit: 82904, rate: 0.04 },
				{ limit: 115084, rate: 0.06 },
				{ limit: 145448, rate: 0.08 },
				{ limit: 742958, rate: 0.093 },
				{ limit: 891542, rate: 0.103 },
				{ limit: 1000000, rate: 0.113 },
				{ limit: 1485906, rate: 0.123 },
				{ limit: Infinity, rate: 0.133 }
			],
			// Schedule X (Single / MFS): 1000000 sits inside the 12.3% band (over 742953).
			marriedSeparate: [
				{ limit: 11079, rate: 0.01 },
				{ limit: 26264, rate: 0.02 },
				{ limit: 41452, rate: 0.04 },
				{ limit: 57542, rate: 0.06 },
				{ limit: 72724, rate: 0.08 },
				{ limit: 371479, rate: 0.093 },
				{ limit: 445771, rate: 0.103 },
				{ limit: 742953, rate: 0.113 },
				{ limit: 1000000, rate: 0.123 },
				{ limit: Infinity, rate: 0.133 }
			],
			// Schedule Z (HoH): 1000000 sits inside the 11.3% band (606251..1010417).
			headOfHousehold: [
				{ limit: 22173, rate: 0.01 },
				{ limit: 52530, rate: 0.02 },
				{ limit: 67716, rate: 0.04 },
				{ limit: 83805, rate: 0.06 },
				{ limit: 98990, rate: 0.08 },
				{ limit: 505208, rate: 0.093 },
				{ limit: 606251, rate: 0.103 },
				{ limit: 1000000, rate: 0.113 },
				{ limit: 1010417, rate: 0.123 },
				{ limit: Infinity, rate: 0.133 }
			],
			// Schedule Y (MFJ / QSS): 1000000 sits inside the 11.3% band (891542..1485906).
			qualifyingSurvivingSpouse: [
				{ limit: 22158, rate: 0.01 },
				{ limit: 52528, rate: 0.02 },
				{ limit: 82904, rate: 0.04 },
				{ limit: 115084, rate: 0.06 },
				{ limit: 145448, rate: 0.08 },
				{ limit: 742958, rate: 0.093 },
				{ limit: 891542, rate: 0.103 },
				{ limit: 1000000, rate: 0.113 },
				{ limit: 1485906, rate: 0.123 },
				{ limit: Infinity, rate: 0.133 }
			]
		},
		// DTF IT-201-I 2025 (unchanged from 2024); includes 9.65 / 10.3 / 10.9 high brackets.
		NY: {
			single: [
				{ limit: 8500, rate: 0.04 },
				{ limit: 11700, rate: 0.045 },
				{ limit: 13900, rate: 0.0525 },
				{ limit: 80650, rate: 0.055 },
				{ limit: 215400, rate: 0.06 },
				{ limit: 1077550, rate: 0.0685 },
				{ limit: 5000000, rate: 0.0965 },
				{ limit: 25000000, rate: 0.103 },
				{ limit: Infinity, rate: 0.109 }
			],
			marriedJoint: [
				{ limit: 17150, rate: 0.04 },
				{ limit: 23600, rate: 0.045 },
				{ limit: 27900, rate: 0.0525 },
				{ limit: 161550, rate: 0.055 },
				{ limit: 323200, rate: 0.06 },
				{ limit: 2155350, rate: 0.0685 },
				{ limit: 5000000, rate: 0.0965 },
				{ limit: 25000000, rate: 0.103 },
				{ limit: Infinity, rate: 0.109 }
			],
			marriedSeparate: [
				{ limit: 8500, rate: 0.04 },
				{ limit: 11700, rate: 0.045 },
				{ limit: 13900, rate: 0.0525 },
				{ limit: 80650, rate: 0.055 },
				{ limit: 215400, rate: 0.06 },
				{ limit: 1077550, rate: 0.0685 },
				{ limit: 5000000, rate: 0.0965 },
				{ limit: 25000000, rate: 0.103 },
				{ limit: Infinity, rate: 0.109 }
			],
			headOfHousehold: [
				{ limit: 12800, rate: 0.04 },
				{ limit: 17650, rate: 0.045 },
				{ limit: 20900, rate: 0.0525 },
				{ limit: 107650, rate: 0.055 },
				{ limit: 269300, rate: 0.06 },
				{ limit: 1616450, rate: 0.0685 },
				{ limit: 5000000, rate: 0.0965 },
				{ limit: 25000000, rate: 0.103 },
				{ limit: Infinity, rate: 0.109 }
			],
			qualifyingSurvivingSpouse: [
				{ limit: 17150, rate: 0.04 },
				{ limit: 23600, rate: 0.045 },
				{ limit: 27900, rate: 0.0525 },
				{ limit: 161550, rate: 0.055 },
				{ limit: 323200, rate: 0.06 },
				{ limit: 2155350, rate: 0.0685 },
				{ limit: 5000000, rate: 0.0965 },
				{ limit: 25000000, rate: 0.103 },
				{ limit: Infinity, rate: 0.109 }
			]
		},
		IL: flatBrackets(0.0495),
		PA: flatBrackets(0.0307),
		MA: massachusettsBrackets()
	}
}

export function getStateTaxBrackets(
	state: string,
	year?: number
): TaxData['federalBrackets'] | undefined {
	const normalizedState = state?.toUpperCase()
	const targetYear = year ?? new Date().getFullYear()
	const yearTable =
		stateTaxDataByYear[targetYear] ??
		stateTaxDataByYear[Math.max(...Object.keys(stateTaxDataByYear).map(Number))]
	return yearTable?.[normalizedState]
}

// Single source of truth for the selectable income-tax states: the union of every
// state code present across all year tables. After the 2025 re-key + TX/FL/WA removal
// this returns CA, NY, IL, PA, MA. 11-03 wires the dropdown to this so the UI can
// never offer a state without bracket data.
export function getSupportedIncomeTaxStateCodes(): string[] {
	const codes = new Set<string>()
	for (const yearTable of Object.values(stateTaxDataByYear)) {
		for (const code of Object.keys(yearTable)) {
			codes.add(code)
		}
	}
	return [...codes]
}

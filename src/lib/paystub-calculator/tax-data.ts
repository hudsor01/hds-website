import type { TaxData } from '@/types/paystub'

// Versioned federal tax data by tax year. Add new entries per IRS releases.
// Official 2025 federal brackets per IRS Rev. Proc. 2024-40 (Tables 1-4);
// Social Security wage base 176100 per SSA 2025 COLA.
const taxDataByYear: Record<number, TaxData> = {
	2025: {
		ssWageBase: 176100,
		ssRate: 0.062,
		medicareRate: 0.0145,
		additionalMedicareRate: 0.009,
		additionalMedicareThreshold: {
			single: 200000,
			marriedJoint: 250000,
			marriedSeparate: 125000,
			headOfHousehold: 200000,
			qualifyingSurvivingSpouse: 250000
		},
		federalBrackets: {
			single: [
				{ limit: 11925, rate: 0.1 },
				{ limit: 48475, rate: 0.12 },
				{ limit: 103350, rate: 0.22 },
				{ limit: 197300, rate: 0.24 },
				{ limit: 250525, rate: 0.32 },
				{ limit: 626350, rate: 0.35 },
				{ limit: Infinity, rate: 0.37 }
			],
			marriedJoint: [
				{ limit: 23850, rate: 0.1 },
				{ limit: 96950, rate: 0.12 },
				{ limit: 206700, rate: 0.22 },
				{ limit: 394600, rate: 0.24 },
				{ limit: 501050, rate: 0.32 },
				{ limit: 751600, rate: 0.35 },
				{ limit: Infinity, rate: 0.37 }
			],
			marriedSeparate: [
				{ limit: 11925, rate: 0.1 },
				{ limit: 48475, rate: 0.12 },
				{ limit: 103350, rate: 0.22 },
				{ limit: 197300, rate: 0.24 },
				{ limit: 250525, rate: 0.32 },
				{ limit: 375800, rate: 0.35 },
				{ limit: Infinity, rate: 0.37 }
			],
			headOfHousehold: [
				{ limit: 17000, rate: 0.1 },
				{ limit: 64850, rate: 0.12 },
				{ limit: 103350, rate: 0.22 },
				{ limit: 197300, rate: 0.24 },
				{ limit: 250500, rate: 0.32 },
				{ limit: 626350, rate: 0.35 },
				{ limit: Infinity, rate: 0.37 }
			],
			qualifyingSurvivingSpouse: [
				{ limit: 23850, rate: 0.1 },
				{ limit: 96950, rate: 0.12 },
				{ limit: 206700, rate: 0.22 },
				{ limit: 394600, rate: 0.24 },
				{ limit: 501050, rate: 0.32 },
				{ limit: 751600, rate: 0.35 },
				{ limit: Infinity, rate: 0.37 }
			]
		}
	}
}

export function getTaxDataForYear(year?: number): TaxData {
	const currentYear = new Date().getFullYear()
	const targetYear = year ?? currentYear
	const availableYears = Object.keys(taxDataByYear).map(Number)

	const defaultData = taxDataByYear[2025]

	if (!defaultData) {
		throw new Error('Missing baseline tax data for 2025')
	}

	if (availableYears.length === 0) {
		// Fallback to baseline if no data is available (shouldn't happen in practice)
		return defaultData
	}

	// Defense-in-depth: a target year without data resolves to the latest backed
	// year. Unreachable from the UI once year-membership validation (11-03)
	// rejects unbacked years; retained as a safety net for stale shared URLs.
	const fallbackYear = Math.max(...availableYears)
	const fallbackData = taxDataByYear[fallbackYear] ?? defaultData

	return taxDataByYear[targetYear] ?? fallbackData
}

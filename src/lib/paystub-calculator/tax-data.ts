import type { FilingStatus } from '@/types/paystub'
import { row, type ScheduleRow } from './schedule'

/**
 * Federal payroll tax data by tax year.
 *
 * 2026 sources:
 * - IRS Pub. 15-T (2026), "2026 Percentage Method Tables for Automated
 *   Payroll Systems" (annual tables, page 12) and Worksheet 1A, line 1g
 *   ($12,900 married filing jointly, $8,600 otherwise).
 * - IRS Pub. 15 (2026), section 9: Social Security 6.2% up to the $184,500
 *   wage base, Medicare 1.45%, Additional Medicare Tax 0.9% withheld on
 *   wages over $200,000 in the calendar year regardless of filing status.
 */
export interface FederalTaxData {
	ssWageBase: number
	ssRate: number
	medicareRate: number
	additionalMedicareRate: number
	additionalMedicareThreshold: number
	/** Form W-4 2020 or later, Step 2 box not checked */
	standardSchedules: Record<FilingStatus, ScheduleRow[]>
	/** Form W-4 2020 or later, Step 2 box checked */
	checkboxSchedules: Record<FilingStatus, ScheduleRow[]>
	/** Worksheet 1A line 1g, used only when the Step 2 box is not checked */
	line1g: Record<FilingStatus, number>
}

const taxDataByYear: Record<number, FederalTaxData> = {
	2026: {
		ssWageBase: 184500,
		ssRate: 0.062,
		medicareRate: 0.0145,
		additionalMedicareRate: 0.009,
		additionalMedicareThreshold: 200000,
		standardSchedules: {
			marriedJoint: [
				row(0, 0, 0),
				row(19300, 0, 0.1),
				row(44100, 2480, 0.12),
				row(120100, 11600, 0.22),
				row(230700, 35932, 0.24),
				row(422850, 82048, 0.32),
				row(531750, 116896, 0.35),
				row(788000, 206583.5, 0.37)
			],
			single: [
				row(0, 0, 0),
				row(7500, 0, 0.1),
				row(19900, 1240, 0.12),
				row(57900, 5800, 0.22),
				row(113200, 17966, 0.24),
				row(209275, 41024, 0.32),
				row(263725, 58448, 0.35),
				row(648100, 192979.25, 0.37)
			],
			headOfHousehold: [
				row(0, 0, 0),
				row(15550, 0, 0.1),
				row(33250, 1770, 0.12),
				row(83000, 7740, 0.22),
				row(121250, 16155, 0.24),
				row(217300, 39207, 0.32),
				row(271750, 56631, 0.35),
				row(656150, 191171, 0.37)
			]
		},
		checkboxSchedules: {
			marriedJoint: [
				row(0, 0, 0),
				row(16100, 0, 0.1),
				row(28500, 1240, 0.12),
				row(66500, 5800, 0.22),
				row(121800, 17966, 0.24),
				row(217875, 41024, 0.32),
				row(272325, 58448, 0.35),
				row(400450, 103291.75, 0.37)
			],
			single: [
				row(0, 0, 0),
				row(8050, 0, 0.1),
				row(14250, 620, 0.12),
				row(33250, 2900, 0.22),
				row(60900, 8983, 0.24),
				row(108938, 20512, 0.32),
				row(136163, 29224, 0.35),
				row(328350, 96489.63, 0.37)
			],
			headOfHousehold: [
				row(0, 0, 0),
				row(12075, 0, 0.1),
				row(20925, 885, 0.12),
				row(45800, 3870, 0.22),
				row(64925, 8077.5, 0.24),
				row(112950, 19603.5, 0.32),
				row(140175, 28315.5, 0.35),
				row(332375, 95585.5, 0.37)
			]
		},
		line1g: {
			marriedJoint: 12900,
			single: 8600,
			headOfHousehold: 8600
		}
	}
}

/** Years with backing data, newest first */
export function getSupportedTaxYears(): number[] {
	return Object.keys(taxDataByYear)
		.map(Number)
		.sort((a, b) => b - a)
}

export function getTaxDataForYear(year: number): FederalTaxData {
	const data = taxDataByYear[year]
	if (!data) {
		throw new Error(
			`No federal tax data for ${year}. Supported years: ${getSupportedTaxYears().join(', ')}`
		)
	}
	return data
}

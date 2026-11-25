'use client'

import {
	createLoader,
	parseAsFloat,
	parseAsInteger,
	parseAsString,
	useQueryStates
} from 'nuqs'
import { useCallback } from 'react'
import {
	isSupportedStateCode,
	isSupportedTaxYear,
	normalizeFilingStatus
} from '@/lib/paystub-calculator/supported-inputs'
import type { PaystubData } from '@/types/paystub'

/**
 * URL state configuration for the paystub generator.
 * Enables shareable URLs with pre-filled form data.
 *
 * Example URL: /tools/paystub-calculator?name=John&rate=25&hours=40&status=single&state=CA
 */
const paystubParsers = {
	// Employee info
	name: parseAsString,
	id: parseAsString,
	employer: parseAsString,

	// Pay info
	rate: parseAsFloat,
	hours: parseAsFloat,

	// Tax info
	// Plain string: older links carry five return statuses, which the
	// generator maps onto the three Form W-4 statuses on restore
	status: parseAsString,
	year: parseAsInteger,
	state: parseAsString
}

export interface PaystubUrlState {
	name: string | null
	id: string | null
	employer: string | null
	rate: number | null
	hours: number | null
	status: string | null
	year: number | null
	state: string | null
}

const EMPTY_URL_STATE: PaystubUrlState = {
	name: null,
	id: null,
	employer: null,
	rate: null,
	hours: null,
	status: null,
	year: null,
	state: null
}

const loadPaystubUrlState = createLoader(paystubParsers)

/**
 * Reads the paystub params from a query string (for example
 * window.location.search). A plain function, not a hook, so restoring a
 * shared link on mount does not make the page read search params while
 * it prerenders.
 */
export function readPaystubUrlState(search: string): PaystubUrlState {
	return loadPaystubUrlState(search)
}

export function hasPaystubUrlState(state: PaystubUrlState): boolean {
	return Object.values(state).some(value => value !== null)
}

/** The form data with every restorable URL value applied over it. */
export function applyPaystubUrlState(
	prev: PaystubData,
	urlState: PaystubUrlState
): PaystubData {
	return {
		...prev,
		employeeName: urlState.name ?? prev.employeeName,
		employeeId: urlState.id ?? prev.employeeId,
		employerName: urlState.employer ?? prev.employerName,
		hourlyRate: urlState.rate ?? prev.hourlyRate,
		hoursPerPeriod: urlState.hours ?? prev.hoursPerPeriod,
		filingStatus: normalizeFilingStatus(urlState.status) ?? prev.filingStatus,
		// Clamp a restored year to the supported set; a stale shared ?year=2024
		// (HIGH/LOW asymmetry: nuqs passes it through unchanged) falls back to the
		// form default rather than feeding an unbacked year into the calculation.
		taxYear:
			urlState.year != null && isSupportedTaxYear(urlState.year)
				? urlState.year
				: prev.taxYear
	}
}

/**
 * The state code to restore from the URL, or null. Only a supported code
 * is restored; unsupported values (e.g. AL) are dropped so a stale shared
 * URL never feeds an unsupported state into the calculation and never
 * produces a defensive silent $0 (PAYSTUB-10).
 */
export function restoredPaystubStateCode(
	urlState: PaystubUrlState
): string | null {
	if (!urlState.state || !isSupportedStateCode(urlState.state)) {
		return null
	}
	return urlState.state.toUpperCase()
}

export interface UsePaystubUrlStateReturn {
	setUrlState: (state: Partial<PaystubUrlState>) => void
	clearUrlState: () => void
}

/**
 * Hook for writing paystub form state to the URL, so a filled-in form can
 * be shared. It reads search params, so the component that calls it must
 * sit inside a Suspense boundary.
 */
export function usePaystubUrlState(): UsePaystubUrlStateReturn {
	const [, setQueryStates] = useQueryStates(paystubParsers, {
		// Use 'replace' to avoid creating browser history entries for each keystroke
		history: 'replace',
		// Shallow routing - don't trigger server-side navigation
		shallow: true
	})

	const setUrlState = useCallback(
		(newState: Partial<PaystubUrlState>) => {
			void setQueryStates(newState)
		},
		[setQueryStates]
	)

	const clearUrlState = useCallback(() => {
		void setQueryStates(EMPTY_URL_STATE)
	}, [setQueryStates])

	return {
		setUrlState,
		clearUrlState
	}
}

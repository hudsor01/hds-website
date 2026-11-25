/**
 * Mirrors the paystub form to the URL so a filled-in form can be shared.
 * It reads search params through nuqs, which suspends prerendering, so it
 * renders nothing and is mounted inside its own Suspense boundary: the
 * heading, intro and form stay in the server HTML.
 */

'use client'

import { type RefObject, useEffect } from 'react'
import { usePaystubUrlState } from '@/hooks/use-paystub-url-state'
import type { PaystubData } from '@/types/paystub'

interface PaystubUrlSyncProps {
	paystubData: PaystubData
	selectedState: string
	/** Set to a function that clears the URL params while this is mounted */
	clearUrlRef: RefObject<() => void>
}

const noop = () => undefined

export function PaystubUrlSync({
	paystubData,
	selectedState,
	clearUrlRef
}: PaystubUrlSyncProps) {
	const { setUrlState, clearUrlState } = usePaystubUrlState()
	const {
		employeeName,
		employeeId,
		employerName,
		hourlyRate,
		hoursPerPeriod,
		filingStatus,
		taxYear
	} = paystubData

	useEffect(() => {
		clearUrlRef.current = clearUrlState
		return () => {
			clearUrlRef.current = noop
		}
	})

	useEffect(() => {
		// An empty form never writes, so the defaults on first render cannot
		// overwrite a shared link before the generator restores it
		const hasData = employeeName || hourlyRate || hoursPerPeriod
		if (!hasData) {
			return
		}

		setUrlState({
			name: employeeName || null,
			id: employeeId || null,
			employer: employerName || null,
			rate: hourlyRate || null,
			hours: hoursPerPeriod || null,
			status: filingStatus,
			year: taxYear,
			state: selectedState || null
		})
	}, [
		employeeName,
		employeeId,
		employerName,
		hourlyRate,
		hoursPerPeriod,
		filingStatus,
		taxYear,
		selectedState,
		setUrlState
	])

	return null
}

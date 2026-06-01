'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'

/**
 * Records marketing attribution (UTM + ad click IDs + referrer + landing
 * page) into localStorage on first paint of every public page, so a lead's
 * converting submission carries the campaign that acquired them. Renders
 * nothing. Mounted once in the public route-group layout.
 */
export function AttributionTracker() {
	useEffect(() => {
		captureAttribution()
	}, [])

	return null
}

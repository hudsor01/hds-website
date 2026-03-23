import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

/**
 * Redirect old Thryv-specific URL to the generic migration page.
 * Keep this file until the old URL is no longer indexed.
 */
export default function SwitchFromThryvRedirect() {
	redirect(ROUTES.WEBSITE_MIGRATION)
}

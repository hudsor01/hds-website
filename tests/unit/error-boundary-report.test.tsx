/**
 * ErrorBoundary "Report Error" client behavior.
 *
 * The DefaultErrorFallback.reportError handler must transmit a real POST to
 * /api/error-report and give honest Sonner feedback: toast.success only when
 * the POST returns ok, toast.error on a non-ok response or a thrown fetch.
 * It must never claim a report was filed unless res.ok, and the alert() that
 * lied about it must be gone.
 *
 * We spy on the REAL sonner `toast` per test (never mock.module('sonner'):
 * that registration is process-global and swaps the exports in place, which
 * broke toast.loading for every later file), stub `global.fetch` per case and
 * restore it afterwards, click "Report Error", and flush the in-flight async
 * fetch with waitFor before asserting.
 */

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn
} from 'bun:test'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { DefaultErrorFallback } from '@/components/utilities/ErrorBoundary'
import { cleanupMocks } from '../test-utils'

// `@/lib/logger` is mock.module'd globally in tests/setup.ts and re-applied
// in its beforeEach (a fresh mock instance per test). We must read the
// CURRENT instance at assert time so we see the same spy the component's
// live import binding resolves to.
async function currentLoggerError(): Promise<ReturnType<typeof mock>> {
	const { logger } = await import('@/lib/logger')
	return logger.error as ReturnType<typeof mock>
}

function renderFallback() {
	return render(
		<DefaultErrorFallback
			error={new Error('Boom')}
			resetErrorBoundary={() => {}}
		/>
	)
}

describe('ErrorBoundary reportError', () => {
	const originalFetch = globalThis.fetch
	let toastSuccess: ReturnType<typeof spyOn>
	let toastError: ReturnType<typeof spyOn>

	beforeEach(() => {
		// The global afterEach mock.restore() undoes these spies
		toastSuccess = spyOn(toast, 'success').mockImplementation(() => 'id')
		toastError = spyOn(toast, 'error').mockImplementation(() => 'id')
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		cleanupMocks()
	})

	it('shows a success toast and not an error toast when the POST is ok (Case A)', async () => {
		global.fetch = mock().mockResolvedValue({
			ok: true
		}) as unknown as typeof fetch
		renderFallback()

		fireEvent.click(screen.getByText('Report Error'))

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledTimes(1)
		})
		expect(toastError).not.toHaveBeenCalled()
	})

	it('shows an error toast and no success toast when the POST is not ok (Case B)', async () => {
		global.fetch = mock().mockResolvedValue({
			ok: false
		}) as unknown as typeof fetch
		renderFallback()

		fireEvent.click(screen.getByText('Report Error'))

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledTimes(1)
		})
		expect(toastSuccess).not.toHaveBeenCalled()
	})

	it('shows an error toast and logs when the fetch rejects (Case C)', async () => {
		global.fetch = mock().mockRejectedValue(
			new Error('network')
		) as unknown as typeof fetch
		renderFallback()

		fireEvent.click(screen.getByText('Report Error'))

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledTimes(1)
		})
		expect(await currentLoggerError()).toHaveBeenCalled()
		expect(toastSuccess).not.toHaveBeenCalled()
	})
})

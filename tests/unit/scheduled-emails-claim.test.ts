/**
 * BUG-01 regression: atomic claim before send in processPendingEmails.
 *
 * The defect: processPendingEmails SELECTed pending rows then sent them and
 * only AFTER the send flipped status to 'sent'. Two overlapping cron/n8n
 * invocations both read the same pending row and both sent it -> the
 * recipient got the email twice.
 *
 * The fix: between the candidate SELECT and any Resend send, claim the rows
 * with a single conditional UPDATE
 *   UPDATE scheduled_emails SET status='processing'
 *   WHERE id IN (<ids>) AND status='pending' RETURNING *
 * and send ONLY the returned rows. The second overlapping pass's claim
 * returns [] for an already-claimed id, so it does not send.
 *
 * This test drives two processEmailsEndpoint passes where the candidate
 * SELECT returns the SAME pending row both times, the claim UPDATE returns
 * the row on pass 1 and [] on pass 2, and asserts the Resend send spy fires
 * EXACTLY ONCE. On the pre-fix code (no claim) the send fires twice -> fail.
 */
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock
} from 'bun:test'

const PENDING_ROW = {
	id: 'email-row-1',
	recipientEmail: 'lead@example.com',
	recipientName: 'Lead',
	sequenceId: 'standard-welcome',
	stepId: 'welcome',
	scheduledFor: new Date(Date.now() - 60_000),
	sentAt: null,
	status: 'pending',
	variables: {},
	retryCount: 0,
	maxRetries: 3,
	error: null,
	createdAt: new Date()
}

// The candidate SELECT (processPendingEmails) and the stats SELECT
// (getEmailQueueStats) both call db.select(). They are distinguished by
// their chain shape: the candidate uses .from().where().orderBy().limit(),
// the stats SELECT uses .select({...}).from() and awaits directly. We make
// the candidate chain return the same pending row on every invocation and
// the stats chain return an empty array (its absolute counts are irrelevant
// to this test; processEmailsEndpoint only diffs them).
function makeSelect() {
	return mock().mockImplementation((projection?: unknown) => {
		// getEmailQueueStats calls select({ status: ... }) and awaits from().
		if (projection) {
			return {
				from: mock().mockResolvedValue([])
			}
		}
		// processPendingEmails calls select() with no projection.
		return {
			from: mock().mockReturnValue({
				where: mock().mockReturnValue({
					orderBy: mock().mockReturnValue({
						limit: mock().mockResolvedValue([PENDING_ROW])
					})
				})
			})
		}
	})
}

// The claim UPDATE: db.update().set().where().returning(). The first call
// returns the claimed row, the second returns [] (already claimed). Any
// non-claim update (retry/sent/failed writes) uses .where() that resolves
// directly (no .returning()).
function makeUpdate(returningValues: Array<Array<typeof PENDING_ROW>>) {
	let claimCall = 0
	const returningSpy = mock().mockImplementation(() => {
		const v = returningValues[claimCall] ?? []
		claimCall++
		return Promise.resolve(v)
	})
	const whereSpy = mock().mockImplementation(() => ({
		// .returning() present -> this is the claim; awaiting .where() directly
		// (no .returning()) -> a status write. Support both shapes.
		returning: returningSpy,
		then: (resolve: (v: unknown) => void) => resolve([])
	}))
	const update = mock().mockReturnValue({
		set: mock().mockReturnValue({ where: whereSpy })
	})
	return { update, returningSpy, whereSpy }
}

describe('BUG-01 processPendingEmails atomic claim', () => {
	beforeEach(() => {
		const testEnv = (
			globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
		).__TEST_ENV
		testEnv.NODE_ENV = 'test'
		testEnv.RESEND_API_KEY = 'test-key'

		mock.module('@/lib/logger', () => ({
			logger: {
				info: mock(),
				warn: mock(),
				error: mock(),
				debug: mock(),
				setContext: mock()
			},
			createServerLogger: () => ({
				info: mock(),
				warn: mock(),
				error: mock(),
				debug: mock(),
				setContext: mock()
			}),
			castError: (error: unknown) =>
				error instanceof Error ? error : new Error(String(error))
		}))
	})

	afterEach(() => {
		mock.restore()
	})

	it('sends a row at most once across two overlapping passes (claim UPDATE guards status=pending)', async () => {
		const sendSpy = mock().mockResolvedValue({ data: { id: 'sent-1' } })
		mock.module('@/lib/resend-client', () => ({
			isResendConfigured: mock().mockReturnValue(true),
			getResendClient: mock(() => ({ emails: { send: sendSpy } }))
		}))

		// Pass 1 claim returns the row; pass 2 claim returns [] (already claimed).
		const { update, returningSpy } = makeUpdate([[PENDING_ROW], []])
		mock.module('@/lib/db', () => ({
			db: {
				select: makeSelect(),
				update
			}
		}))

		const { processEmailsEndpoint } = await import('@/lib/scheduled-emails')

		await processEmailsEndpoint() // pass 1: claims + sends
		await processEmailsEndpoint() // pass 2: claim returns [] -> no send

		// The atomic claim makes the row sendable exactly once.
		expect(sendSpy).toHaveBeenCalledTimes(1)
		// The claim UPDATE must use .returning() (rows-affected gate).
		expect(returningSpy).toHaveBeenCalled()
	})

	it('does not send when the claim returns no rows (all already claimed)', async () => {
		const sendSpy = mock().mockResolvedValue({ data: { id: 'never' } })
		mock.module('@/lib/resend-client', () => ({
			isResendConfigured: mock().mockReturnValue(true),
			getResendClient: mock(() => ({ emails: { send: sendSpy } }))
		}))

		const { update } = makeUpdate([[]]) // claim returns nothing
		mock.module('@/lib/db', () => ({
			db: { select: makeSelect(), update }
		}))

		const { processEmailsEndpoint } = await import('@/lib/scheduled-emails')
		await processEmailsEndpoint()

		expect(sendSpy).not.toHaveBeenCalled()
	})
})

/**
 * BUG-01 regression: atomic claim before send in processPendingEmails.
 *
 * The defect: processPendingEmails SELECTed pending rows then sent them and
 * only AFTER the send flipped status to 'sent'. Two overlapping cron/n8n
 * invocations both read the same pending row and both sent it -> the
 * recipient got the email twice.
 *
 * The fix extracts an atomic claim, claimDuePendingEmails(db, now), that
 * processPendingEmails runs BEFORE any send and that returns ONLY the rows it
 * actually claimed:
 *   SELECT due claimable rows
 *   UPDATE scheduled_emails SET status='processing'
 *     WHERE id IN (<ids>) AND <still-claimable> RETURNING *
 *
 * This suite drives claimDuePendingEmails twice over the SAME candidate row.
 * The claim UPDATE returns the row on pass 1 and [] on pass 2 (already
 * claimed). It asserts:
 *   - pass 1 returns exactly the claimed row (this row WOULD be sent)
 *   - pass 2 returns [] (this row is NOT re-sent across an overlapping pass)
 *   - the claim path uses .returning() (the rows-affected gate)
 *   - when the claim returns [], the function returns [] (nothing to send)
 *
 * On the pre-fix code there was no claim at all, so both passes would surface
 * the same row to the send loop -> a double send. By construction this test
 * exercises the claim that makes the row sendable exactly once.
 *
 * claimDuePendingEmails lives in the lightweight @/lib/scheduled-emails-claim
 * module (drizzle + schema only, no server-only/resend/email-component graph)
 * and takes the db as a parameter, so this test injects a plain mock with no
 * module-global mock.module() — fully order-independent (avoids the bun
 * process-global mock-bleed that plagues @/lib/scheduled-emails imports).
 */
import { describe, expect, it, mock } from 'bun:test'
import { claimDuePendingEmails } from '@/lib/scheduled-emails-claim'
import type { ScheduledEmail } from '@/lib/schemas/emails'

function makeRow(overrides: Partial<ScheduledEmail> = {}): ScheduledEmail {
	return {
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
		createdAt: new Date(),
		...overrides
	}
}

/**
 * Build a db-like double whose candidate SELECT always returns the same row,
 * and whose claim UPDATE returns the supplied per-call results (.returning()).
 * The select chain matches the real SELECT shape:
 *   select().from().where().orderBy().limit()
 * The update chain matches the real claim shape:
 *   update().set().where().returning()
 */
function makeDb(
	candidateRows: ScheduledEmail[],
	claimReturns: ScheduledEmail[][]
) {
	let claimCall = 0
	const returningSpy = mock().mockImplementation(() => {
		const v = claimReturns[claimCall] ?? []
		claimCall++
		return Promise.resolve(v)
	})
	const limitSpy = mock().mockResolvedValue(candidateRows)
	const select = mock().mockReturnValue({
		from: mock().mockReturnValue({
			where: mock().mockReturnValue({
				orderBy: mock().mockReturnValue({ limit: limitSpy })
			})
		})
	})
	const whereSpy = mock().mockReturnValue({ returning: returningSpy })
	const update = mock().mockReturnValue({
		set: mock().mockReturnValue({ where: whereSpy })
	})
	return {
		db: { select, update } as unknown as Parameters<
			typeof claimDuePendingEmails
		>[0],
		returningSpy,
		whereSpy
	}
}

describe('BUG-01 claimDuePendingEmails atomic claim', () => {
	it('claims a row exactly once across two overlapping passes (returning gate)', async () => {
		const row = makeRow()
		// Pass 1 claim returns the row; pass 2 claim returns [] (already claimed).
		const { db, returningSpy } = makeDb([row], [[row], []])
		const now = new Date()

		const pass1 = await claimDuePendingEmails(db, now)
		const pass2 = await claimDuePendingEmails(db, now)

		// Pass 1 surfaces the row to the send loop; pass 2 surfaces nothing.
		expect(pass1).toHaveLength(1)
		expect(pass1[0]?.id).toBe('email-row-1')
		expect(pass2).toHaveLength(0)

		// The claim went through .returning() (the rows-affected gate) both times.
		expect(returningSpy).toHaveBeenCalledTimes(2)
	})

	it('returns [] (nothing to send) when the claim UPDATE affects no rows', async () => {
		const row = makeRow()
		// Candidate SELECT finds the row, but the claim UPDATE returns [] — e.g.
		// a concurrent pass already claimed it between SELECT and UPDATE.
		const { db, returningSpy } = makeDb([row], [[]])
		const claimed = await claimDuePendingEmails(db, new Date())

		expect(claimed).toHaveLength(0)
		// The claim UPDATE was still attempted (and gated by .returning()).
		expect(returningSpy).toHaveBeenCalledTimes(1)
	})

	it('skips the claim UPDATE entirely when no candidates are due', async () => {
		const { db, returningSpy, whereSpy } = makeDb([], [])
		const claimed = await claimDuePendingEmails(db, new Date())

		expect(claimed).toHaveLength(0)
		// No candidates -> no claim UPDATE issued at all.
		expect(whereSpy).not.toHaveBeenCalled()
		expect(returningSpy).not.toHaveBeenCalled()
	})
})

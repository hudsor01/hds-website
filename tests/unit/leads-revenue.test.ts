/**
 * Lead -> sale revenue reporting.
 *  - markLeadWonSchema: coerces + validates the closed-deal value (pure).
 *  - markLeadWon: writes status='won' + deal_value (numeric->string) + won_at.
 *
 * markLeadWon loads leads-queries by absolute path + a unique query so it binds
 * to the COMPLETE @/lib/db mock registered here (db is a real boundary; bun#7823
 * means a sibling suite may have cached the module against a different db mock).
 */

import { afterEach, describe, expect, it, mock } from 'bun:test'
import { markLeadWonSchema } from '@/lib/schemas/admin-leads'
import { cleanupMocks } from '../test-utils'

const UUID = '11111111-1111-4111-8111-111111111111'

describe('markLeadWonSchema', () => {
	it('coerces a numeric-string deal value and accepts a positive amount', () => {
		const r = markLeadWonSchema.safeParse({ id: UUID, dealValue: '4500' })
		expect(r.success).toBe(true)
		if (r.success) {
			expect(r.data.dealValue).toBe(4500)
		}
	})

	it('rejects zero / negative / non-numeric deal values', () => {
		expect(markLeadWonSchema.safeParse({ id: UUID, dealValue: '0' }).success).toBe(
			false
		)
		expect(
			markLeadWonSchema.safeParse({ id: UUID, dealValue: '-10' }).success
		).toBe(false)
		expect(
			markLeadWonSchema.safeParse({ id: UUID, dealValue: 'abc' }).success
		).toBe(false)
	})

	it('rejects a malformed lead id', () => {
		expect(
			markLeadWonSchema.safeParse({ id: 'not-a-uuid', dealValue: '100' }).success
		).toBe(false)
	})
})

const LEADS_QUERIES_SPECIFIER = new URL(
	'../../src/lib/admin/leads-queries.ts',
	import.meta.url
).pathname

async function importLeadsQueriesFresh() {
	return import(
		`${LEADS_QUERIES_SPECIFIER}?fresh=${Date.now()}-${Math.random()}`
	)
}

let capturedSet: Record<string, unknown> | undefined

function mockDb(returnedRow: unknown): void {
	capturedSet = undefined
	mock.module('@/lib/db', () => ({
		db: {
			select: mock().mockReturnValue({
				from: mock().mockReturnValue({
					where: mock().mockReturnValue({ limit: mock().mockResolvedValue([]) }),
					orderBy: mock().mockResolvedValue([]),
					limit: mock().mockResolvedValue([])
				})
			}),
			insert: mock().mockReturnValue({
				values: mock().mockReturnValue({ returning: mock().mockResolvedValue([]) })
			}),
			update: mock().mockReturnValue({
				set: mock((payload: Record<string, unknown>) => {
					capturedSet = payload
					return {
						where: mock().mockReturnValue({
							returning: mock().mockResolvedValue(
								returnedRow ? [returnedRow] : []
							)
						})
					}
				})
			}),
			delete: mock().mockReturnValue({ where: mock().mockResolvedValue([]) })
		}
	}))
}

describe('markLeadWon', () => {
	afterEach(() => {
		cleanupMocks()
	})

	it("sets status='won', stringified deal_value, and won_at; returns the row", async () => {
		const row = { id: 'lead-1', status: 'won', dealValue: '4500' }
		mockDb(row)
		const { markLeadWon } = await importLeadsQueriesFresh()
		const result = await markLeadWon('lead-1', 4500)
		expect(result).toEqual(row)
		expect(capturedSet?.status).toBe('won')
		// numeric column maps to a string in Drizzle
		expect(capturedSet?.dealValue).toBe('4500')
		expect(capturedSet?.wonAt).toBeInstanceOf(Date)
	})

	it('returns null when no row matches (lead not found)', async () => {
		mockDb(null)
		const { markLeadWon } = await importLeadsQueriesFresh()
		const result = await markLeadWon('missing', 100)
		expect(result).toBeNull()
	})
})

import 'server-only'

import { and, count, desc, isNotNull, sql } from 'drizzle-orm'
import { type AdminQueryResult, err, ok } from '@/lib/admin/query-result'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import {
	type Lead,
	leadAttribution,
	leads,
	pageAnalytics,
	webVitals
} from '@/lib/schemas/schema'

export type VisitorsByDayRow = {
	date: string
	pageviews: number
}

export type TopPagesRow = {
	pathname: string
	pageviews: number
	uniqueVisitors: number
}

export type TrafficSourceRow = {
	channel: string
	count: number
}

export type WebVitalsP75Row = {
	name: string
	p75: number
	sampleCount: number
}

export type RecentLeadRow = Pick<
	Lead,
	'id' | 'email' | 'source' | 'status' | 'createdAt'
>

/**
 * Daily pageview totals over the last N days.
 * Aggregates page_analytics rows by UTC day; result is ordered ascending.
 */
export async function getVisitorsByDay(
	days: number = 30
): Promise<AdminQueryResult<VisitorsByDayRow[]>> {
	try {
		const dayExpr = sql<string>`to_char(date_trunc('day', ${pageAnalytics.date}), 'YYYY-MM-DD')`
		const pageviewsExpr = sql<number>`coalesce(sum(${pageAnalytics.pageViews}), 0)::int`

		const rows = await db
			.select({
				date: dayExpr,
				pageviews: pageviewsExpr
			})
			.from(pageAnalytics)
			.where(
				sql`${pageAnalytics.date} >= now() - (${days} || ' days')::interval`
			)
			.groupBy(dayExpr)
			.orderBy(dayExpr)

		return ok(
			rows.map(row => ({
				date: row.date,
				pageviews: Number(row.pageviews)
			}))
		)
	} catch (error) {
		logger.error('dashboard-queries.getVisitorsByDay failed', error)
		return err()
	}
}

/**
 * Top N pages by pageviews over the last N days.
 */
export async function getTopPages(
	limit: number = 10,
	days: number = 30
): Promise<AdminQueryResult<TopPagesRow[]>> {
	try {
		const pageviewsExpr = sql<number>`coalesce(sum(${pageAnalytics.pageViews}), 0)::int`
		const uniqueExpr = sql<number>`coalesce(sum(${pageAnalytics.uniqueVisitors}), 0)::int`

		const rows = await db
			.select({
				pathname: pageAnalytics.pathname,
				pageviews: pageviewsExpr,
				uniqueVisitors: uniqueExpr
			})
			.from(pageAnalytics)
			.where(
				sql`${pageAnalytics.date} >= now() - (${days} || ' days')::interval`
			)
			.groupBy(pageAnalytics.pathname)
			.orderBy(desc(pageviewsExpr))
			.limit(limit)

		return ok(
			rows.map(row => ({
				pathname: row.pathname,
				pageviews: Number(row.pageviews),
				uniqueVisitors: Number(row.uniqueVisitors)
			}))
		)
	} catch (error) {
		logger.error('dashboard-queries.getTopPages failed', error)
		return err()
	}
}

/**
 * Lead attribution counts grouped by channel over the last N days.
 * Returns raw rows ordered by count desc; widgets apply any top-N + Other bucketing.
 */
export async function getTrafficSources(
	days: number = 30
): Promise<AdminQueryResult<TrafficSourceRow[]>> {
	try {
		const countExpr = count()

		const rows = await db
			.select({
				channel: leadAttribution.channel,
				count: countExpr
			})
			.from(leadAttribution)
			.where(
				and(
					sql`${leadAttribution.timestamp} >= now() - (${days} || ' days')::interval`,
					isNotNull(leadAttribution.channel)
				)
			)
			.groupBy(leadAttribution.channel)
			.orderBy(desc(countExpr))

		return ok(
			rows
				.filter(
					(row): row is { channel: string; count: number } =>
						row.channel !== null
				)
				.map(row => ({
					channel: row.channel,
					count: Number(row.count)
				}))
		)
	} catch (error) {
		logger.error('dashboard-queries.getTrafficSources failed', error)
		return err()
	}
}

/**
 * p75 of Web Vitals values grouped by metric name over the last N days.
 * Uses percentile_cont (linear interpolation) so the p75 sits between samples
 * rather than snapping to an existing value -- closer to what the Web Vitals
 * dashboards in Vercel / CrUX report.
 */
export async function getWebVitalsP75(
	days: number = 7
): Promise<AdminQueryResult<WebVitalsP75Row[]>> {
	try {
		const p75Expr = sql<number>`percentile_cont(0.75) within group (order by ${webVitals.value}::numeric)`
		const sampleExpr = sql<number>`count(*)::int`

		const rows = await db
			.select({
				name: webVitals.name,
				p75: p75Expr,
				sampleCount: sampleExpr
			})
			.from(webVitals)
			.where(
				sql`${webVitals.timestamp} >= now() - (${days} || ' days')::interval`
			)
			.groupBy(webVitals.name)
			.orderBy(webVitals.name)

		return ok(
			rows.map(row => ({
				name: row.name,
				p75: Number(row.p75),
				sampleCount: Number(row.sampleCount)
			}))
		)
	} catch (error) {
		logger.error('dashboard-queries.getWebVitalsP75 failed', error)
		return err()
	}
}

/**
 * Most recent leads, newest first.
 */
export async function getRecentLeads(
	limit: number = 10
): Promise<AdminQueryResult<RecentLeadRow[]>> {
	try {
		const rows = await db
			.select({
				id: leads.id,
				email: leads.email,
				source: leads.source,
				status: leads.status,
				createdAt: leads.createdAt
			})
			.from(leads)
			.orderBy(desc(leads.createdAt))
			.limit(limit)

		return ok(rows)
	} catch (error) {
		logger.error('dashboard-queries.getRecentLeads failed', error)
		return err()
	}
}

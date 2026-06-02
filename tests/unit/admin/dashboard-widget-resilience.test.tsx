/**
 * Phase 13 consumer-layer regression armor: per-widget dashboard resilience
 * (ADMINERR-01..03, the v4 per-widget isolation contract).
 *
 * Each dashboard widget receives its OWN `AdminQueryResult` and renders its own
 * inline `AdminErrorState` on the error variant, while a healthy result renders
 * the widget's content. Because every dashboard query RETURNS its failure (the
 * error variant) rather than throwing, the page's `Promise.all` never rejects
 * and one failed widget cannot blank the page: the other widgets still render.
 *
 * These render tests lock that boundary at the component level (mirroring
 * project-card.test.tsx; happy-dom is registered in tests/setup.ts):
 *   - error variant  -> a `role="alert"` AdminErrorState card appears with the
 *                       widget's resource label.
 *   - ok variant     -> the widget's real content renders and NO alert appears.
 *   - a mixed dashboard render (4 ok + 1 err) -> exactly ONE alert, and the
 *     healthy widgets' content is still present.
 *
 * The two recharts widgets (VisitorsChart, TrafficSourcesPie) are tested on
 * their error + empty branches only, which return before any recharts element
 * is constructed; their full chart render needs browser layout APIs recharts
 * cannot get in happy-dom. The mixed-dashboard test mocks recharts to a
 * passthrough so the real widget tree renders.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { render, within } from '@testing-library/react'
import { RecentLeadsPanel } from '@/components/admin/widgets/RecentLeadsPanel'
import { TopPagesTable } from '@/components/admin/widgets/TopPagesTable'
import { WebVitalsCards } from '@/components/admin/widgets/WebVitalsCards'
import { err, ok } from '@/lib/admin/query-result'

const NOW = new Date('2026-01-15T12:00:00.000Z')

describe('RecentLeadsPanel resilience', () => {
	test('error variant renders AdminErrorState (not the empty-state copy)', () => {
		const { container } = render(<RecentLeadsPanel result={err()} />)
		expect(within(container).getByRole('alert')).toBeTruthy()
		expect(container.textContent).toContain('Could not load recent leads')
		// The error state must NOT be confused with the "no data" empty state.
		expect(container.textContent).not.toContain('No leads yet.')
	})

	test('ok variant renders the lead rows and shows NO alert', () => {
		const { container } = render(
			<RecentLeadsPanel
				result={ok([
					{
						id: 'l-1',
						email: 'alice@example.com',
						source: 'organic',
						status: 'new',
						createdAt: NOW
					}
				])}
			/>
		)
		expect(container.textContent).toContain('alice@example.com')
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})

	test('ok-but-empty variant renders the empty state, NOT the error state', () => {
		const { container } = render(<RecentLeadsPanel result={ok([])} />)
		expect(container.textContent).toContain('No leads yet.')
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})
})

describe('TopPagesTable resilience', () => {
	test('error variant renders AdminErrorState', () => {
		const { container } = render(<TopPagesTable result={err()} />)
		expect(within(container).getByRole('alert')).toBeTruthy()
		expect(container.textContent).toContain('Could not load page analytics')
		expect(container.querySelector('table')).toBeFalsy()
	})

	test('ok variant renders the table rows and shows NO alert', () => {
		const { container } = render(
			<TopPagesTable
				result={ok([
					{ pathname: '/pricing', pageviews: 1234, uniqueVisitors: 567 }
				])}
			/>
		)
		expect(container.querySelector('table')).toBeTruthy()
		expect(container.textContent).toContain('/pricing')
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})
})

describe('WebVitalsCards resilience (top-level error branch)', () => {
	test('error variant renders AdminErrorState and no KPI grid', () => {
		const { container } = render(<WebVitalsCards result={err()} />)
		expect(within(container).getByRole('alert')).toBeTruthy()
		expect(container.textContent).toContain('Could not load web vitals')
	})

	test('ok variant renders the six CWV KPI labels and shows NO alert', () => {
		const { container } = render(
			<WebVitalsCards
				result={ok([{ name: 'LCP', p75: 1800, sampleCount: 42 }])}
			/>
		)
		for (const name of ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']) {
			expect(container.textContent).toContain(name)
		}
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})
})

// The recharts widgets: error + empty branches return before any recharts
// element is built, so they render safely in happy-dom without a recharts mock.
describe('recharts widgets: error + empty branches', () => {
	test('VisitorsChart error variant renders AdminErrorState (no chart)', async () => {
		const { VisitorsChart } = await import(
			'@/components/admin/widgets/VisitorsChart'
		)
		const { container } = render(<VisitorsChart result={err()} />)
		expect(within(container).getByRole('alert')).toBeTruthy()
		expect(container.textContent).toContain('Could not load traffic data')
		expect(container.querySelector('[role="img"]')).toBeFalsy()
	})

	test('VisitorsChart ok-but-empty renders the empty state, NOT the error state', async () => {
		const { VisitorsChart } = await import(
			'@/components/admin/widgets/VisitorsChart'
		)
		const { container } = render(<VisitorsChart result={ok([])} />)
		expect(container.textContent).toContain('No traffic data yet.')
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})

	test('TrafficSourcesPie error variant renders AdminErrorState (no chart)', async () => {
		const { TrafficSourcesPie } = await import(
			'@/components/admin/widgets/TrafficSourcesPie'
		)
		const { container } = render(<TrafficSourcesPie result={err()} />)
		expect(within(container).getByRole('alert')).toBeTruthy()
		expect(container.textContent).toContain(
			'Could not load traffic source data'
		)
		expect(container.querySelector('[role="img"]')).toBeFalsy()
	})

	test('TrafficSourcesPie ok-but-empty renders the empty state, NOT the error state', async () => {
		const { TrafficSourcesPie } = await import(
			'@/components/admin/widgets/TrafficSourcesPie'
		)
		const { container } = render(<TrafficSourcesPie result={ok([])} />)
		expect(container.textContent).toContain('No traffic source data yet.')
		expect(within(container).queryByRole('alert')).toBeFalsy()
	})
})

// Dashboard-level resilience: render the EXACT five-widget composition the
// dashboard page uses, with four healthy results and ONE failing widget, and
// assert (a) exactly one AdminErrorState alert appears and (b) the healthy
// widgets' content is still present. recharts is mocked to a passthrough so the
// two chart widgets render in happy-dom without browser layout APIs.
describe('dashboard composition: one failing widget does not blank the page', () => {
	beforeEach(() => {
		// happy-dom lacks ResizeObserver, which recharts' ResponsiveContainer
		// requires. Mock the recharts surface the widgets import to plain
		// passthrough divs so the real widget components mount.
		mock.module('recharts', () => {
			const React = require('react')
			const passthrough = ({ children }: { children?: unknown }) =>
				React.createElement('div', null, children)
			const leaf = () => null
			return {
				ResponsiveContainer: passthrough,
				LineChart: passthrough,
				PieChart: passthrough,
				Pie: passthrough,
				Cell: leaf,
				Line: leaf,
				CartesianGrid: leaf,
				XAxis: leaf,
				YAxis: leaf,
				Tooltip: leaf,
				Legend: leaf
			}
		})
	})

	test('renders exactly one alert (the failing widget) while the others render content', async () => {
		const { VisitorsChart } = await import(
			'@/components/admin/widgets/VisitorsChart'
		)
		const { TrafficSourcesPie } = await import(
			'@/components/admin/widgets/TrafficSourcesPie'
		)

		// Mirror dashboard/page.tsx: VisitorsChart, WebVitalsCards, TopPagesTable,
		// TrafficSourcesPie, RecentLeadsPanel. The TopPagesTable query fails; the
		// other four are healthy.
		const { container } = render(
			<div>
				<VisitorsChart result={ok([{ date: '2026-01-01', pageviews: 10 }])} />
				<WebVitalsCards
					result={ok([{ name: 'LCP', p75: 1800, sampleCount: 9 }])}
				/>
				<TopPagesTable result={err()} />
				<TrafficSourcesPie result={ok([{ channel: 'organic', count: 5 }])} />
				<RecentLeadsPanel
					result={ok([
						{
							id: 'l-1',
							email: 'bob@example.com',
							source: 'direct',
							status: 'new',
							createdAt: NOW
						}
					])}
				/>
			</div>
		)

		// Exactly ONE widget shows an error card.
		const alerts = within(container).getAllByRole('alert')
		expect(alerts.length).toBe(1)
		expect(container.textContent).toContain('Could not load page analytics')

		// The four healthy widgets still rendered their content.
		expect(container.textContent).toContain('LCP') // WebVitalsCards
		expect(container.textContent).toContain('bob@example.com') // RecentLeadsPanel
		// The chart widgets passed the error/empty branch and reached the chart
		// container (role="img"); both healthy charts rendered.
		expect(container.querySelectorAll('[role="img"]').length).toBe(2)
	})
})

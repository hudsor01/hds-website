/**
 * Tools E2E Tests
 * =============================================================================
 *
 * Smoke tests for the /tools index page and key tool generator pages.
 * Verifies routes resolve, pages render, and core UI elements are present.
 *
 * Strategy: smoke-test level — confirm page loads and key elements visible.
 * The invoice generator also runs one real PDF download end to end; other
 * full interaction tests (form submission) are out of scope.
 */

import { expect, type Page, test } from '@playwright/test'

test.describe('Tools Index', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools')
		await page.waitForLoadState('networkidle')
	})

	test('should display tools page heading', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible()
		await expect(page.locator('h1')).toContainText(/business tools/i)
	})

	test('should display tool cards linking to /tools/*', async ({ page }) => {
		const toolLinks = page.locator('a[href^="/tools/"]')
		const count = await toolLinks.count()
		expect(count).toBeGreaterThanOrEqual(13)
	})

	test('should link to the paystub calculator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/paystub-calculator"]')
		).toBeVisible()
	})

	test('should link to the invoice generator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/invoice-generator"]')
		).toBeVisible()
	})

	test('should link to the contract generator', async ({ page }) => {
		await expect(
			page.locator('a[href="/tools/contract-generator"]')
		).toBeVisible()
	})
})

test.describe('Paystub Calculator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/paystub-calculator')
		await page.waitForLoadState('networkidle')
	})

	test('should display paystub page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /paystub/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field', async ({ page }) => {
		const inputs = page.locator('input, textarea')
		expect(await inputs.count()).toBeGreaterThan(0)
	})

	test('tax year dropdown offers only 2026 (no 2025)', async ({ page }) => {
		await page.locator('#taxYear').click()
		const options = page.locator('[role="option"]')
		await expect(options.filter({ hasText: '2026' })).toHaveCount(1)
		await expect(options.filter({ hasText: '2025' })).toHaveCount(0)
	})
})

test.describe('Paystub Calculator URL restore (PAYSTUB-10 intersect)', () => {
	test('?state=AL (unsupported) does NOT select Alabama', async ({ page }) => {
		await page.goto('/tools/paystub-calculator?state=AL')
		await page.waitForLoadState('networkidle')
		// The state trigger keeps its placeholder; an unsupported code is dropped.
		const stateTrigger = page.locator('#state')
		await expect(stateTrigger).not.toContainText(/alabama/i)
		await expect(stateTrigger).toContainText(/select state/i)
	})

	test('?state=ca (supported, lowercase) selects California', async ({
		page
	}) => {
		await page.goto('/tools/paystub-calculator?state=ca')
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#state')).toContainText(/california/i)
	})

	test('?state=TX (no-income-tax) selects Texas', async ({ page }) => {
		await page.goto('/tools/paystub-calculator?state=TX')
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#state')).toContainText(/texas/i)
	})

	test('?year=2025 (stale) clamps to 2026, does not block the form', async ({
		page
	}) => {
		await page.goto('/tools/paystub-calculator?year=2025')
		await page.waitForLoadState('networkidle')
		// A stale year is clamped to the supported default; the trigger shows 2026.
		await expect(page.locator('#taxYear')).toContainText('2026')
		await expect(page.locator('#taxYear')).not.toContainText('2025')
	})
})

test.describe('Texas TTL Calculator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/ttl-calculator')
		await page.evaluate(() => localStorage.removeItem('calculator-store'))
		await page.reload()
		await page.waitForLoadState('networkidle')
	})

	test('shows results for the default inputs without any action', async ({
		page
	}) => {
		// $30,000 new car in Dallas: 6.25% tax, $33 title, $148 for 24 months of
		// registration, $10 plate fee
		await expect(page.getByText('$1,875.00')).toBeVisible()
		await expect(page.getByText('$2,066.00')).toBeVisible()
	})

	test('recalculates when the price changes', async ({ page }) => {
		await page.locator('#purchasePrice').fill('40000')
		await expect(page.getByText('$2,500.00')).toBeVisible()
		await expect(page.getByText('$2,691.00')).toBeVisible()
	})

	test('rejects a negative purchase price with an inline error', async ({
		page
	}) => {
		await page.locator('#purchasePrice').fill('-5000')
		await expect(page.getByText('Enter a price of $0 or more.')).toBeVisible()
		await expect(page.locator('#purchasePrice')).toHaveAttribute(
			'aria-invalid',
			'true'
		)
		await expect(
			page.getByText('Fix the highlighted fields to see your results.')
		).toBeVisible()
		await expect(page.getByText('Total TTL')).toHaveCount(0)
	})

	test('names every dropdown and checkbox by its label', async ({ page }) => {
		await expect(
			page.getByRole('combobox', { name: 'Texas County', exact: true })
		).toBeVisible()
		await expect(
			page.getByRole('combobox', { name: 'Loan Term', exact: true })
		).toBeVisible()
		await expect(
			page.getByRole('checkbox', { name: /^New Vehicle/ })
		).toBeVisible()
		await expect(
			page.getByRole('checkbox', { name: /^Used Vehicle/ })
		).toBeVisible()
		await expect(
			page.getByRole('checkbox', { name: /^Electric Vehicle/ })
		).toBeVisible()
	})
})

test.describe('Invoice Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/invoice-generator')
		await page.waitForLoadState('networkidle')
	})

	test('should display invoice page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /invoice/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field or button', async ({
		page
	}) => {
		const interactive = page.locator(
			'input, textarea, button[type="button"], button[type="submit"]'
		)
		expect(await interactive.count()).toBeGreaterThan(0)
	})

	test('downloads the invoice as a PDF', async ({ page }) => {
		// react-pdf lays out pages with yoga-layout (WebAssembly), so this
		// also guards the production CSP's 'wasm-unsafe-eval' when run
		// against `next start`.
		// The business name is no longer prefilled, so the invoice needs one
		await page.getByPlaceholder('Your business name').fill('Test Plumbing')
		await page.getByLabel('Client Name').fill('Acme Co')
		await page
			.getByPlaceholder('Service or product description')
			.first()
			.fill('Website build')
		await page.getByPlaceholder('0.00').first().fill('1500')

		const downloadPromise = page.waitForEvent('download')
		await page.getByRole('button', { name: 'Download PDF' }).click()
		const download = await downloadPromise

		expect(download.suggestedFilename()).toMatch(/\.pdf$/)
	})
})

test.describe('Contract Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tools/contract-generator')
		await page.waitForLoadState('networkidle')
	})

	test('should display contract page heading', async ({ page }) => {
		const heading = page
			.locator('h1, h2')
			.filter({ hasText: /contract/i })
			.first()
		await expect(heading).toBeVisible()
	})

	test('should display at least one input field or button', async ({
		page
	}) => {
		const interactive = page.locator(
			'input, textarea, button[type="button"], button[type="submit"]'
		)
		expect(await interactive.count()).toBeGreaterThan(0)
	})
})

// These pages read URL state behind Suspense (QA-04); shared links must
// still restore after hydration and Start over must still clear the URL
test.describe('Tool URL state after the server-rendered shell', () => {
	test('a shared mortgage link restores and Start Over clears it', async ({
		page
	}) => {
		await page.goto('/tools/mortgage-calculator?price=500000&dp=50000&type=fha')
		// Wait for the streamed content to replace the Suspense fallback
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#homePrice')).toHaveValue('500000')
		await expect(page.locator('#downPayment')).toHaveValue('50000')
		await expect(
			page.getByRole('combobox', { name: 'Loan Type', exact: true })
		).toContainText('FHA')

		await page.getByRole('button', { name: 'Calculate Payment' }).click()
		await page.getByRole('button', { name: 'Start Over' }).click()
		await expect(page).toHaveURL(/\/tools\/mortgage-calculator$/)
		await expect(page.locator('#homePrice')).toHaveValue('350000')
	})

	test('a shared cost estimator link restores and Start over clears it', async ({
		page
	}) => {
		await page.goto(
			'/tools/cost-estimator?type=e-commerce&pages=12&features=blog,payment'
		)
		// Wait for the streamed content to replace the Suspense fallback
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#numberOfPages')).toHaveValue('12')
		await expect(
			page.getByRole('combobox', { name: /^Website Type/ })
		).toContainText('E-Commerce Store')
		await expect(
			page.getByRole('checkbox', { name: 'Blog/News Section' })
		).toBeChecked()

		await page.getByRole('button', { name: 'Start over' }).click()
		await expect(page).toHaveURL(/\/tools\/cost-estimator$/)
		await expect(page.locator('#numberOfPages')).toHaveValue('5')
	})

	test('the paystub form mirrors to the URL and Clear Form clears it', async ({
		page
	}) => {
		await page.goto('/tools/paystub-calculator?name=Jane&rate=30&hours=80')
		// Wait for the streamed content to replace the Suspense fallback
		await page.waitForLoadState('networkidle')
		await expect(page.locator('#employeeName')).toHaveValue('Jane')
		await expect(page.locator('#hourlyRate')).toHaveValue('30')

		await page.locator('#employeeName').fill('Janet')
		await expect(page).toHaveURL(/name=Janet/)

		await page.getByRole('button', { name: 'Clear Form' }).click()
		await expect(page).not.toHaveURL(/name=/)
		await expect(page.locator('#employeeName')).toHaveValue('')
	})
})

test.describe('ROI Calculator bounds', () => {
	test('a 1e12 visitor link shows the visitors error and no results', async ({
		page
	}) => {
		await page.goto(
			'/tools/roi-calculator?traffic=1000000000000&conv=2&aov=100'
		)
		await expect(
			page.getByText('Enter 100,000,000 visitors or fewer.')
		).toBeVisible()
		await expect(page.getByText('Current Annual Revenue')).toHaveCount(0)
	})

	test('large results read in compact notation', async ({ page }) => {
		await page.goto('/tools/roi-calculator?traffic=100000000&conv=2&aov=1000')
		// 100,000,000 x 2% x $1,000 x 12 = $24 billion a year
		await expect(page.getByText('$24B', { exact: true })).toBeVisible()
	})
})

// Heading levels in the page content (the footer is owned elsewhere) must
// never skip a level going down, for example an h2 followed by an h4.
async function headingSkips(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const headings = Array.from(
			document.querySelectorAll('h1, h2, h3, h4, h5, h6')
		).filter(el => !el.closest('footer'))
		const skips: string[] = []
		let previous = 0
		for (const el of headings) {
			const level = Number(el.tagName.slice(1))
			if (previous > 0 && level > previous + 1) {
				skips.push(`h${previous} -> h${level} "${el.textContent?.trim()}"`)
			}
			previous = level
		}
		return skips
	})
}

test.describe('Tool heading order @accessibility', () => {
	// ROI and cost estimator links show results on load; TTL shows results
	// for its defaults
	for (const path of [
		'/tools/roi-calculator?traffic=10000&conv=2&aov=100',
		'/tools/ttl-calculator',
		'/tools/performance-calculator',
		'/tools/cost-estimator?type=business-website',
		'/tools/mortgage-calculator',
		'/tools/paystub-calculator'
	]) {
		test(`${path} has no skipped heading levels`, async ({ page }) => {
			await page.goto(path)
			await page.waitForLoadState('networkidle')
			await expect(page.locator('h1')).toHaveCount(1)
			expect(await headingSkips(page)).toEqual([])
		})
	}
})

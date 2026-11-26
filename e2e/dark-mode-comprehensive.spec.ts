import { expect, type Page, test } from '@playwright/test'
import { createTestLogger } from './test-logger'

/**
 * Dark Mode - Light Only
 *
 * The site is light only: globals.css has no dark palette, no `.dark`
 * class and no `dark:` utilities, and `:root` sets `color-scheme: light`.
 * These specs pin that contract under an OS dark preference, so a stray
 * dark: utility, a `.dark` token block or a theme provider cannot bring
 * back a half-dark page (one where a few controls turn dark on a light
 * page) without failing here.
 */

const PAGES = [
	{ name: 'home', path: '/' },
	{ name: 'contact', path: '/contact' },
	{ name: 'json-formatter', path: '/tools/json-formatter' }
] as const

interface ElementColors {
	selector: string
	color: string
	backgroundColor: string
	borderColor: string
}

/** Computed color, background and border colors for every rendered element. */
async function collectColors(page: Page): Promise<ElementColors[]> {
	// nextjs-portal is the Next.js dev overlay. It only exists on the dev
	// server the e2e suite runs, ships its own theme that follows the OS
	// preference, and never reaches production, so it is not site CSS.
	return page.evaluate(() =>
		Array.from(document.querySelectorAll('body *:not(nextjs-portal)')).map(
			(el, index) => {
				const style = getComputedStyle(el)
				const id = el.id ? `#${el.id}` : ''
				return {
					selector: `${index}:${el.tagName.toLowerCase()}${id}`,
					color: style.color,
					backgroundColor: style.backgroundColor,
					borderColor: [
						style.borderTopColor,
						style.borderRightColor,
						style.borderBottomColor,
						style.borderLeftColor
					].join(' ')
				}
			}
		)
	)
}

async function settle(page: Page): Promise<void> {
	await page.evaluate(
		() =>
			new Promise<void>(resolve =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			)
	)
}

test.describe('Dark Mode - Light Only', () => {
	for (const pageDef of PAGES) {
		test(`${pageDef.name} renders light under an OS dark preference`, async ({
			page
		}, testInfo) => {
			const logger = createTestLogger(testInfo.title)

			await page.emulateMedia({ colorScheme: 'dark' })
			logger.step(
				`Navigating to ${pageDef.path} with prefers-color-scheme: dark`
			)
			await page.goto(pageDef.path)
			await page.waitForLoadState('networkidle')

			const scheme = await page.evaluate(() => {
				// Probe element painted with the bg-background / text-foreground
				// utilities: body must resolve to the same colors.
				const probe = document.createElement('div')
				probe.className = 'bg-background text-foreground'
				document.body.appendChild(probe)
				const probeStyle = getComputedStyle(probe)
				const result = {
					htmlHasDark: document.documentElement.classList.contains('dark'),
					darkElements: document.querySelectorAll('.dark').length,
					colorScheme: getComputedStyle(document.documentElement).colorScheme,
					bodyBackground: getComputedStyle(document.body).backgroundColor,
					bodyColor: getComputedStyle(document.body).color,
					probeBackground: probeStyle.backgroundColor,
					probeColor: probeStyle.color
				}
				probe.remove()
				return result
			})
			logger.analysis('document', 'scheme', scheme)

			expect(scheme.htmlHasDark).toBe(false)
			expect(scheme.darkElements).toBe(0)
			expect(scheme.colorScheme).toBe('light')
			expect(scheme.bodyBackground).not.toBe('rgba(0, 0, 0, 0)')
			expect(scheme.bodyBackground).toBe(scheme.probeBackground)
			expect(scheme.bodyColor).toBe(scheme.probeColor)

			logger.complete('Page stays light under an OS dark preference')
		})

		test(`${pageDef.name} has no color changes between light and dark preference`, async ({
			page
		}, testInfo) => {
			const logger = createTestLogger(testInfo.title)

			await page.emulateMedia({ colorScheme: 'light' })
			logger.step(`Navigating to ${pageDef.path}`)
			await page.goto(pageDef.path)
			await page.waitForLoadState('networkidle')
			await settle(page)
			const light = await collectColors(page)

			// Same DOM, preference flipped: any difference is a style that
			// responds to prefers-color-scheme.
			logger.step('Switching the OS preference to dark')
			await page.emulateMedia({ colorScheme: 'dark' })
			await settle(page)
			const dark = await collectColors(page)

			expect(dark.length).toBe(light.length)
			const diffs = dark.filter((element, i) => {
				const before = light[i]
				return (
					before === undefined ||
					element.color !== before.color ||
					element.backgroundColor !== before.backgroundColor ||
					element.borderColor !== before.borderColor
				)
			})
			logger.verify('elements whose colors changed', diffs.length, 0)
			expect(diffs).toEqual([])

			logger.complete('No element changes color under an OS dark preference')
		})
	}
})

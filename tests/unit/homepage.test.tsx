import { afterEach, describe, expect, it, mock } from 'bun:test'
import { cleanup, render } from '@testing-library/react'

/**
 * Homepage structural assertions — Phase 57 Hero Redesign
 *
 * These tests assert the design token requirements for HERO-01 through HERO-04.
 * They are intentionally written BEFORE the implementation changes (Wave 1 scaffold).
 * Most will FAIL against the current page.tsx — that is expected.
 * They turn green after Wave 2-3 implementation.
 *
 * HERO-01: Background treatment — no gradient, dark background class
 * HERO-02: Headline hierarchy — text-page-title on h1, no text-accent on h1
 * HERO-03: CTA differentiation — primary has bg-accent, secondary does not
 * HERO-04: Section rhythm — no bg-muted, no scale-105, no animationDelay
 */

// Mock NewsletterSignup (uses client hooks: useAppForm, useNewsletterSubscription via react-query)
// Must be declared before any imports that resolve the module
mock.module('@/components/forms/NewsletterSignup', () => ({
	NewsletterSignup: () => null
}))

// Mock next/link to render a plain anchor — required in happy-dom test environment
mock.module('next/link', () => ({
	default: ({
		href,
		children,
		className
	}: {
		href: string
		children: React.ReactNode
		className?: string
	}) => (
		<a href={href} className={className}>
			{children}
		</a>
	)
}))

import HomePage from '@/app/page'

afterEach(() => {
	cleanup()
})

describe('HomePage structural assertions', () => {
	// ── HERO-02: Headline hierarchy ──────────────────────────────────────────

	it('h1 has text-page-title class', () => {
		const { container } = render(<HomePage />)
		const h1 = container.querySelector('h1')
		expect(h1).not.toBeNull()
		expect(h1?.className ?? '').toContain('text-page-title')
	})

	it('supporting paragraph has text-muted-foreground class', () => {
		const { container } = render(<HomePage />)
		const heroSection = container.querySelector('section')
		const paragraphs = Array.from(heroSection?.querySelectorAll('p') ?? [])
		const mutedParagraph = paragraphs.find(p =>
			p.className.includes('text-muted-foreground')
		)
		expect(mutedParagraph).not.toBeNull()
	})

	it('no span inside h1 has text-accent class', () => {
		const { container } = render(<HomePage />)
		const h1 = container.querySelector('h1')
		expect(h1).not.toBeNull()

		const spans = Array.from(h1?.querySelectorAll('span') ?? [])
		const accentSpans = spans.filter(span =>
			span.className.includes('text-accent')
		)
		expect(accentSpans).toHaveLength(0)
	})

	// ── HERO-03: CTA differentiation ─────────────────────────────────────────

	it('primary CTA button has bg-accent class', () => {
		const { container } = render(<HomePage />)
		const heroSection = container.querySelector('section')
		// The CTA group contains anchor elements rendered from Button asChild
		const anchors = Array.from(heroSection?.querySelectorAll('a') ?? [])
		expect(anchors.length).toBeGreaterThan(0)

		const primaryCta = anchors[0]
		expect(primaryCta?.className ?? '').toContain('bg-accent')
	})

	it('secondary CTA button does not have bg-accent class', () => {
		const { container } = render(<HomePage />)
		const heroSection = container.querySelector('section')
		const anchors = Array.from(heroSection?.querySelectorAll('a') ?? [])
		expect(anchors.length).toBeGreaterThan(1)

		const secondaryCta = anchors[1]
		expect(secondaryCta?.className ?? '').not.toContain('bg-accent')
	})

	// ── HERO-01: Background treatment ────────────────────────────────────────

	it('hero section does not use a CSS gradient background', () => {
		const { container } = render(<HomePage />)
		const sections = Array.from(container.querySelectorAll('section'))
		const gradientSections = sections.filter(section =>
			section.className.includes('gradient')
		)
		expect(gradientSections).toHaveLength(0)
	})

	it('hero section has dark background class', () => {
		const { container } = render(<HomePage />)
		// The first section is the hero
		const heroSection = container.querySelector('section')
		expect(heroSection).not.toBeNull()

		const cls = heroSection?.className ?? ''
		const hasDarkBackground =
			cls.includes('bg-background-dark') ||
			cls.includes('bg-[var(--color-background-dark)]') ||
			cls.includes('bg-[oklch')

		expect(hasDarkBackground).toBe(true)
	})

	// ── HERO-04: Section rhythm ───────────────────────────────────────────────

	it('no section element has bg-muted class', () => {
		const { container } = render(<HomePage />)
		const sections = Array.from(container.querySelectorAll('section'))
		const mutedSections = sections.filter(section =>
			section.className.includes('bg-muted')
		)
		expect(mutedSections).toHaveLength(0)
	})

	it('no element has scale-105 class', () => {
		const { container } = render(<HomePage />)
		const allElements = Array.from(container.querySelectorAll('*'))
		const scaledElements = allElements.filter(el =>
			(el.getAttribute('class') ?? '').includes('scale-105')
		)
		expect(scaledElements).toHaveLength(0)
	})

	it('no element has animationDelay inline style', () => {
		const { container } = render(<HomePage />)
		const styledElements = Array.from(container.querySelectorAll('[style]'))
		const animDelayElements = styledElements.filter(el => {
			const style = el.getAttribute('style') ?? ''
			return (
				style.includes('animationDelay') || style.includes('animation-delay')
			)
		})
		expect(animDelayElements).toHaveLength(0)
	})
})

/**
 * Server Component Tests
 * Tests structural contracts (renders, has sections, exports metadata).
 * Does NOT assert on copy/content — that changes constantly and breaks CI.
 */

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { cleanupMocks, setupNextMocks } from '../test-utils'

// ================================
// Services Page Tests
// ================================

describe('Services Page (Server Component)', () => {
	beforeEach(() => {
		setupNextMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('should render with heading and sections', async () => {
		const ServicesPage = (await import('@/app/services/page')).default
		const { container } = render(<ServicesPage />)

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('should render service cards', async () => {
		const ServicesPage = (await import('@/app/services/page')).default
		render(<ServicesPage />)

		const serviceHeadings = screen.getAllByRole('heading', { level: 3 })
		expect(serviceHeadings.length).toBeGreaterThanOrEqual(3)
	})

	it('should have CTA links', async () => {
		const ServicesPage = (await import('@/app/services/page')).default
		render(<ServicesPage />)

		const links = screen.getAllByRole('link')
		expect(links.length).toBeGreaterThan(0)
	})

	it('should have metadata defined in layout for SEO', async () => {
		const { metadata } = await import('@/app/services/layout')

		expect(metadata).toBeDefined()
		expect(metadata.title).toBeDefined()
		expect(metadata.description).toBeDefined()
		expect(metadata.description?.length).toBeGreaterThan(50)
	})
})

// ================================
// Contact Page Tests
// ================================

describe('Contact Page (Server Component)', () => {
	it('should render with heading and main content', async () => {
		const ContactPage = (await import('@/app/contact/page')).default
		const { container } = render(<ContactPage />)

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
		const main = container.querySelector('main')
		expect(main).toBeTruthy()
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('should export metadata for SEO', async () => {
		const { metadata } = await import('@/app/contact/page')

		expect(metadata).toBeDefined()
		expect(metadata.title).toBeDefined()
		expect(metadata.description).toBeDefined()
		expect(metadata.description?.length).toBeGreaterThan(50)
	})
})

// ================================
// Server Component Best Practices Tests
// ================================

describe('Server Component Best Practices', () => {
	it('services page is a Server Component with metadata export', async () => {
		const fs = await import('node:fs/promises')
		const path = await import('node:path')
		const content = await fs.readFile(
			path.resolve(process.cwd(), 'src/app/services/page.tsx'),
			'utf-8'
		)

		expect(content.startsWith("'use client'")).toBe(false)
		expect(content.startsWith('"use client"')).toBe(false)
		expect(content).toContain('export const metadata')
	})

	it('contact page is a Server Component with metadata export', async () => {
		const fs = await import('node:fs/promises')
		const path = await import('node:path')
		const content = await fs.readFile(
			path.resolve(process.cwd(), 'src/app/contact/page.tsx'),
			'utf-8'
		)

		expect(content.startsWith("'use client'")).toBe(false)
		expect(content.startsWith('"use client"')).toBe(false)
		expect(content).toContain('export const metadata')
	})

	it('services layout should export metadata', async () => {
		const fs = await import('node:fs/promises')
		const path = await import('node:path')
		const content = await fs.readFile(
			path.resolve(process.cwd(), 'src/app/services/layout.tsx'),
			'utf-8'
		)

		expect(content).toContain('export const metadata')
	})
})

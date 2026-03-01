// RED PHASE — ToolPageLayout does not exist yet.
// Tests will fail until Plan 02 creates src/components/layout/ToolPageLayout.tsx
// This file defines the acceptance criteria for TOOL-01, TOOL-02, and TOOL-03.

import { afterEach, describe, expect, it } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
// @ts-expect-error TS2307 — ToolPageLayout does not exist yet (Plan 02 creates it)
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'

afterEach(() => {
	cleanup()
})

// ---------------------------------------------------------------------------
// TOOL-01: Header Rendering
// ---------------------------------------------------------------------------

describe('ToolPageLayout — TOOL-01: Header', () => {
	it('renders h1 with the provided title text', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				formSlot={<div>form</div>}
			/>
		)

		const heading = screen.getByRole('heading', { level: 1, name: 'Test Tool' })
		expect(heading).toBeInTheDocument()
	})

	it('renders description paragraph with text-lead and text-muted-foreground classes', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				formSlot={<div>form</div>}
			/>
		)

		const description = screen.getByText('Test description text')
		expect(description.tagName).toBe('P')
		expect(description.className).toContain('text-lead')
		expect(description.className).toContain('text-muted-foreground')
	})

	it('does NOT render any icon element in the header area', () => {
		const { container } = render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				formSlot={<div>form</div>}
			/>
		)

		// No img role, no svg that is not aria-hidden (decorative icons would be aria-hidden)
		const images = container.querySelectorAll('[role="img"]')
		expect(images.length).toBe(0)
	})

	it('header does NOT have hero-style background class', () => {
		const { container } = render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				formSlot={<div>form</div>}
			/>
		)

		const header = container.querySelector('header, [data-slot="header"]')
		const headerHtml = header?.className ?? ''
		expect(headerHtml).not.toContain('hero')
		expect(headerHtml).not.toContain('gradient-hero')
	})
})

// ---------------------------------------------------------------------------
// TOOL-03: Result Card
// ---------------------------------------------------------------------------

describe('ToolPageLayout — TOOL-03: Result Card', () => {
	it('renders with glass-card-light class on result card when resultSlot provided and hasResult=true', () => {
		const { container } = render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				resultSlot={<div data-testid="result-content">result</div>}
				hasResult={true}
			/>
		)

		// The result card container must have glass-card-light class
		const glassCard = container.querySelector('.glass-card-light')
		expect(glassCard).toBeInTheDocument()
	})

	it('renders placeholder text when hasResult=false and columns="two"', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				hasResult={false}
				resultPlaceholder="Fill in the form to see results"
			/>
		)

		expect(
			screen.getByText('Fill in the form to see results')
		).toBeInTheDocument()
	})

	it('does NOT render placeholder pane when columns="single"', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="single"
				formSlot={<div>form</div>}
				hasResult={false}
				resultPlaceholder="Fill in the form to see results"
			/>
		)

		// In single-column mode, no persistent placeholder pane is shown
		expect(
			screen.queryByText('Fill in the form to see results')
		).not.toBeInTheDocument()
	})

	it('renders action bar only when actions array is provided and non-empty', () => {
		const { container } = render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				resultSlot={<div>result</div>}
				hasResult={true}
				actions={[{ type: 'copy', label: 'Copy', onClick: () => {} }]}
			/>
		)

		// Action bar must exist when actions are provided
		const actionBar = container.querySelector('[data-slot="action-bar"]')
		expect(actionBar).toBeInTheDocument()
	})

	it('does NOT render action bar when no actions prop passed', () => {
		const { container } = render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				resultSlot={<div>result</div>}
				hasResult={true}
			/>
		)

		const actionBar = container.querySelector('[data-slot="action-bar"]')
		expect(actionBar).not.toBeInTheDocument()
	})

	it('renders Copy button when actions includes { type: "copy", label: "Copy" }', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				resultSlot={<div>result</div>}
				hasResult={true}
				actions={[{ type: 'copy', label: 'Copy', onClick: () => {} }]}
			/>
		)

		expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
	})

	it('renders Download button when actions includes { type: "download", label: "Download" }', () => {
		render(
			<ToolPageLayout
				title="Test Tool"
				description="Test description text"
				columns="two"
				formSlot={<div>form</div>}
				resultSlot={<div>result</div>}
				hasResult={true}
				actions={[{ type: 'download', label: 'Download', onClick: () => {} }]}
			/>
		)

		expect(
			screen.getByRole('button', { name: /download/i })
		).toBeInTheDocument()
	})
})

// ---------------------------------------------------------------------------
// TOOL-02: CalculatorInput Label Pattern
// ---------------------------------------------------------------------------

describe('CalculatorInput — TOOL-02: Label Pattern', () => {
	it('renders label element ABOVE the input (label appears before input in DOM order)', () => {
		const { container } = render(
			<CalculatorInput id="test-field" label="Field Label" />
		)

		const children = Array.from(container.querySelector('div')?.children ?? [])
		const labelIndex = children.findIndex(el => el.tagName === 'LABEL')
		const inputWrapperIndex = children.findIndex(el => el.tagName === 'DIV')

		// Label must appear before the input wrapper
		expect(labelIndex).toBeLessThan(inputWrapperIndex)
		expect(labelIndex).not.toBe(-1)
	})

	it('renders help text below input when helpText prop provided', () => {
		render(
			<CalculatorInput
				id="test-field"
				label="Field Label"
				helpText="This is a helpful hint"
			/>
		)

		const helpText = screen.getByText('This is a helpful hint')
		expect(helpText).toBeInTheDocument()
	})

	it('renders error text in red (text-destructive class) below input when error prop provided', () => {
		render(
			<CalculatorInput
				id="test-field"
				label="Field Label"
				error="This field is required"
			/>
		)

		const errorText = screen.getByText('This field is required')
		expect(errorText).toBeInTheDocument()
		expect(errorText.className).toContain('text-destructive')
	})
})

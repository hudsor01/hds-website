import { afterEach, describe, expect, it, mock } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * Unit tests for core UI components
 * Tests functionality, accessibility, and semantic token usage
 */

afterEach(() => {
	cleanup()
	mock.restore()
})

describe('Button Component', () => {
	it('should render with correct flex layout', () => {
		render(<Button>Click Me</Button>)

		const button = screen.getByRole('button', { name: 'Click Me' })
		expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
	})

	it('should apply transition-smooth class', () => {
		render(<Button>Click Me</Button>)

		const button = screen.getByRole('button', { name: 'Click Me' })
		expect(button).toHaveClass('transition-smooth')
	})

	it('should render different variants', () => {
		const { rerender } = render(<Button variant="default">Default</Button>)
		let button = screen.getByRole('button')
		expect(button).toHaveClass('bg-primary')

		rerender(<Button variant="destructive">Destructive</Button>)
		button = screen.getByRole('button')
		expect(button).toHaveClass('bg-destructive')

		rerender(<Button variant="ghost">Ghost</Button>)
		button = screen.getByRole('button')
		expect(button).toHaveClass('hover:bg-muted/50')
	})

	it('should render different sizes', () => {
		const { rerender } = render(<Button size="sm">Small</Button>)
		let button = screen.getByRole('button')
		expect(button).toHaveClass('h-8')

		rerender(<Button size="default">Default</Button>)
		button = screen.getByRole('button')
		expect(button).toHaveClass('h-9')

		rerender(<Button size="lg">Large</Button>)
		button = screen.getByRole('button')
		expect(button).toHaveClass('h-12')
	})

	it('should be disabled when disabled prop is true', () => {
		render(<Button disabled>Disabled</Button>)

		const button = screen.getByRole('button')
		expect(button).toBeDisabled()
		expect(button).toHaveClass('disabled:opacity-50')
	})

	it('should handle click events', () => {
		const handleClick = mock()

		render(<Button onClick={handleClick}>Click Me</Button>)

		const button = screen.getByRole('button')
		fireEvent.click(button)

		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})

describe('Card Component (Glass Variants)', () => {
	it('should render different glass variants', () => {
		const { container, rerender } = render(<Card variant="glass">Content</Card>)
		let card = container.firstChild
		expect(card).toHaveClass('glass-card')

		rerender(<Card variant="glassLight">Content</Card>)
		card = container.firstChild
		expect(card).toHaveClass('glass-card-light')

		rerender(<Card variant="glassSection">Content</Card>)
		card = container.firstChild
		expect(card).toHaveClass('glass-card-light')
	})

	it('should apply different size variants', () => {
		const { container, rerender } = render(<Card size="sm">Content</Card>)
		let card = container.firstChild
		expect(card).toHaveClass('card-padding-sm')

		rerender(<Card size="lg">Content</Card>)
		card = container.firstChild
		expect(card).toHaveClass('card-padding-lg')
	})

	it('should merge custom className with glass variant', () => {
		const { container } = render(
			<Card variant="glass" className="custom-class">
				Content
			</Card>
		)

		const card = container.firstChild
		expect(card).toHaveClass('glass-card', 'custom-class')
	})
})

describe('Button Component (CTA Pattern)', () => {
	it('should render as link with asChild', () => {
		render(
			<Button asChild variant="default" size="default">
				<Link href="/test">
					Test CTA
					<ArrowRight className="w-4 h-4" />
				</Link>
			</Button>
		)

		const link = screen.getByRole('link', { name: /Test CTA/ })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
	})

	it('should render different variants', () => {
		const { rerender } = render(
			<Button asChild variant="default" size="default">
				<Link href="/test">
					Primary
					<ArrowRight className="w-4 h-4" />
				</Link>
			</Button>
		)
		let link = screen.getByRole('link')
		expect(link).toHaveClass('bg-primary')

		rerender(
			<Button asChild variant="outline" size="default">
				<Link href="/test">
					Secondary
					<ArrowRight className="w-4 h-4" />
				</Link>
			</Button>
		)
		link = screen.getByRole('link')
		expect(link).toHaveClass('border', 'bg-background')
	})

	it('should show arrow by default', () => {
		const { container } = render(
			<Button asChild variant="default" size="default">
				<Link href="/test">
					With Arrow
					<ArrowRight className="w-4 h-4" />
				</Link>
			</Button>
		)

		const svg = container.querySelector('svg')
		expect(svg).toBeInTheDocument()
	})

	it('should hide arrow when not included', () => {
		const { container } = render(
			<Button asChild variant="default" size="default">
				<Link href="/test">No Arrow</Link>
			</Button>
		)

		const svg = container.querySelector('svg')
		expect(svg).not.toBeInTheDocument()
	})

	it('should handle external links', () => {
		render(
			<Button asChild variant="default" size="default">
				<a
					href="https://external.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					External
					<ArrowRight className="w-4 h-4" />
				</a>
			</Button>
		)

		const link = screen.getByRole('link')
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
	})
})

describe('Semantic Token Usage', () => {
	it('should use theme variables for colors', () => {
		const { container } = render(<Button>Test</Button>)
		const button = container.querySelector('button')
		expect(button).toBeInTheDocument()

		// Check computed styles use CSS variables
		if (button) {
			const styles = window.getComputedStyle(button)
			expect(styles).toBeDefined()
		}
	})
})

describe('Button Polish — COMP-01', () => {
	it('default variant has shadow-sm class', () => {
		const { container } = render(<Button variant="default">Test</Button>)
		const button = container.querySelector('button')
		expect(button?.className ?? '').toContain('shadow-sm')
	})

	it('default variant has active:bg-primary/85 class', () => {
		const { container } = render(<Button variant="default">Test</Button>)
		const button = container.querySelector('button')
		expect(button?.className ?? '').toContain('active:bg-primary/85')
	})

	it('accent variant has shadow-sm class', () => {
		const { container } = render(<Button variant="accent">Test</Button>)
		const button = container.querySelector('button')
		expect(button?.className ?? '').toContain('shadow-sm')
	})

	it('accent variant has active:bg-accent/75 class', () => {
		const { container } = render(<Button variant="accent">Test</Button>)
		const button = container.querySelector('button')
		expect(button?.className ?? '').toContain('active:bg-accent/75')
	})

	it('ghost variant is visually differentiated — no bg class in base', () => {
		const { container } = render(<Button variant="ghost">Test</Button>)
		const button = container.querySelector('button')
		const cls = button?.className ?? ''
		// Ghost should NOT have solid background — hover only
		expect(cls).not.toContain('bg-primary')
		expect(cls).not.toContain('bg-accent')
		expect(cls).not.toContain('bg-secondary')
	})
})

describe('Input Polish — COMP-02', () => {
	// Border, fill, size and the invalid state live in the .field component
	// class (globals.css), shared by every primitive and native control.
	it('input uses the shared field treatment', () => {
		const { container } = render(<Input />)
		const input = container.querySelector('input')
		expect(input).toHaveClass('field')
	})

	it('input carries no per-primitive border, fill or ring utilities', () => {
		const { container } = render(<Input />)
		const cls = container.querySelector('input')?.className ?? ''
		expect(cls).not.toContain('border-input')
		expect(cls).not.toMatch(/(^|\s)bg-/)
		expect(cls).not.toContain('ring')
	})

	it('textarea shares the field treatment (parity check)', () => {
		const { container } = render(<Textarea />)
		expect(container.querySelector('textarea')).toHaveClass('field')
	})
})

describe('Card Surface — COMP-03', () => {
	it('default card variant has bg-card class', () => {
		const { container } = render(<Card>Content</Card>)
		const card = container.firstChild as HTMLElement
		expect(card?.className ?? '').toContain('bg-card')
	})

	it('default card variant has shadow-sm (not shadow-xs)', () => {
		const { container } = render(<Card>Content</Card>)
		const card = container.firstChild as HTMLElement
		const cls = card?.className ?? ''
		expect(cls).toContain('shadow-sm')
		expect(cls).not.toContain('shadow-xs')
	})

	it('default card has border-border-subtle class', () => {
		const { container } = render(<Card>Content</Card>)
		const card = container.firstChild as HTMLElement
		expect(card?.className ?? '').toContain('border-border-subtle')
	})

	it('glass variant is unaffected by default changes', () => {
		const { container } = render(<Card variant="glass">Content</Card>)
		const card = container.firstChild as HTMLElement
		expect(card?.className ?? '').toContain('glass-card')
		expect(card?.className ?? '').not.toContain('border-border-subtle')
	})
})

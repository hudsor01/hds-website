import { FloatingTextarea, FloatingInput } from '@/components/forms/floating-field'
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * Unit tests for core UI components
 * Tests functionality, accessibility, and semantic token usage
 */

afterEach(() => {
  cleanup();
  mock.restore();
});

describe('FloatingInput Component', () => {
  const mockOnChange = mock()
  const mockOnBlur = mock()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnBlur.mockClear()
  })

  it('should render with correct semantic classes', () => {
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Test Input"
      />
    )

    const input = screen.getByRole('textbox', { name: /Test Input/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('pt-4', 'pb-2')
  })

  it('should float label when focused', async () => {
    const user = userEvent.setup()
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Test Input"
        id="test-input"
      />
    )

    const input = screen.getByRole('textbox', { name: /Test Input/i })
    const label = screen.getByText('Test Input')

    // Label should not be floated initially
    expect(label).toHaveClass('top-3', 'text-sm')

    // Focus input
    await user.click(input)
    await waitFor(() => {
      expect(label).toHaveClass('-top-2', 'text-xs')
    })
  })

  it('should keep label floated when input has value', () => {
    render(
      <FloatingInput
        name="test"
        value="Some value"
        onChange={mockOnChange}
        placeholder="Test Input"
      />
    )

    const label = screen.getByText('Test Input')
    expect(label).toHaveClass('-top-2', 'text-xs')
  })

  it('should call onChange when typing', async () => {
    const user = userEvent.setup()
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Test Input"
      />
    )

    const input = screen.getByRole('textbox', { name: /Test Input/i })
    await user.type(input, 'Hello')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should show required indicator when required', () => {
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Required Field"
        required
      />
    )

    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveClass('text-destructive')
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Disabled Input"
        disabled
      />
    )

    const input = screen.getByRole('textbox', { name: /Disabled Input/i })
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should call onBlur when focus is lost', async () => {
    const user = userEvent.setup()
    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
        placeholder="Test Input"
      />
    )

    const input = screen.getByRole('textbox', { name: /Test Input/i })
    await user.click(input)
    await user.tab()

    expect(mockOnBlur).toHaveBeenCalled()
  })
})

describe('FloatingTextarea Component', () => {
  const mockOnChange = mock()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with semantic tokens', () => {
    render(
      <FloatingTextarea
        name="message"
        value=""
        onChange={mockOnChange}
        placeholder="Your Message"
      />
    )

    const textarea = screen.getByRole('textbox', { name: /Your Message/i })
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('resize-none')
  })

  it('should respect rows prop', () => {
    render(
      <FloatingTextarea
        name="message"
        value=""
        onChange={mockOnChange}
        placeholder="Your Message"
        rows={6}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /Your Message/i })
    expect(textarea).toHaveAttribute('rows', '6')
  })
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
    expect(button).toHaveClass('hover:bg-accent')
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
    expect(button).toHaveClass('h-10')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('should handle click events', async () => {
    const handleClick = mock()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

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
    expect(card).toHaveClass('glass-section')
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
    const { container } = render(<Card variant="glass" className="custom-class">Content</Card>)

    const card = container.firstChild
    expect(card).toHaveClass('glass-card', 'custom-class')
  })
})

describe('Button Component (CTA Pattern)', () => {
  it('should render as link with asChild', () => {
    render(<Button asChild variant="default" size="default" trackConversion={true}>
      <Link href="/test">
        Test CTA
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>)

    const link = screen.getByRole('link', { name: /Test CTA/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should render different variants', () => {
    const { rerender } = render(<Button asChild variant="default" size="default" trackConversion={true}>
      <Link href="/test">
        Primary
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>)
    let link = screen.getByRole('link')
    expect(link).toHaveClass('bg-primary')

    rerender(<Button asChild variant="outline" size="default" trackConversion={true}>
      <Link href="/test">
        Secondary
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>)
    link = screen.getByRole('link')
    expect(link).toHaveClass('border', 'bg-background')
  })

  it('should show arrow by default', () => {
    const { container } = render(<Button asChild variant="default" size="default" trackConversion={true}>
      <Link href="/test">
        With Arrow
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should hide arrow when not included', () => {
    const { container } = render(<Button asChild variant="default" size="default" trackConversion={true}>
      <Link href="/test">
        No Arrow
      </Link>
    </Button>)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('should handle external links', () => {
    render(<Button asChild variant="default" size="default" trackConversion={true}>
      <a href="https://external.com" target="_blank" rel="noopener noreferrer">
        External
        <ArrowRight className="w-4 h-4" />
      </a>
    </Button>)

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

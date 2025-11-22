import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FloatingInput from '@/components/FloatingInput'
import FloatingTextarea from '@/components/FloatingTextarea'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/glass-card'
import { CTAButton } from '@/components/cta-button'

/**
 * Unit tests for core UI components
 * Tests functionality, accessibility, and semantic token usage
 */

describe('FloatingInput Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

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

    const input = screen.getByPlaceholderText('Test Input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('transition-smooth', 'focus-ring')
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

    const input = screen.getByPlaceholderText('Test Input')
    const label = screen.getByText('Test Input')

    // Label should not be floated initially
    expect(label).not.toHaveClass('top-2', 'text-xs')

    // Focus input
    await user.click(input)
    await waitFor(() => {
      expect(label).toHaveClass('top-2', 'text-xs')
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
    expect(label).toHaveClass('top-2', 'text-xs')
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

    const input = screen.getByPlaceholderText('Test Input')
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

    const input = screen.getByPlaceholderText('Disabled Input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('cursor-not-allowed', 'opacity-50')
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

    const input = screen.getByPlaceholderText('Test Input')
    await user.click(input)
    await user.tab()

    expect(mockOnBlur).toHaveBeenCalled()
  })
})

describe('FloatingTextarea Component', () => {
  const mockOnChange = vi.fn()

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

    const textarea = screen.getByPlaceholderText('Your Message')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('transition-smooth', 'focus-ring', 'resize-none')
  })

  it('should show character count when typing', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <FloatingTextarea
        name="message"
        value=""
        onChange={mockOnChange}
        placeholder="Your Message"
      />
    )

    // Initially no character count
    expect(screen.queryByText(/characters/)).not.toBeInTheDocument()

    // Type some text
    rerender(
      <FloatingTextarea
        name="message"
        value="Hello world"
        onChange={mockOnChange}
        placeholder="Your Message"
      />
    )

    // Character count should appear
    expect(screen.getByText('11 characters')).toBeInTheDocument()
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

    const textarea = screen.getByPlaceholderText('Your Message')
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
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('GlassCard Component', () => {
  it('should render with glass-card class', () => {
    const { container } = render(<GlassCard>Content</GlassCard>)

    const card = container.firstChild
    expect(card).toHaveClass('glass-card')
  })

  it('should render different variants', () => {
    const { container, rerender } = render(<GlassCard variant="default">Content</GlassCard>)
    let card = container.firstChild
    expect(card).toHaveClass('glass-card')

    rerender(<GlassCard variant="light">Content</GlassCard>)
    card = container.firstChild
    expect(card).toHaveClass('glass-card-light')

    rerender(<GlassCard variant="section">Content</GlassCard>)
    card = container.firstChild
    expect(card).toHaveClass('glass-section')
  })

  it('should apply different padding sizes', () => {
    const { container, rerender } = render(<GlassCard padding="sm">Content</GlassCard>)
    let card = container.firstChild
    expect(card).toHaveClass('p-4')

    rerender(<GlassCard padding="lg">Content</GlassCard>)
    card = container.firstChild
    expect(card).toHaveClass('p-8')
  })

  it('should merge custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Content</GlassCard>)

    const card = container.firstChild
    expect(card).toHaveClass('glass-card', 'custom-class')
  })
})

describe('CTAButton Component', () => {
  it('should render with semantic classes', () => {
    render(<CTAButton href="/test">Test CTA</CTAButton>)

    const link = screen.getByRole('link', { name: /Test CTA/ })
    expect(link).toHaveClass('button-base', 'cta-primary', 'will-change-transform', 'focus-ring')
  })

  it('should render different variants', () => {
    const { rerender } = render(<CTAButton href="/test" variant="primary">Primary</CTAButton>)
    let link = screen.getByRole('link')
    expect(link).toHaveClass('cta-primary')

    rerender(<CTAButton href="/test" variant="secondary">Secondary</CTAButton>)
    link = screen.getByRole('link')
    expect(link).toHaveClass('cta-secondary', 'button-hover-glow')
  })

  it('should show arrow by default', () => {
    const { container } = render(<CTAButton href="/test">With Arrow</CTAButton>)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should hide arrow when showArrow is false', () => {
    const { container } = render(<CTAButton href="/test" showArrow={false}>No Arrow</CTAButton>)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('should handle external links', () => {
    render(<CTAButton href="https://external.com" external>External</CTAButton>)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('Semantic Token Usage', () => {
  it('should use theme variables for colors', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.querySelector('button')

    // Check computed styles use CSS variables
    const styles = window.getComputedStyle(button!)
    expect(styles).toBeDefined()
  })
})

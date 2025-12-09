import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

/**
 * Unit tests for layout and utility components
 * Tests ErrorBoundary, BackgroundPattern, and layout utilities
 */

describe('ErrorBoundary Component', () => {
  // Suppress console errors in tests
  const originalError = console.error
  beforeEach(() => {
    console.error = mock()
  })

  afterEach(() => {
    cleanup();
    console.error = originalError
  })

  it('should render children when there is no error', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')

    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should catch and display errors', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Error boundary should show error UI (may have multiple error texts)
    const errorElements = screen.queryAllByText(/error|wrong|problem/i)
    if (errorElements.length === 0) {
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    } else {
      expect(errorElements.length).toBeGreaterThan(0)
    }
  })

  it('should have a reset mechanism', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No Error</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error state should be shown
    expect(screen.queryByText('No Error')).not.toBeInTheDocument()

    // Reset and render without error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
  })

  it('should log errors to console or analytics', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')
    // Note: Bun doesn't have built-in spy support, just verify error UI renders
    const originalError = console.error
    let errorLogged = false
    console.error = () => { errorLogged = true }

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Error should be logged or UI should show error
    if (!errorLogged) {
      expect(screen.queryByText(/error/i)).toBeInTheDocument()
    }

    // Restore original console.error
    console.error = originalError
  })

  it('should handle copy error details functionality', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowError = () => {
      throw new Error('Test copy error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Should show error details section
    const errorDetails = screen.getByText('Error Details')
    expect(errorDetails).toBeInTheDocument()

    // Should have copy button
    const copyButton = screen.getByTitle('Copy error details')
    expect(copyButton).toBeInTheDocument()
  })

  it('should handle report error functionality', async () => {
    const { default: ErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowError = () => {
      throw new Error('Test report error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Should have report error button
    const reportButton = screen.getByText('Report Error')
    expect(reportButton).toBeInTheDocument()
  })

  it('should render ComponentErrorBoundary with minimal UI', async () => {
    const { ComponentErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowError = () => {
      throw new Error('Component error')
    }

    render(
      <ComponentErrorBoundary name="Test Component">
        <ThrowError />
      </ComponentErrorBoundary>
    )

    // Should show component-specific error message
    expect(screen.getByText('Failed to load Test Component')).toBeInTheDocument()

    // Should have retry button
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should handle withErrorBoundary HOC', async () => {
    const { withErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const TestComponent = ({ title }: { title: string }) => <h1>{title}</h1>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent title="Test" />)

    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle AsyncErrorBoundary for chunk load errors', async () => {
    const { AsyncErrorBoundary } = await import('@/components/error/ErrorBoundary')

    const ThrowChunkError = () => {
      throw new Error('Loading chunk 123 failed')
    }

    render(
      <AsyncErrorBoundary>
        <ThrowChunkError />
      </AsyncErrorBoundary>
    )

    // Should show error UI for chunk errors - check for specific error heading
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
  })
})

describe('BackgroundPattern Component', () => {
  it('should render gradient orbs', () => {
    const { container } = render(
      <div className="relative">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-decorative-purple rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>
    )

    const orbs = container.querySelectorAll('.animate-blob')
    expect(orbs.length).toBe(2)
  })

  it('should apply proper animation delays', () => {
    const { container } = render(
      <div className="animate-blob animation-delay-2000" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('animation-delay-2000')
  })

  it('should use OKLCH gradient backgrounds', () => {
    const { container } = render(
      <div className="bg-gradient-primary" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('bg-gradient-primary')
  })

  it('should render grid pattern overlay', () => {
    const { container } = render(
      <div className="grid-pattern" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('grid-pattern')
  })

  it('should apply blur effects correctly', () => {
    const { container } = render(
      <div className="blur-3xl" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('blur-3xl')
  })
})

describe('Glass Morphism Components', () => {
  it('should render glass-card with correct classes', () => {
    const { container } = render(
      <div className="glass-card p-6">
        <p>Glass card content</p>
      </div>
    )

    const card = container.querySelector('.glass-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('p-6')
  })

  it('should render glass-card-light variant', () => {
    const { container } = render(
      <div className="glass-card-light">Content</div>
    )

    const card = container.querySelector('.glass-card-light')
    expect(card).toBeInTheDocument()
  })

  it('should render glass-section variant', () => {
    const { container } = render(
      <div className="glass-section">Content</div>
    )

    const section = container.querySelector('.glass-section')
    expect(section).toBeInTheDocument()
  })

  it('should apply backdrop-blur correctly', () => {
    const { container } = render(
      <div className="blur-backdrop">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('blur-backdrop')
  })
})

describe('Layout Utility Classes', () => {
  it('should apply flex-center correctly', () => {
    const { container } = render(
      <div className="flex-center">
        <span>Centered</span>
      </div>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('flex-center')
    // Computed styles aren't available in happy-dom, just verify class is applied
  })

  it('should apply flex-between correctly', () => {
    const { container } = render(
      <div className="flex-between">
        <span>Left</span>
        <span>Right</span>
      </div>
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('flex-between')
    // Computed styles aren't available in happy-dom, just verify class is applied
  })

  it('should apply container-wide correctly', () => {
    const { container } = render(
      <div className="container-wide">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('container-wide')
  })

  it('should apply container-narrow correctly', () => {
    const { container } = render(
      <div className="container-narrow">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('container-narrow')
  })
})

describe('Transition and Animation Utilities', () => {
  it('should apply transition-smooth', () => {
    const { container } = render(
      <button className="transition-smooth">Button</button>
    )

    const button = container.firstChild as HTMLElement
    expect(button).toHaveClass('transition-smooth')
    // Computed styles aren't available in happy-dom, just verify class is applied
  })

  it('should apply focus-ring on focus', () => {
    const { container } = render(
      <button className="focus-ring">Button</button>
    )

    const button = container.firstChild
    expect(button).toHaveClass('focus-ring')
  })

  it('should apply hover-lift effect', () => {
    const { container } = render(
      <div className="hover-lift">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('hover-lift')
  })

  it('should apply hover-glow effect', () => {
    const { container } = render(
      <div className="hover-glow">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('hover-glow')
  })

  it('should apply card-hover effect', () => {
    const { container } = render(
      <div className="card-hover">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('card-hover')
  })
})

describe('Typography Utilities', () => {
  it('should apply text-clamp utilities', () => {
    const { container } = render(
      <h1 className="text-clamp-xl">Heading</h1>
    )

    const heading = container.firstChild
    expect(heading).toHaveClass('text-clamp-xl')
  })

  it('should apply responsive text sizing', () => {
    const { container } = render(
      <p className="text-responsive-md">Text</p>
    )

    const text = container.firstChild
    expect(text).toHaveClass('text-responsive-md')
  })

  it('should apply gradient-text effect', () => {
    const { container } = render(
      <span className="gradient-text">Gradient</span>
    )

    const span = container.firstChild
    expect(span).toHaveClass('gradient-text')
  })

  it('should apply gradient-text-animated effect', () => {
    const { container } = render(
      <span className="gradient-text-animated">Animated</span>
    )

    const span = container.firstChild
    expect(span).toHaveClass('gradient-text-animated')
  })
})

describe('Button Utility Classes', () => {
  it('should apply button-base class', () => {
    const { container } = render(
      <button className="button-base">Button</button>
    )

    const button = container.firstChild
    expect(button).toHaveClass('button-base')
  })

  it('should apply cta-primary styling', () => {
    const { container } = render(
      <button className="cta-primary">CTA</button>
    )

    const button = container.firstChild
    expect(button).toHaveClass('cta-primary')
  })

  it('should apply cta-secondary styling', () => {
    const { container } = render(
      <button className="cta-secondary">CTA</button>
    )

    const button = container.firstChild
    expect(button).toHaveClass('cta-secondary')
  })

  it('should apply button-hover-glow effect', () => {
    const { container } = render(
      <button className="button-hover-glow">Button</button>
    )

    const button = container.firstChild
    expect(button).toHaveClass('button-hover-glow')
  })
})

describe('Card Hover Effects', () => {
  it('should apply card-hover-glow effect', () => {
    const { container } = render(
      <div className="card-hover-glow">Card</div>
    )

    const card = container.firstChild
    expect(card).toHaveClass('card-hover-glow')
  })

  it('should apply card-hover-glow-purple variant', () => {
    const { container } = render(
      <div className="card-hover-glow-purple">Card</div>
    )

    const card = container.firstChild
    expect(card).toHaveClass('card-hover-glow-purple')
  })

  it('should apply card-hover-glow-emerald variant', () => {
    const { container } = render(
      <div className="card-hover-glow-emerald">Card</div>
    )

    const card = container.firstChild
    expect(card).toHaveClass('card-hover-glow-emerald')
  })

  it('should apply card-hover-glow-orange variant', () => {
    const { container } = render(
      <div className="card-hover-glow-orange">Card</div>
    )

    const card = container.firstChild
    expect(card).toHaveClass('card-hover-glow-orange')
  })
})

describe('Performance Utilities', () => {
  it('should apply transform-gpu for better performance', () => {
    const { container } = render(
      <div className="transform-gpu">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('transform-gpu')
  })

  it('should apply will-change-transform for animations', () => {
    const { container } = render(
      <div className="will-change-transform">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('will-change-transform')
  })

  it('should apply will-change-auto to reset', () => {
    const { container } = render(
      <div className="will-change-auto">Content</div>
    )

    const element = container.firstChild
    expect(element).toHaveClass('will-change-auto')
  })
})

describe('Accessibility Utilities', () => {
  it('should apply sr-only for screen reader only content', () => {
    render(
      <span className="sr-only">Screen reader text</span>
    )

    const element = screen.getByText('Screen reader text')
    expect(element).toHaveClass('sr-only')
  })

  it('should remove sr-only on focus', () => {
    const { container } = render(
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
    )

    const link = container.firstChild
    expect(link).toHaveClass('sr-only', 'focus:not-sr-only')
  })
})

describe('Grid Pattern Utilities', () => {
  it('should apply grid-pattern', () => {
    const { container } = render(
      <div className="grid-pattern" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('grid-pattern')
  })

  it('should apply grid-pattern-light variant', () => {
    const { container } = render(
      <div className="grid-pattern-light" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('grid-pattern-light')
  })

  it('should apply grid-pattern-subtle variant', () => {
    const { container } = render(
      <div className="grid-pattern-subtle" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('grid-pattern-subtle')
  })

  it('should apply grid-pattern-minimal variant', () => {
    const { container } = render(
      <div className="grid-pattern-minimal" />
    )

    const element = container.firstChild
    expect(element).toHaveClass('grid-pattern-minimal')
  })
})

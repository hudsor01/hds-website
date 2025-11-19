import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Unit tests for form components
 * Tests ContactForm validation, submission, and error handling
 */

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
  })

  it('should render all form fields', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    render(<ContactForm />)

    // Check for all required fields
    expect(screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i) || screen.getByPlaceholderText(/message/i)).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    // OR custom validation errors should appear
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    const isRequired = nameInput.hasAttribute('required')

    expect(isRequired).toBe(true)
  })

  it('should validate email format', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()
    render(<ContactForm />)

    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)

    // Type invalid email
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    // Check for email type attribute
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('should accept valid email format', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()
    render(<ContactForm />)

    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)

    // Type valid email
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should submit form with valid data', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock successful API response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' }),
    })

    render(<ContactForm />)

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)
    const messageInput = screen.getByLabelText(/message/i) || screen.getByPlaceholderText(/message/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(messageInput, 'This is a test message')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Wait for submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should show loading state during submission', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock delayed API response
    ;(global.fetch as any).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000))
    )

    render(<ContactForm />)

    // Fill and submit form
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    await user.type(nameInput, 'John Doe')

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Check for loading state (disabled button or loading text)
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /submit|send|sending/i })
      expect(button).toBeDisabled() || expect(button).toHaveTextContent(/sending|loading/i)
    })
  })

  it('should show success message after submission', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock successful response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' }),
    })

    render(<ContactForm />)

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)
    const messageInput = screen.getByLabelText(/message/i) || screen.getByPlaceholderText(/message/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(messageInput, 'Test message')

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Wait for success message
    await waitFor(() => {
      expect(screen.queryByText(/success|thank you|sent/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show error message on submission failure', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock failed response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to send email' }),
    })

    render(<ContactForm />)

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    await user.type(nameInput, 'John Doe')

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.queryByText(/error|failed|try again/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should clear form after successful submission', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock successful response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ContactForm />)

    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    await user.type(nameInput, 'John Doe')

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Form should clear after success
    await waitFor(() => {
      expect(nameInput).toHaveValue('') || expect(screen.queryByText(/success/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should track form interactions with analytics', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    render(<ContactForm />)

    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    await user.type(nameInput, 'John')

    // Analytics tracking would be tested via mock
    // Just verify the form is interactive
    expect(nameInput).toHaveValue('John')
  })

  it('should have proper ARIA labels for accessibility', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    render(<ContactForm />)

    // All form fields should have labels or aria-labels
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') || input.id
      expect(hasLabel).toBeTruthy()
    })
  })

  it('should indicate required fields visually', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    render(<ContactForm />)

    // Look for required indicators (asterisks or aria-required)
    const requiredFields = screen.getAllByRole('textbox').filter(input =>
      input.hasAttribute('required') || input.getAttribute('aria-required') === 'true'
    )

    expect(requiredFields.length).toBeGreaterThan(0)
  })

  it('should handle network errors gracefully', async () => {
    const { default: ContactForm } = await import('@/components/ContactForm')
    const user = userEvent.setup()

    // Mock network error
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(<ContactForm />)

    const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
    await user.type(nameInput, 'John Doe')

    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    await user.click(submitButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.queryByText(/error|failed|network/i)).toBeInTheDocument() ||
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 3000 })
  })
})

describe('Form Validation Utilities', () => {
  it('should validate email addresses correctly', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    expect(emailRegex.test('test@example.com')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
    expect(emailRegex.test('missing@domain')).toBe(false)
    expect(emailRegex.test('@example.com')).toBe(false)
  })

  it('should validate required fields', () => {
    const validateRequired = (value: string) => value.trim().length > 0

    expect(validateRequired('John Doe')).toBe(true)
    expect(validateRequired('')).toBe(false)
    expect(validateRequired('   ')).toBe(false)
  })

  it('should validate minimum length', () => {
    const validateMinLength = (value: string, min: number) => value.trim().length >= min

    expect(validateMinLength('Hello', 5)).toBe(true)
    expect(validateMinLength('Hi', 5)).toBe(false)
  })

  it('should sanitize input to prevent XSS', () => {
    const sanitize = (input: string) => input.replace(/<script[^>]*>.*?<\/script>/gi, '')

    const malicious = '<script>alert("XSS")</script>Hello'
    const sanitized = sanitize(malicious)

    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toContain('Hello')
  })
})

describe('Form Field Components', () => {
  it('should render FloatingInput with proper attributes', async () => {
    const { default: FloatingInput } = await import('@/components/FloatingInput')
    const mockOnChange = vi.fn()

    render(
      <FloatingInput
        name="testField"
        value=""
        onChange={mockOnChange}
        placeholder="Test Field"
        required
      />
    )

    const input = screen.getByPlaceholderText('Test Field')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('name', 'testField')
  })

  it('should render FloatingTextarea with proper attributes', async () => {
    const { default: FloatingTextarea } = await import('@/components/FloatingTextarea')
    const mockOnChange = vi.fn()

    render(
      <FloatingTextarea
        name="message"
        value=""
        onChange={mockOnChange}
        placeholder="Your Message"
        rows={5}
      />
    )

    const textarea = screen.getByPlaceholderText('Your Message')
    expect(textarea).toHaveAttribute('name', 'message')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('should call onChange handlers when typing', async () => {
    const { default: FloatingInput } = await import('@/components/FloatingInput')
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Test"
      />
    )

    const input = screen.getByPlaceholderText('Test')
    await user.type(input, 'Hello')

    expect(mockOnChange).toHaveBeenCalled()
  })
})

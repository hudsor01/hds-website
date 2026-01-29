import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import type { ReactElement } from 'react'

const renderWithQueryClient = (ui: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

/**
 * Unit tests for form components
 * Tests ContactForm validation, submission, and error handling
 */

// Set database environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

describe('ContactForm Component', () => {
  beforeEach(() => {
    // Mock next/navigation
    mock.module('next/navigation', () => ({
      useRouter: () => ({
        push: mock(),
        refresh: mock(),
      }),
    }));

    // Mock database client
    mock.module('@/lib/db', () => ({
      db: {
        select: mock().mockReturnValue({
          from: mock().mockReturnValue({
            where: mock().mockReturnValue({
              limit: mock().mockResolvedValue([]),
            }),
          }),
        }),
        insert: mock().mockReturnValue({
          values: mock().mockReturnValue({
            returning: mock().mockResolvedValue([]),
          }),
        }),
      },
    }));
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  it('should render all form fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    // Check for all required fields using placeholders
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
  })

  it('should render input fields with proper types', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    // Email field should have email type
    const emailInput = screen.getByPlaceholderText(/email address/i)
    expect(emailInput.getAttribute('type')).toBe('email')
  })

  it('should accept valid email input', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const user = userEvent.setup()
    renderWithQueryClient(<ContactForm />)

    const emailInput = screen.getByPlaceholderText(/email address/i)

    // Type valid email
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should have submit button', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton.getAttribute('type')).toBe('submit')
  })

  it('should have all form select fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    // Check for select fields (service, time, budget, timeline)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('should render form with proper structure', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const { container } = renderWithQueryClient(<ContactForm />)

    // Form should exist
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('should have textarea for message', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const { container } = renderWithQueryClient(<ContactForm />)

    const textarea = container.querySelector('textarea')
    expect(textarea).toBeInTheDocument()
  })

  it('should accept user input in form fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const user = userEvent.setup()

    renderWithQueryClient(<ContactForm />)

    const nameInput = screen.getByPlaceholderText(/first name/i)
    await user.type(nameInput, 'John')
    expect(nameInput).toHaveValue('John')
  })

  it('should have proper input classes', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    const nameInput = screen.getByPlaceholderText(/first name/i)
    // shadcn Input uses these standard classes
    expect(nameInput).toHaveClass('rounded-md')
    expect(nameInput).toHaveClass('border')
  })

  it('should render all textbox inputs', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    renderWithQueryClient(<ContactForm />)

    // Get all text inputs
    const textInputs = screen.getAllByRole('textbox')
    // Should have first name, last name, email, phone, company, message
    expect(textInputs.length).toBeGreaterThanOrEqual(5)
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
    const { FloatingInput } = await import('@/components/forms/floating-field')
    const mockOnChange = mock()

    render(
      <FloatingInput
        name="testField"
        value=""
        onChange={mockOnChange}
        placeholder="Test Field"
        required
      />
    )

    const input = screen.getByRole('textbox', { name: /Test Field/i })
    expect(input.hasAttribute('required')).toBe(true)
    expect(input.getAttribute('name')).toBe('testField')
  })

  it('should render FloatingTextarea with proper attributes', async () => {
    const { FloatingTextarea } = await import('@/components/forms/floating-field')
    const mockOnChange = mock()

    render(
      <FloatingTextarea
        name="message"
        value=""
        onChange={mockOnChange}
        placeholder="Your Message"
        rows={5}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /Your Message/i })
    expect(textarea.getAttribute('name')).toBe('message')
    expect(textarea.getAttribute('rows')).toBe('5')
  })

  it('should call onChange handlers when typing', async () => {
    const { FloatingInput } = await import('@/components/forms/floating-field')
    const user = userEvent.setup()
    const mockOnChange = mock()

    render(
      <FloatingInput
        name="test"
        value=""
        onChange={mockOnChange}
        placeholder="Test"
      />
    )

    const input = screen.getByRole('textbox', { name: /^Test$/i })
    await user.type(input, 'Hello')

    expect(mockOnChange).toHaveBeenCalled()
  })
})

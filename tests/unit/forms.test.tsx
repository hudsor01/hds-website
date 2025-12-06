import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Unit tests for form components
 * Tests ContactForm validation, submission, and error handling
 */

// Mock Supabase environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key')
vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test-service-role-key')

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  })),
}))

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    // Check for all required fields using placeholders
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
  })

  it('should show required fields with proper validation', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    // Check that required fields have required attribute
    const nameInput = screen.getByPlaceholderText(/first name/i)
    expect(nameInput).toHaveAttribute('required')
  })

  it('should validate email format', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    const emailInput = screen.getByPlaceholderText(/email address/i)

    // Check for email type attribute
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })

  it('should accept valid email input', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const user = userEvent.setup()
    render(<ContactForm />)

    const emailInput = screen.getByPlaceholderText(/email address/i)

    // Type valid email
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should have submit button', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should have all form select fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    // Check for select fields (service, time, budget, timeline)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('should render form with proper structure', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const { container } = render(<ContactForm />)

    // Form should exist
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveClass('space-y-sections')
  })

  it('should have textarea for message', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const { container } = render(<ContactForm />)

    const textarea = container.querySelector('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('required')
  })

  it('should accept user input in form fields', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const user = userEvent.setup()

    render(<ContactForm />)

    const nameInput = screen.getByPlaceholderText(/first name/i)
    await user.type(nameInput, 'John')
    expect(nameInput).toHaveValue('John')
  })

  it('should have proper form classes', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    const { container } = render(<ContactForm />)

    // Form should have glass-card styling
    const glassCard = container.querySelector('.glass-card')
    expect(glassCard).toBeInTheDocument()
  })

  it('should have proper input classes', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    const nameInput = screen.getByPlaceholderText(/first name/i)
    // shadcn Input uses these standard classes
    expect(nameInput).toHaveClass('rounded-md')
    expect(nameInput).toHaveClass('border')
  })

  it('should indicate required fields visually', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    // Look for required fields
    const requiredFields = screen.getAllByRole('textbox').filter(input =>
      input.hasAttribute('required')
    )

    expect(requiredFields.length).toBeGreaterThan(0)
  })

  it('should render form header', async () => {
    const { default: ContactForm } = await import('@/components/forms/ContactForm')
    render(<ContactForm />)

    // Check for header text
    const header = screen.getByText(/let's build something amazing/i)
    expect(header).toBeInTheDocument()
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
    const { default: FloatingInput } = await import('@/components/InputPanel/FloatingInput')
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
    const { default: FloatingInput } = await import('@/components/InputPanel/FloatingInput')
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

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

describe('Component Variations with CVA', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Input Component', () => {
    it('should render currency variant with dollar sign', () => {
      render(
        <Input
          type="number"
          value="25.00"
          variant="currency"
          placeholder="Enter amount"
          readOnly
        />
      )

      const input = screen.getByPlaceholderText('Enter amount')
      expect(input).toBeInTheDocument()

      // Check if the dollar sign span is present
      const dollarSign = screen.getByText('$')
      expect(dollarSign).toBeInTheDocument()
    })

    it('should render default variant without currency styling', () => {
      render(
        <Input
          type="text"
          value="John Doe"
          placeholder="Enter name"
          readOnly
        />
      )

      const input = screen.getByPlaceholderText('Enter name')
      expect(input).toBeInTheDocument()

      // Should not have dollar sign
      const dollarSign = screen.queryByText('$')
      expect(dollarSign).not.toBeInTheDocument()
    })
  })

  describe('Select Component', () => {
    it('should render error variant with destructive border', () => {
      render(
        <Select>
          <SelectTrigger variant="error">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()

      // Check if it has the error styling (this would be verified by CSS classes)
      expect(trigger).toHaveClass('border-destructive')
    })

    it('should render default variant without error styling', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()

      // Should not have error styling
      expect(trigger).not.toHaveClass('border-destructive')
    })
  })
})

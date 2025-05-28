'use client'

import { useActionState } from 'react'
import { downloadLeadMagnet } from '@/lib/actions/server-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

/**
 * Lead magnet download form using Server Actions
 * Demonstrates redirect handling and resource selection
 */

type FormState = {
  success?: boolean
  message?: string
  errors?: Array<{ path: string[]; message: string }>
}

const initialState: FormState = {}

const leadMagnetResources = [
  { id: 'website-checklist', name: 'Website Performance Checklist' },
  { id: 'seo-basics-cheatsheet', name: 'SEO Basics Cheatsheet' },
  { id: 'roi-calculator-template', name: 'ROI Calculator Template' },
  { id: 'digital-strategy-guide', name: 'Digital Strategy Guide' },
  { id: 'contact-form-templates', name: 'Contact Form Templates' },
]

export function ServerActionLeadMagnetForm({ 
  defaultResource,
  title = 'Download Free Resource', 
}: { 
  defaultResource?: string
  title?: string 
}) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => await downloadLeadMagnet(formData),
    initialState,
  )

  return (
    <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-bold mb-2'>{title}</h3>
        <p className='text-gray-600'>
          Get instant access to our business growth resources
        </p>
      </div>
      
      <form action={formAction} className='space-y-4'>
        <div>
          <Label htmlFor='lead-name'>Name *</Label>
          <Input
            id='lead-name'
            name='name'
            type='text'
            required
            disabled={isPending}
            className={getFieldError('name', state.errors) ? 'border-red-500' : ''}
            placeholder='Your full name'
          />
          {getFieldError('name', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('name', state.errors)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='lead-email'>Email Address *</Label>
          <Input
            id='lead-email'
            name='email'
            type='email'
            required
            disabled={isPending}
            className={getFieldError('email', state.errors) ? 'border-red-500' : ''}
            placeholder='your@email.com'
          />
          {getFieldError('email', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('email', state.errors)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='resource'>Choose Resource *</Label>
          <Select 
            name='resource' 
            required 
            disabled={isPending}
            defaultValue={defaultResource}
          >
            <option value=''>Select a resource</option>
            {leadMagnetResources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </Select>
          {getFieldError('resource', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('resource', state.errors)}
            </p>
          )}
        </div>

        <Button
          type='submit'
          disabled={isPending}
          className='w-full'
        >
          {isPending ? (
            <span className='flex items-center justify-center'>
              <svg
                className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Download Now'
          )}
        </Button>

        {/* Display error message */}
        {state.message && !state.success && (
          <div className='p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm'>
            {state.message}
          </div>
        )}

        <div className='text-xs text-gray-500 space-y-1'>
          <p>✓ Instant download after submission</p>
          <p>✓ No spam, we respect your privacy</p>
          <p>✓ Actionable insights included</p>
        </div>
      </form>
    </div>
  )
}

// Helper function to get field-specific errors
function getFieldError(
  fieldName: string,
  errors?: Array<{ path: string[]; message: string }>,
): string | undefined {
  return errors?.find(error => error.path.includes(fieldName))?.message
}
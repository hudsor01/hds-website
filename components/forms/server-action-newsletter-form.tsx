'use client'

import { useActionState } from 'react'
import { subscribeToNewsletter } from '@/lib/actions/server-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Newsletter subscription form using Server Actions
 * Demonstrates optimistic updates and pending states
 */

type FormState = {
  success?: boolean
  message?: string
  errors?: string[]
}

const initialState: FormState = {}

export function ServerActionNewsletterForm({ source = 'website' }: { source?: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      // Add source to form data
      formData.set('source', source)
      return await subscribeToNewsletter(formData)
    },
    initialState,
  )

  // If successfully subscribed, show success state
  if (state.success) {
    return (
      <div className='max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg'>
        <div className='text-center'>
          <div className='text-green-600 text-4xl mb-2'>✓</div>
          <h3 className='text-lg font-semibold text-green-800 mb-2'>
            Successfully Subscribed!
          </h3>
          <p className='text-green-700'>
            Thank you for subscribing to our newsletter. You&apos;ll receive our latest insights and updates.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-bold mb-2'>Stay Updated</h3>
        <p className='text-gray-600'>
          Get the latest insights on business growth and digital strategies
        </p>
      </div>
      
      <form action={formAction} className='space-y-4'>
        <div>
          <Label htmlFor='newsletter-email' className='sr-only'>
            Email Address
          </Label>
          <Input
            id='newsletter-email'
            name='email'
            type='email'
            placeholder='Enter your email address'
            required
            disabled={isPending}
            className={state.errors ? 'border-red-500' : ''}
          />
          {state.errors && (
            <p className='text-red-500 text-sm mt-1'>
              Please enter a valid email address
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
              Subscribing...
            </span>
          ) : (
            'Subscribe to Newsletter'
          )}
        </Button>

        {/* Display error message */}
        {state.message && !state.success && (
          <div className='p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm'>
            {state.message}
          </div>
        )}

        <p className='text-xs text-gray-500 text-center'>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}
'use client';

import { useActionState } from 'react';
import { submitContactForm } from '@/lib/actions/server-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

/**
 * Contact form using Server Actions with useActionState
 * Demonstrates modern React 19 form handling patterns
 */

type FormState = {
  success?: boolean
  message?: string
  errors?: Array<{ field: string; message: string }>
}

const initialState: FormState = {};

export function ServerActionContactForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => await submitContactForm(formData),
    initialState,
  );

  return (
    <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-6'>Contact Us</h2>
      
      <form action={formAction} className='space-y-4'>
        <div>
          <Label htmlFor='name'>Name *</Label>
          <Input
            id='name'
            name='name'
            type='text'
            required
            disabled={isPending}
            className={getFieldError('name', state.errors) ? 'border-red-500' : ''}
          />
          {getFieldError('name', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('name', state.errors)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='email'>Email *</Label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            disabled={isPending}
            className={getFieldError('email', state.errors) ? 'border-red-500' : ''}
          />
          {getFieldError('email', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('email', state.errors)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='company'>Company</Label>
          <Input
            id='company'
            name='company'
            type='text'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='phone'>Phone</Label>
          <Input
            id='phone'
            name='phone'
            type='tel'
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor='service'>Service Interest</Label>
          <Select name='service' disabled={isPending}>
            <option value=''>Select a service</option>
            <option value='web-development'>Web Development</option>
            <option value='revenue-operations'>Revenue Operations</option>
            <option value='data-analytics'>Data Analytics</option>
            <option value='consultation'>Consultation</option>
          </Select>
        </div>

        <div>
          <Label htmlFor='message'>Message *</Label>
          <Textarea
            id='message'
            name='message'
            required
            disabled={isPending}
            className={getFieldError('message', state.errors) ? 'border-red-500' : ''}
            placeholder='Tell us about your project...'
          />
          {getFieldError('message', state.errors) && (
            <p className='text-red-500 text-sm mt-1'>
              {getFieldError('message', state.errors)}
            </p>
          )}
        </div>

        <Button
          type='submit'
          disabled={isPending}
          className='w-full'
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </Button>

        {/* Display form result */}
        {state.message && (
          <div
            className={`p-4 rounded-md ${
              state.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {state.message}
          </div>
        )}
      </form>
    </div>
  );
}

// Helper function to get field-specific errors
function getFieldError(
  fieldName: string,
  errors?: Array<{ field: string; message: string }>,
): string | undefined {
  return errors?.find(error => error.field === fieldName)?.message;
}
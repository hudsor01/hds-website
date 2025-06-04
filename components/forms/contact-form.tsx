'use client'

import React, { memo, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContactForm } from '@/lib/actions/email-actions'
import { FormErrorBoundary } from '@/components/error/route-error-boundaries'
import { HoneypotField, TimingHoneypot } from '@/components/security/honeypot-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react'
import type { ContactFormProps } from '@/types/form-types'

// React 19 optimized submit button with useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type='submit' 
      disabled={pending}
      className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2'
    >
      {pending ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Sending...
        </>
      ) : (
        <>
          <Send className='h-4 w-4' />
          Send Message
        </>
      )}
    </Button>
  )
}

// React 19 optimized feedback component
const FormFeedback = memo(function FormFeedback({ 
  state, 
}: { 
  state: { success?: boolean; message?: string; error?: string } | null 
}) {
  if (!state) return null

  if (state.success) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 text-green-800'>
          <CheckCircle className='h-5 w-5' />
          <span className='font-semibold'>Message sent successfully!</span>
        </div>
        <p className='text-green-700 text-sm mt-1'>
          {state.message}
        </p>
      </div>
    )
  }

  if (!state.success && state.message) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 text-red-800'>
          <AlertCircle className='h-5 w-5' />
          <span className='font-semibold'>Error</span>
        </div>
        <p className='text-red-700 text-sm mt-1'>
          {state.message}
        </p>
        {state.errors && (
          <div className='mt-2 space-y-1'>
            {Object.entries(state.errors).map(([field, errors]) => (
              <p key={field} className='text-red-600 text-xs'>
                {field}: {(errors as string[]).join(', ')}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
})

// ContactFormProps imported from @/types/form-types

/**
 * React 19 modernized contact form with useActionState and Resend integration
 */
export const ContactForm = memo(function ContactForm({
className,
onSuccess,
onError,
includeFields = ['phone'],
variant = 'simple',
}: ContactFormProps) {
  const isDetailed = variant === 'detailed'
  
  // React 19 useActionState for Server Actions
  const [state, formAction] = useActionState(submitContactForm, null)

  // Handle success callback
  React.useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  // Handle error callback
  React.useEffect(() => {
    if (state && !state.success && state.message && onError) {
      onError(new Error(state.message))
    }
  }, [state, onError])

  return (
    <FormErrorBoundary
      onError={onError}
      className='w-full'
    >
      <div className={`${className} transition-opacity duration-200`}>
        <FormFeedback state={state} />
        
        <form action={formAction} className='space-y-6'>
          {/* Spam protection components */}
          <HoneypotField name='website' />
          <TimingHoneypot />
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                type='text'
                name='name'
                id='name'
                required
                placeholder='John Doe'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email *</Label>
              <Input
                type='email'
                name='email'
                id='email'
                required
                placeholder='john@example.com'
              />
            </div>
          </div>

          {includeFields.includes('phone') && (
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone (Optional)</Label>
              <Input
                type='tel'
                name='phone'
                id='phone'
                placeholder='(555) 123-4567'
              />
            </div>
          )}

          {isDetailed && includeFields.includes('company') && (
            <div className='space-y-2'>
              <Label htmlFor='company'>Company (Optional)</Label>
              <Input
                type='text'
                name='company'
                id='company'
                placeholder='Acme Corp'
              />
            </div>
          )}

          {isDetailed && includeFields.includes('service') && (
            <div className='space-y-2'>
              <Label htmlFor='service'>Service of Interest</Label>
              <Select name='service'>
                <SelectTrigger id='service'>
                  <SelectValue placeholder='Select a service' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='web'>Web Development</SelectItem>
                  <SelectItem value='revops'>Revenue Operations</SelectItem>
                  <SelectItem value='analytics'>Data Analytics</SelectItem>
                  <SelectItem value='strategy'>Business Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='message'>Message *</Label>
            <Textarea
              name='message'
              id='message'
              rows={4}
              required
              placeholder='Tell us about your project...'
              className='resize-vertical'
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </FormErrorBoundary>
  )
})
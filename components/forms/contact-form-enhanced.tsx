'use client'

import React, { useOptimistic, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Send, CheckCircle } from 'lucide-react'

type FormState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

type OptimisticSubmission = {
  id: string
  name: string
  email: string
  message: string
  timestamp: Date
  status: 'pending' | 'confirmed'
}

// React 19 Server Action for form submission
async function submitContactForm(formData: FormData): Promise<FormState> {
  'use server'
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  
  // Basic validation
  if (!name || !email || !message) {
    return {
      status: 'error',
      message: 'All fields are required'
    }
  }
  
  // Here you would integrate with your tRPC API or direct database call
  try {
    // Simulate API call
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit form')
    }
    
    return {
      status: 'success',
      message: 'Thank you! Your message has been sent successfully.'
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to send message. Please try again.'
    }
  }
}

// Enhanced Submit Button with React 19 useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type='submit'
      disabled={pending}
      className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70'
    >
      {pending ? (
        <>
          <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          Sending Message...
        </>
      ) : (
        <>
          <Send className='w-5 h-5 mr-2' />
          Send Message
        </>
      )}
    </Button>
  )
}

// Optimistic UI Component
function OptimisticSubmissions({ submissions }: { submissions: OptimisticSubmission[] }) {
  if (submissions.length === 0) return null
  
  return (
    <div className='mt-6 space-y-2'>
      <h4 className='text-sm font-medium text-gray-700'>Recent Submissions</h4>
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className={`flex items-center gap-2 p-2 rounded-md text-sm ${
            submission.status === 'pending'
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {submission.status === 'pending' ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <CheckCircle className='w-4 h-4' />
          )}
          <span>
            Message from {submission.name} ({submission.status})
          </span>
        </div>
      ))}
    </div>
  )
}

export function ContactFormEnhanced({
  title = 'Get In Touch',
  description = 'Send us a message and we\\'ll get back to you within 24 hours.',
}: {
  title?: string
  description?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [submissions, optimisticSubmit] = useOptimistic<OptimisticSubmission[], OptimisticSubmission>(
    [],
    (state, newSubmission) => [...state, newSubmission]
  )

  async function handleSubmit(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string
    
    // Optimistic update
    const optimisticSubmission: OptimisticSubmission = {
      id: Date.now().toString(),
      name,
      email,
      message,
      timestamp: new Date(),
      status: 'pending'
    }
    
    optimisticSubmit(optimisticSubmission)
    
    startTransition(async () => {
      try {
        const result = await submitContactForm(formData)
        
        if (result.status === 'success') {
          toast.success(result.message || 'Message sent successfully!')
          // Update optimistic submission to confirmed
          optimisticSubmit({ ...optimisticSubmission, status: 'confirmed' })
        } else {
          toast.error(result.message || 'Failed to send message')
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      }
    })
  }

  return (
    <Card className='w-full max-w-2xl mx-auto shadow-xl border-0 bg-white'>
      <CardHeader className='text-center pb-2'>
        <CardTitle className='text-3xl font-bold text-gray-900'>{title}</CardTitle>
        <CardDescription className='text-lg text-gray-600 mt-2'>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form action={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                Full Name *
              </Label>
              <Input
                id='name'
                name='name'
                type='text'
                required
                placeholder='John Doe'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email Address *
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                placeholder='john@example.com'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              />
            </div>
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='message' className='text-sm font-medium text-gray-700'>
              Message *
            </Label>
            <Textarea
              id='message'
              name='message'
              required
              placeholder='Tell us about your project or how we can help...'
              rows={6}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none'
            />
          </div>
          
          <SubmitButton />
        </form>
        
        <OptimisticSubmissions submissions={submissions} />
      </CardContent>
    </Card>
  )
}
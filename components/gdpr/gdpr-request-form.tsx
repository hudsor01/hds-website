'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GDPRRequestType } from '@/lib/gdpr/compliance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Download, Trash2, UserX, FileText, Lock } from 'lucide-react'

const gdprRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  type: z.nativeEnum(GDPRRequestType),
  message: z.string().optional(),
})

type GDPRRequestFormData = z.infer<typeof gdprRequestSchema>

export function GDPRRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GDPRRequestFormData>({
  resolver: zodResolver(gdprRequestSchema),
    defaultValues: {
      type: GDPRRequestType.DATA_ACCESS,
    },
  })

  const onSubmit = async (data: GDPRRequestFormData) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/gdpr/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: result.message || 'Your request has been submitted successfully.',
        })
        reset()
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Failed to submit request. Please try again.',
        })
      }
    } catch {
    setSubmitResult({
    success: false,
    message: 'An error occurred. Please try again later.',
    })
    } finally {
      setIsSubmitting(false)
    }
  }

  const requestTypes = [
    {
      value: GDPRRequestType.DATA_ACCESS,
      label: 'Access My Data',
      description: 'Get a copy of all personal data we have about you',
      icon: FileText,
    },
    {
      value: GDPRRequestType.DATA_PORTABILITY,
      label: 'Export My Data',
      description: 'Download your data in a portable format',
      icon: Download,
    },
    {
      value: GDPRRequestType.DATA_ERASURE,
      label: 'Delete My Data',
      description: 'Request complete deletion of your personal data',
      icon: Trash2,
    },
    {
      value: GDPRRequestType.CONSENT_WITHDRAWAL,
      label: 'Withdraw Consent',
      description: 'Stop all marketing communications and data processing',
      icon: UserX,
    },
  ]

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Shield className='h-6 w-6 text-primary' />
          <CardTitle>Privacy Rights Request</CardTitle>
        </div>
        <CardDescription>
          Exercise your data protection rights under GDPR
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              placeholder='your@email.com'
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-4'>
            <Label>Request Type</Label>
            <RadioGroup
              defaultValue={GDPRRequestType.DATA_ACCESS}
              onValueChange={(value) => {
                register('type').onChange({ target: { value } })
              }}
            >
              {requestTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div key={type.value} className='flex items-start space-x-3'>
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className='mt-1'
                    />
                    <Label
                      htmlFor={type.value}
                      className='flex items-start gap-3 cursor-pointer'
                    >
                      <Icon className='h-5 w-5 text-muted-foreground mt-0.5' />
                      <div className='space-y-1'>
                        <div className='font-medium'>{type.label}</div>
                        <div className='text-sm text-muted-foreground'>
                          {type.description}
                        </div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='message'>Additional Information (Optional)</Label>
            <Textarea
              id='message'
              placeholder='Any additional details about your request...'
              rows={4}
              {...register('message')}
            />
          </div>

          {submitResult && (
            <Alert variant={submitResult.success ? 'default' : 'destructive'}>
              <AlertDescription>{submitResult.message}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            
            <div className='flex items-start gap-2 text-sm text-muted-foreground'>
              <Lock className='h-4 w-4 mt-0.5 flex-shrink-0' />
              <p>
                Your request will be processed within 30 days. We may contact you
                to verify your identity before processing certain requests.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

'use client';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';
import {
  getServiceOptions,
  getContactTimeOptions,
  getBudgetOptions,
  getTimelineOptions,
} from '@/lib/form-utils';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

// Success Message Component
function SuccessMessage({ onReset, className = '' }: { onReset: () => void; className?: string }) {
  return (
    <div className={cn('glass-card p-6 rounded-xl border border-green-700/50 text-center', className)}>
      <div className="mb-6">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
      </div>
      <h2 className="text-responsive-md font-bold text-green-100 mb-4">Message Sent Successfully!</h2>
      <p className="text-green-200 mb-6">
        Thank you for contacting us. We&apos;ll get back to you within 24 hours.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-smooth button-hover-glow"
      >
        Send Another Message
      </button>
    </div>
  );
}

// Form Header Component
function FormHeader() {
  return (
    <div className="mb-8">
      <h2 className="text-responsive-md gradient-text mb-2">Let&apos;s Build Something Amazing</h2>
      <p className="text-muted-foreground">
        Tell us about your project and we&apos;ll get back to you within 24 hours.
      </p>
    </div>
  );
}

export default function ContactFormTanStack({ className = '' }: { className?: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      service: 'Web Development',
      bestTimeToContact: 'any',
      budget: 'not-sure',
      timeline: 'flexible',
      message: '',
    },
    onSubmit: async ({ value }) => {
      logger.info('Contact form submission started', {
        component: 'ContactFormTanStack',
        userFlow: 'lead_generation',
      });

      try {
        // Create FormData from values (to match Server Action signature)
        const formData = new FormData();
        Object.entries(value).forEach(([key, val]) => {
          formData.append(key, val as string);
        });

        // Call server action
        const result = await submitContactForm(null, formData);

        if (result.success) {
          setIsSubmitted(true);
          toast.success('Message sent successfully!', {
            description: "We'll respond within 24 hours",
          });

          logger.info('Contact form submission successful', {
            component: 'ContactFormTanStack',
            conversionEvent: 'contact_form_completed',
            businessValue: 'high',
          });
        } else {
          toast.error('Failed to send message', {
            description: result.error || result.message || 'Please try again',
          });

          logger.error('Contact form submission failed', {
            error: result.error,
            message: result.message,
          });
        }
      } catch (error) {
        toast.error('An error occurred', {
          description: 'Please try again later',
        });

        logger.error('Contact form submission error', error as Error);
      }
    },
  });

  // Show success message if form was submitted successfully
  if (isSubmitted) {
    return (
      <SuccessMessage
        onReset={() => {
          setIsSubmitted(false);
          form.reset();
        }}
        className={className}
      />
    );
  }

  return (
    <div className={`glass-card ${className}`}>
      <FormHeader />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                const result = z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters').safeParse(value);
                return result.success ? undefined : (result.error.errors[0]?.message || 'Validation error');
              },
            }}
          >
            {(field) => (
              <div>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="First Name"
                  autoComplete="given-name"
                  className={cn(
                    'w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth',
                    field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-border'
                  )}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                const result = z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters').safeParse(value);
                return result.success ? undefined : (result.error.errors[0]?.message || 'Validation error');
              },
            }}
          >
            {(field) => (
              <div>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Last Name"
                  autoComplete="family-name"
                  className={cn(
                    'w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth',
                    field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-border'
                  )}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const result = z.string().min(1, 'Email is required').email('Please enter a valid email address').safeParse(value);
              return result.success ? undefined : (result.error.errors[0]?.message || 'Validation error');
            },
          }}
        >
          {(field) => (
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                className={cn(
                  'w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth',
                  field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-border'
                )}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-red-400 text-sm mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Phone and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="phone">
            {(field) => (
              <input
                type="tel"
                id="phone"
                name="phone"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Phone Number (Optional)"
                autoComplete="tel"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth"
              />
            )}
          </form.Field>

          <form.Field name="company">
            {(field) => (
              <input
                type="text"
                id="company"
                name="company"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Company Name (Optional)"
                autoComplete="organization"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth"
              />
            )}
          </form.Field>
        </div>

        {/* Service and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="service">
            {(field) => (
              <select
                id="service"
                name="service"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus-ring transition-smooth"
              >
                {getServiceOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </form.Field>

          <form.Field name="bestTimeToContact">
            {(field) => (
              <select
                id="bestTimeToContact"
                name="bestTimeToContact"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus-ring transition-smooth"
              >
                {getContactTimeOptions().map((opt: { value: string; label: string }) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </form.Field>
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="budget">
            {(field) => (
              <select
                id="budget"
                name="budget"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus-ring transition-smooth"
              >
                {getBudgetOptions().map((opt: { value: string; label: string }) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </form.Field>

          <form.Field name="timeline">
            {(field) => (
              <select
                id="timeline"
                name="timeline"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus-ring transition-smooth"
              >
                {getTimelineOptions().map((opt: { value: string; label: string }) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </form.Field>
        </div>

        {/* Message */}
        <form.Field
          name="message"
          validators={{
            onChange: ({ value }) => {
              const result = z.string().min(1, 'Message is required').min(10, 'Message must be at least 10 characters').safeParse(value);
              return result.success ? undefined : (result.error.errors[0]?.message || 'Validation error');
            },
          }}
        >
          {(field) => (
            <div>
              <textarea
                id="message"
                name="message"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell us about your project..."
                rows={6}
                className={cn(
                  'w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus-ring transition-smooth resize-none',
                  field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-border'
                )}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-red-400 text-sm mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="cta-primary px-12 py-4 text-responsive-sm hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none will-change-transform transition-smooth"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}

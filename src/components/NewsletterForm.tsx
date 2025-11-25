'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/Button';
import { newsletterSchema } from '@/lib/schemas/contact';

type FormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// API function for newsletter signup
async function submitNewsletter(data: FormData): Promise<{ success: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Signup failed');
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

// Success Message Component
function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="p-6 bg-green-100 border border-green-300 rounded-lg">
      <div className="flex items-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
        <h3 className="text-lg font-bold text-green-800">Thank You!</h3>
      </div>
      <p className="text-green-700 mb-4">
        You&apos;ve been signed up for our newsletter. We&apos;ll send you updates on our latest content.
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
      >
        Sign up another email
      </button>
    </div>
  );
}

export function NewsletterForm({ onSuccess, onError }: NewsletterFormProps) {
  // React Query mutation for newsletter signup
  const mutation = useMutation({
    mutationFn: submitNewsletter,
    onSuccess: () => {
      logger.info('Newsletter signup successful', {
        component: 'NewsletterForm',
        conversionEvent: 'newsletter_signup',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      logger.error('Newsletter signup failed', {
        component: 'NewsletterForm',
        error: error.message,
      });

      if (onError) {
        onError(error.message);
      }
    },
  });

  // TanStack Form with validation
  const form = useForm({
    defaultValues: {
      email: '',
      firstName: '',
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        ...value,
        source: 'footer' as const,
      });
    },
  });

  // Show success message if mutation succeeded
  if (mutation.isSuccess) {
    return (
      <SuccessMessage
        onReset={() => {
          mutation.reset();
          form.reset();
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* First Name Field */}
        <form.Field
          name="firstName"
          validators={{
            onChange: ({ value }) => {
              const result = newsletterSchema.shape.firstName.safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                )}
                placeholder="Enter your first name"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Email Field */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const result = newsletterSchema.shape.email.safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  field.state.meta.errors.length > 0
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                )}
                placeholder="Enter your email"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => {
            const isLoading = isSubmitting || mutation.isPending;
            return (
              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe to Newsletter'
                )}
              </Button>
            );
          }}
        </form.Subscribe>

        {/* Error Message */}
        {mutation.isError && (
          <p className="text-sm text-red-600 text-center">
            {mutation.error.message || 'An error occurred. Please try again.'}
          </p>
        )}
      </form>
    </div>
  );
}

'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    <Alert className="border-success/50 bg-success/10">
      <CheckCircle2 className="h-5 w-5 text-success-dark" />
      <AlertTitle className="text-success-darker dark:text-success-light">Thank You!</AlertTitle>
      <AlertDescription className="text-success-darker dark:text-success-muted">
        <p className="mb-heading">
          You&apos;ve been signed up for our newsletter. We&apos;ll send you updates on our latest content.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-success text-success-dark hover:bg-success-dark hover:text-primary-foreground"
        >
          Sign up another email
        </Button>
      </AlertDescription>
    </Alert>
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
        className="space-y-content"
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
            <div className="space-y-tight">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(
                  field.state.meta.errors.length > 0 && 'border-destructive focus-visible:ring-destructive'
                )}
                placeholder="Enter your first name"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive-dark">{field.state.meta.errors[0]}</p>
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
            <div className="space-y-tight">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={cn(
                  field.state.meta.errors.length > 0 && 'border-destructive focus-visible:ring-destructive'
                )}
                placeholder="Enter your email"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive-dark">{field.state.meta.errors[0]}</p>
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
          <Alert variant="destructive">
            <AlertDescription>
              {mutation.error.message || 'An error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

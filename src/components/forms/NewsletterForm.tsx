/**
 * Newsletter Form Component
 * Consolidated newsletter signup with flexible variants
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletter } from '@/hooks/use-newsletter';
import { cn } from '@/lib/utils';
import { FormValidator, newsletterSchema } from '@/lib/validation';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'full' | 'inline' | 'sidebar';
  title?: string;
  description?: string;
  emailOnly?: boolean;
}

export function NewsletterForm({
  variant = 'full',
  title = 'Get Expert Insights',
  description = 'Join our newsletter for the latest updates and insights.',
  emailOnly = false
}: NewsletterFormProps) {
  const { message, isLoading, isSuccess, isError, subscribe, reset: resetNewsletter } = useNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;

    // Validate using the new validation schema
    const validation = FormValidator.validateForm(
      { email, firstName, source: variant },
      newsletterSchema
    );

    if (!validation.isValid) {
      // Handle validation errors
      return;
    }

    subscribe({
      email,
      firstName: emailOnly ? undefined : firstName || undefined,
      source: variant
    });
  };

  const handleReset = () => {
    resetNewsletter();
  };

  if (isSuccess) {
    return (
      <Alert className="border-success/50 bg-success/10">
        <CheckCircle2 className="h-5 w-5 text-success-dark" />
        <AlertDescription className="text-success-dark">
          <p className="mb-2">
            Thank you! Check your email to confirm your subscription.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-success text-success-dark hover:bg-success-dark hover:text-white"
          >
            Sign up another email
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const styles = {
    full: 'max-w-md mx-auto p-6 rounded-lg border-border bg-card',
    inline: 'p-4 rounded-lg border border-border bg-card',
    sidebar: 'p-4 rounded-lg bg-primary/10',
  };

  return (
    <div className={cn(styles[variant])}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
            <Mail className="h-5 w-5 text-accent" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className={cn("flex gap-2", variant === 'full' ? 'flex-col sm:flex-row' : '')}>
              <Input
                type="email"
                name="email"
                placeholder="your@email.com"
                disabled={isLoading}
                className="flex-1"
                required
              />

              {!emailOnly && variant !== 'inline' && (
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  disabled={isLoading}
                  className="flex-1"
                />
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(variant === 'full' ? 'w-full sm:w-auto' : '')}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            {message && (
              <Alert variant={isError ? 'destructive' : 'default'} className={isSuccess ? 'border-success/50 bg-success/10' : ''}>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

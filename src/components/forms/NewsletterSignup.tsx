/**
 * Newsletter Signup Component
 * Captures email subscriptions for marketing automation
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormValidator, newsletterSchema } from '@/lib/validation';
import { AlertCircle, Check, Mail } from 'lucide-react';
import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'sidebar' | 'modal';
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  variant = 'inline',
  title = 'Get Expert Insights',
  description = 'Join 500+ tech leaders receiving our weekly newsletter on scaling engineering teams.',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using the new validation schema
    const validation = FormValidator.validateForm(
      { email },
      newsletterSchema
    );

    if (!validation.isValid) {
      setStatus('error');
      setMessage(validation.errors?.email || 'Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you! Check your email to confirm your subscription.');
        setEmail('');

        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: email,
          });
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const variantStyles = {
    inline: 'rounded-lg border border-border bg-card card-padding dark:border-border dark:bg-muted',
    sidebar: 'rounded-lg bg-primary/10 card-padding dark:from-card dark:to-background',
    modal: 'rounded-lg bg-card card-padding-lg shadow-xl dark:bg-muted',
  };

  return (
    <div className={variantStyles[variant]}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 dark:bg-primary-hover">
            <Mail className="h-5 w-5 text-primary dark:text-accent" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground dark:text-primary-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex gap-tight">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={status === 'loading' || status === 'success'}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? (
                  'Subscribing...'
                ) : status === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            {message && (
              <Alert variant={status === 'error' ? 'destructive' : 'default'} className={status === 'success' ? 'border-success/50 bg-success/10' : ''}>
                <AlertDescription className={`flex items-center gap-tight ${status === 'success' ? 'text-success-dark dark:text-success-text' : ''}`}>
                  {status === 'error' && <AlertCircle className="h-4 w-4" />}
                  {status === 'success' && <Check className="h-4 w-4" />}
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

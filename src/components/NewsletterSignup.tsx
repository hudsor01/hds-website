/**
 * Newsletter Signup Component
 * Captures email subscriptions for marketing automation
 */

'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
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
    inline: 'rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-muted',
    sidebar: 'rounded-lg bg-cyan-600/10 p-6 dark:from-gray-800 dark:to-gray-900',
    modal: 'rounded-lg bg-white p-8 shadow-xl dark:bg-muted',
  };

  return (
    <div className={variantStyles[variant]}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
            <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex gap-2">
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
              <Alert variant={status === 'error' ? 'destructive' : 'default'} className={status === 'success' ? 'border-green-500/50 bg-green-500/10' : ''}>
                <AlertDescription className={`flex items-center gap-2 ${status === 'success' ? 'text-green-600 dark:text-green-400' : ''}`}>
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

/**
 * Private Testimonial Submission Page
 * Accessed via unique token link sent to clients
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTestimonialRequestByToken } from '@/lib/testimonials';
import { TestimonialForm } from '@/components/testimonials/TestimonialForm';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const request = await getTestimonialRequestByToken(token);

  if (!request) {
    return {
      title: 'Invalid Link | Hudson Digital Solutions',
    };
  }

  return {
    title: `Share Your Feedback | Hudson Digital Solutions`,
    description: `Thank you for working with us, ${request.client_name}! Please share your experience.`,
  };
}

export default async function PrivateTestimonialPage({ params }: PageProps) {
  const { token } = await params;
  const request = await getTestimonialRequestByToken(token);

  // Invalid token
  if (!request) {
    notFound();
  }

  // Check if expired
  const isExpired = new Date(request.expires_at) < new Date();

  // Check if already submitted
  if (request.submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="container-narrow py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-content-block rounded-full bg-success-muted dark:bg-success-bg-dark/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success-dark" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-heading">
              Already Submitted
            </h1>
            <p className="text-muted-foreground">
              Thank you! You&apos;ve already submitted your testimonial using this link.
              We appreciate your feedback!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if expired
  if (isExpired) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="container-narrow py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-content-block rounded-full bg-warning-muted dark:bg-warning-bg-dark/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-warning-dark" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-heading">
              Link Expired
            </h1>
            <p className="text-muted-foreground mb-content-block">
              This testimonial link has expired. If you&apos;d still like to share
              your feedback, please contact us for a new link.
            </p>
            <Link
              href="/testimonials/submit"
              className="inline-block px-6 py-3 bg-primary text-foreground rounded-lg font-semibold hover:bg-primary-hover transition-colors"
            >
              Submit Public Testimonial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-narrow py-12 md:py-section">
        <div className="max-w-2xl mx-auto">
          {/* Personalized Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-heading">
              Thank You, {request.client_name}!
            </h1>
            <p className="text-lg text-muted-foreground">
              We&apos;d love to hear about your experience
              {request.project_name && ` working on ${request.project_name}`}.
              Your feedback means a lot to us!
            </p>
          </div>

          {/* Form */}
          <div className="bg-card dark:bg-card rounded-xl shadow-lg border border-border card-padding md:card-padding-lg">
            <TestimonialForm
              requestId={request.id}
              token={token}
              defaultName={request.client_name}
            />
          </div>

          {/* Footer Note */}
          <p className="text-sm text-muted-foreground text-center mt-content-block">
            By submitting, you agree that your testimonial may be used on our website
            and marketing materials.
          </p>
        </div>
      </div>
    </div>
  );
}

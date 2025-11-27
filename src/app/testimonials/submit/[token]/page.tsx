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
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Link Expired
            </h1>
            <p className="text-muted-foreground mb-6">
              This testimonial link has expired. If you&apos;d still like to share
              your feedback, please contact us for a new link.
            </p>
            <Link
              href="/testimonials/submit"
              className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
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
      <div className="container-narrow py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Personalized Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Thank You, {request.client_name}!
            </h1>
            <p className="text-lg text-muted-foreground">
              We&apos;d love to hear about your experience
              {request.project_name && ` working on ${request.project_name}`}.
              Your feedback means a lot to us!
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
            <TestimonialForm
              requestId={request.id}
              token={token}
              defaultName={request.client_name}
            />
          </div>

          {/* Footer Note */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            By submitting, you agree that your testimonial may be used on our website
            and marketing materials.
          </p>
        </div>
      </div>
    </div>
  );
}

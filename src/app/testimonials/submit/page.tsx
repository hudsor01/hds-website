/**
 * Public Testimonial Submission Page
 * Allows anyone to submit a testimonial
 */

import type { Metadata } from 'next';
import { TestimonialForm } from '@/components/testimonials/TestimonialForm';

export const metadata: Metadata = {
  title: 'Submit a Testimonial | Hudson Digital Solutions',
  description: 'Share your experience working with Hudson Digital Solutions. Your feedback helps us improve and helps others make informed decisions.',
};

export default function PublicTestimonialPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-narrow py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Share Your Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              We value your feedback! Your testimonial helps us improve and helps others
              learn about our services.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
            <TestimonialForm />
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

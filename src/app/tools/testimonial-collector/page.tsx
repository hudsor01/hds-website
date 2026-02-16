/**
 * Testimonial Collector Dashboard
 * Manage testimonials and generate private collection links
 */

import type { Metadata } from 'next';
import TestimonialCollectorClient from './TestimonialCollectorClient';

export const metadata: Metadata = {
  title: 'Testimonial Collector | Hudson Digital Solutions',
  description:
    'Manage testimonials and generate private collection links. Collect and showcase client feedback for your business.',
  openGraph: {
    title: 'Testimonial Collector',
    description:
      'Manage testimonials and generate private collection links.',
  },
};

export default function TestimonialCollectorPage() {
  return <TestimonialCollectorClient />;
}

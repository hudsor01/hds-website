/**
 * Testimonial Form Component
 * Used for both public and private testimonial submission
 */

'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { SERVICE_TYPES } from '@/lib/testimonials';
import { trackEvent } from '@/lib/analytics';

interface TestimonialFormProps {
  requestId?: string;
  token?: string;
  defaultName?: string;
}

export function TestimonialForm({ requestId, token, defaultName }: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    client_name: defaultName || '',
    company: '',
    role: '',
    rating: 5,
    content: '',
    video_url: '',
    service_type: '',
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.client_name.trim()) {
      setError('Please enter your name');
      setIsSubmitting(false);
      return;
    }

    if (!formData.content.trim() || formData.content.length < 20) {
      setError('Please write a testimonial of at least 20 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          request_id: requestId,
          token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit testimonial');
      }

      setIsSubmitted(true);
      trackEvent('testimonial_submitted', {
        rating: formData.rating,
        service_type: formData.service_type,
        is_private_link: !!token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Thank You!
        </h2>
        <p className="text-muted-foreground">
          Your testimonial has been submitted successfully. We appreciate you taking
          the time to share your feedback!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          How would you rate your experience? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleChange('rating', star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="p-1 transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating ?? formData.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formData.rating === 5 && 'Excellent!'}
          {formData.rating === 4 && 'Great!'}
          {formData.rating === 3 && 'Good'}
          {formData.rating === 2 && 'Fair'}
          {formData.rating === 1 && 'Poor'}
        </p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="client_name" className="block text-sm font-medium text-foreground mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="client_name"
          type="text"
          value={formData.client_name}
          onChange={(e) => handleChange('client_name', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
          placeholder="John Smith"
          required
        />
      </div>

      {/* Company & Role */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1">
            Company (Optional)
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
            placeholder="Acme Inc."
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
            Your Role (Optional)
          </label>
          <input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
            placeholder="CEO, Marketing Director, etc."
          />
        </div>
      </div>

      {/* Service Type */}
      <div>
        <label htmlFor="service_type" className="block text-sm font-medium text-foreground mb-1">
          Service Used (Optional)
        </label>
        <select
          id="service_type"
          value={formData.service_type}
          onChange={(e) => handleChange('service_type', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
        >
          <option value="">Select a service...</option>
          {SERVICE_TYPES.map((service) => (
            <option key={service.value} value={service.value}>
              {service.label}
            </option>
          ))}
        </select>
      </div>

      {/* Testimonial Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1">
          Your Testimonial <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={5}
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
          placeholder="Tell us about your experience working with Hudson Digital Solutions..."
          required
          minLength={20}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length} characters (minimum 20)
        </p>
      </div>

      {/* Video URL (Optional) */}
      <div>
        <label htmlFor="video_url" className="block text-sm font-medium text-foreground mb-1">
          Video Testimonial URL (Optional)
        </label>
        <input
          id="video_url"
          type="url"
          value={formData.video_url}
          onChange={(e) => handleChange('video_url', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
          placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Share a YouTube, Loom, or other video link
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Testimonial
          </>
        )}
      </button>
    </form>
  );
}

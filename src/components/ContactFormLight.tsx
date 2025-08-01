'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackFormSubmission } from '@/lib/posthog';
import { useContactFormStore } from '@/stores/form';
import { getCSRFToken } from '@/lib/csrf';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { useErrorStore } from '@/stores/error';

export default function ContactFormLight() {
  const { 
    isSubmitted, 
    setSubmitted, 
    updateData, 
    resetForm: resetStore 
  } = useContactFormStore();
  const { addError } = useErrorStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      service: undefined,
      budget: undefined,
      timeline: undefined,
      message: '',
    },
  });
  
  // Watch form data and sync with Zustand store
  const formData = watch();
  updateData(formData);


  const onSubmit = async (data: ContactFormData) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit form');
      }

      // Track successful submission with lead score
      trackFormSubmission('contact', true, {
        service: data.service,
        budget: data.budget,
        hasCompany: !!data.company,
        leadScore: result.leadScore,
      });

      setSubmitted(true);
      reset();
      resetStore();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      
      // Add to error store for global error tracking
      addError({
        message: errorMessage,
        category: 'network',
        severity: 'medium',
        metadata: { form: 'contact', data },
      });
      
      // Track failed submission
      trackFormSubmission('contact', false);
      
      // Re-throw to let react-hook-form handle the error
      throw error;
    }
  };

  if (isSubmitted) {
    return (
      <div className="fade-in bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
          Message Sent Successfully!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-6">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            reset();
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 fade-in">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="John"
          />
          {errors.firstName?.message && (
            <p className="mt-1 text-sm text-red-500 fade-in">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Doe"
          />
          {errors.lastName?.message && (
            <p className="mt-1 text-sm text-red-500 fade-in">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500 ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="john@example.com"
        />
        {errors.email?.message && (
          <p className="mt-1 text-sm text-red-500 fade-in">{errors.email.message}</p>
        )}
      </div>

      {/* Phone and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Phone (Optional)
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="+1 (555) 000-0000"
          />
          {errors.phone?.message && (
            <p className="mt-1 text-sm text-red-500 fade-in">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
            Company (Optional)
          </label>
          <input
            {...register('company')}
            type="text"
            id="company"
            className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500"
            placeholder="Acme Corp"
          />
        </div>
      </div>

      {/* Service and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
            Service Needed
          </label>
          <select
            {...register('service')}
            id="service"
            className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white"
          >
            <option value="">Select a service</option>
            <option value="website">Website Development</option>
            <option value="webapp">Web Application</option>
            <option value="ecommerce">E-commerce Solution</option>
            <option value="optimization">Performance Optimization</option>
            <option value="consultation">Strategy Consultation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
            Project Budget
          </label>
          <select
            {...register('budget')}
            id="budget"
            className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white"
          >
            <option value="">Select budget range</option>
            <option value="5-10K">$5,000 - $10,000</option>
            <option value="10-25K">$10,000 - $25,000</option>
            <option value="25-50K">$25,000 - $50,000</option>
            <option value="50K+">$50,000+</option>
            <option value="tbd">To Be Determined</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
          Project Timeline
        </label>
        <input
          {...register('timeline')}
          type="text"
          id="timeline"
          className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500"
          placeholder="e.g., 3 months, ASAP, Q1 2024"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Project Details *
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className={`w-full px-4 py-3 bg-black/40 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-500 resize-none ${
            errors.message ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Tell us about your project goals, challenges, and vision..."
        />
        {errors.message?.message && (
          <p className="mt-1 text-sm text-red-500 fade-in">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black shadow-lg hover:shadow-cyan-500/25'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </div>

      {/* General Error Message */}
      {errors.root?.message && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 fade-in">
          <p className="text-red-800 dark:text-red-200 text-sm">{errors.root.message}</p>
        </div>
      )}
    </form>
  );
}
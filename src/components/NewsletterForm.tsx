'use client';

import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';

// Define validation schema using Zod
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
});

type FormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function NewsletterForm({ onSuccess, onError }: NewsletterFormProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({ 
    email: '', 
    firstName: '' 
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = (data: FormData) => {
    try {
      newsletterSchema.parse(data);
      return {};
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof FormData] = issue.message;
          }
        });
        return fieldErrors;
      }
      return {};
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing in a field that had an error
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validate(formData);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      // In a real implementation, you would make an API call:
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      //
      // if (!response.ok) throw new Error('Signup failed');
      
      try {
        // Make API call to newsletter endpoint
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Signup failed');
        }
        
        setSubmitted(true);
        if (onSuccess) {onSuccess();}
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        if (onError) {onError(errorMessage);}
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="p-6 bg-green-100 border border-green-300 rounded-lg">
        <h3 className="text-lg font-bold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">
          {`You've been signed up for our newsletter. We'll send you updates on our latest content.`}
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({ email: '', firstName: '' });
            setErrors({});
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Sign up another email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="default"
          size="default"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Subscribe to Newsletter'}
        </Button>
      </form>
    </div>
  );
}
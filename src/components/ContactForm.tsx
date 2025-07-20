"use client";
import { useState } from "react";
import { RocketLaunchIcon, CheckCircleIcon, ShieldCheckIcon, StarIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import CalendarWidget from "./CalendarWidget";
import { trackEvent } from "@/lib/analytics";
import { useCSRFToken } from "@/hooks/useCSRFToken";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
}

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { token: csrfToken, loading: csrfLoading, error: csrfError, refreshToken } = useCSRFToken();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Check if CSRF token is available
    if (!csrfToken) {
      if (csrfError) {
        setErrors({ message: 'Security token error. Please refresh the page and try again.' });
      } else {
        setErrors({ message: 'Loading security token. Please wait and try again.' });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }
      
      // Track successful form submission
      trackEvent('contact_form_submit', 'form', 'success', 1);
      trackEvent('lead_captured', 'conversion', form.service || 'general');
      
      // Track lead quality based on budget
      if (form.budget && form.budget.includes('50K+')) {
        trackEvent('high_value_lead', 'conversion', 'enterprise');
      }
      
      setIsSubmitted(true);
      setForm(initialForm);
      
      // Track conversion event for analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          event_category: 'Contact',
          event_label: 'Form Submission',
          value: 1,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Track form submission errors
      trackEvent('contact_form_error', 'form', error instanceof Error ? error.message : 'unknown_error');
      
      let errorMessage = error instanceof Error ? error.message : 'Failed to submit form. Please try again.';
      
      // If it's a CSRF error (403), try to refresh the token
      if (error instanceof Error && error.message.includes('security token')) {
        try {
          await refreshToken();
          errorMessage = 'Security token refreshed. Please try submitting again.';
        } catch {
          errorMessage = 'Security token error. Please refresh the page and try again.';
        }
      }
      
      setErrors({ message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-hero relative">
      {/* Power Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      </div>
      {/* Dynamic Energy Elements */}
      <div className="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6 glow-cyan">Let&apos;s Build Something Legendary</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      {/* Contact Section */}
      <section className="relative py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Contact Form */}
            <div className="lg:col-span-2">
              <div className="shadow-2xl hover:shadow-secondary-500/30 transition-all duration-500 glass-morphism bg-black/95 border border-cyan-300 rounded-xl">
                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center glow-cyan">
                      <RocketLaunchIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white glow-cyan">Launch Your Project</h2>
                      <p className="text-gray-400">Complete this form and we&apos;ll respond within 4 hours.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                        className={`input-dark ${errors.firstName ? 'border-red-500' : ''}`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                        className={`input-dark ${errors.lastName ? 'border-red-500' : ''}`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        type="email"
                        required
                        className={`input-dark ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                      )}
                    </div>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="input-dark"
                    />
                  </div>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="input-dark"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      placeholder="Service Needed"
                      className="input-dark"
                    />
                    <input
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="Project Budget"
                      className="input-dark"
                    />
                  </div>
                  <input
                    name="timeline"
                    value={form.timeline}
                    onChange={handleChange}
                    placeholder="Project Timeline"
                    className="input-dark"
                  />
                  <div>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project goals, requirements, and any specific features you need..."
                      rows={5}
                      required
                      className={`input-dark ${errors.message ? 'border-red-500' : ''}`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                    )}
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || csrfLoading || !csrfToken}
                      className={`w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 glow-cyan ${
                        isSubmitting || csrfLoading || !csrfToken ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <RocketLaunchIcon className="w-5 h-5" />
                      {isSubmitting ? 'Submitting...' : csrfLoading ? 'Loading...' : 'Launch Project'}
                    </button>
                  </div>
                  {isSubmitted && (
                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-400 text-center">
                        <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                        Thank you! Your message has been sent successfully.
                      </p>
                    </div>
                  )}
                  
                  {csrfError && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-center text-sm">
                        Security initialization failed. Please refresh the page.
                      </p>
                    </div>
                  )}
                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Response within 4 hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                      <span className="text-sm">100% Confidential</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">5-Star Service</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism bg-black/95 border border-cyan-200 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-cyan-400 glow-cyan" />
                    <h3 className="text-lg font-black text-white glow-cyan">Quick Contact</h3>
                  </div>
                  <div className="space-y-4">
                    <a
                      href="mailto:hello@hudsondigitalsolutions.com"
                      target="_blank"
                      className="flex items-center gap-3 p-4 glass-light rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform glow-cyan">
                        <EnvelopeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Email Us</p>
                      </div>
                    </a>
                    <a
                      href="https://github.com/hudsor01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 glass-light rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        {/* GitHub SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-white">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">GitHub</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="shadow-lg hover:shadow-accent-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism bg-black/95 border border-green-200 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ClockIcon className="w-6 h-6 text-green-400 glow-green" />
                    <h3 className="text-lg font-black text-white glow-green">Response Time</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-accent-400 glow-green mb-2">&lt; 4 Hours</div>
                    <p className="text-gray-300 text-sm">Average response time</p>
                  </div>
                </div>
              </div>
              <div className="shadow-lg hover:shadow-warning-500/30 hover:-translate-y-2 transition-all duration-500 glass-morphism bg-black/95 border border-yellow-400 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-yellow-400 glow-orange" />
                    <h3 className="text-lg font-black text-white glow-orange">Success Rate</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-warning-400 glow-orange mb-2">98.9%</div>
                    <p className="text-gray-300 text-sm">Project success rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="relative py-16 bg-gradient-primary border-t border-gray-700">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <CalendarWidget />
        </div>
      </section>
    </main>
  );
}
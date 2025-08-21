'use client'

import { useState, useEffect } from 'react'
import type { ContactFormData } from '@/types/api'
import CustomSelect from '@/components/ui/CustomSelect'
import FloatingInput from '@/components/ui/FloatingInput'
import FloatingTextarea from '@/components/ui/FloatingTextarea'

interface ContactFormProps {
  className?: string
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csrfToken, setCSRFToken] = useState<string | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    bestTimeToContact: '',
    message: ''
  })
  
  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf')
        if (response.ok) {
          const data = await response.json()
          setCSRFToken(data.token)
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }
    }
    
    fetchCSRFToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Ensure we have a CSRF token before submitting
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page and try again.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitted(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        bestTimeToContact: '',
        message: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <div className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 ${className}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
            <div className="text-green-400 text-2xl">✓</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="inline-flex items-center px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 ${className}`}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-4">
          <div className="w-6 h-6 bg-cyan-400 rounded-sm"></div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Let&apos;s Build Something Amazing
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
          Ready to transform your ideas into reality? Share your vision with us.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingInput
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            autoComplete="given-name"
          />
          <FloatingInput
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <FloatingInput
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          autoComplete="email"
        />

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingInput
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            placeholder="Phone Number"
            autoComplete="tel"
          />
          <FloatingInput
            type="text"
            id="company"
            name="company"
            value={formData.company || ''}
            onChange={handleInputChange}
            placeholder="Company Name"
            autoComplete="organization"
          />
        </div>

        {/* Service Selection */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-cyan-400 mb-3 font-semibold">
            Primary Interest *
          </label>
          <CustomSelect
            id="service"
            name="service"
            required={true}
            value={formData.service || ''}
            onChange={handleSelectChange('service')}
            placeholder="What type of project are you considering?"
            options={[
              { value: 'Custom Development', label: 'Custom Development' },
              { value: 'Revenue Operations', label: 'Revenue Operations' },
              { value: 'Partnership Management', label: 'Partnership Management' },
              { value: 'Other', label: 'Other Services' }
            ]}
          />
        </div>

        {/* Best Time to Contact */}
        <div>
          <label htmlFor="bestTimeToContact" className="block text-sm font-medium text-cyan-400 mb-3 font-semibold">
            Preferred Contact Time *
          </label>
          <CustomSelect
            id="bestTimeToContact"
            name="bestTimeToContact"
            required={true}
            value={formData.bestTimeToContact || ''}
            onChange={handleSelectChange('bestTimeToContact')}
            placeholder="When's the best time to reach you?"
            options={[
              { value: 'Morning (9 AM - 12 PM)', label: 'Morning (9 AM - 12 PM)' },
              { value: 'Afternoon (12 PM - 5 PM)', label: 'Afternoon (12 PM - 5 PM)' },
              { value: 'Evening (5 PM - 8 PM)', label: 'Evening (5 PM - 8 PM)' },
              { value: 'Anytime', label: 'Anytime works for me' }
            ]}
          />
        </div>

        {/* Message */}
        <FloatingTextarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your project, goals, and requirements..."
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-400">⚠</div>
              </div>
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center space-x-3">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <div className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200">→</div>
              </>
            )}
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
        </button>
      </form>

      {/* Privacy Note */}
      <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-700/50">
        <div className="w-4 h-4 text-green-400">🔒</div>
        <p className="text-xs text-gray-400 font-medium">
          We respect your privacy. Your information will never be shared.
        </p>
      </div>
    </div>
  )
}
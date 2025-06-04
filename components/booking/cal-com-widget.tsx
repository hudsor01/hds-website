'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock, Video, MapPin, Loader2 } from 'lucide-react'
import { calConfig, isCalLoaded, waitForCal } from '@/lib/integrations/cal-config'
import type { CalComWidgetProps, CalComButtonProps } from '@/types/cal-types'

/**
 * Cal.com inline embed widget component
 * Uses official Cal.com embed script with proper TypeScript support
 */
export function CalComWidget({
  calLink = calConfig.defaultCalLink,
  theme = 'light',
  hideEventTypeDetails = false,
  layout = 'month_view',
  className = '',
  onReady,
  onError,
  onEventTypeSelected,
  onBookingSuccessful,
  onLinkReady,
  onLinkFailed,
  onDimensionChanged,
  onAllEvents,
}: CalComWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const setupEventListeners = useCallback(() => {
    if (!isCalLoaded()) return

    // Set up all Cal.com embed event listeners
    if (onEventTypeSelected) {
      window.Cal!('on', {
        action: 'eventTypeSelected',
        callback: onEventTypeSelected,
      })
    }

    if (onBookingSuccessful) {
      window.Cal!('on', {
        action: 'bookingSuccessful',
        callback: onBookingSuccessful,
      })
    }

    if (onLinkReady) {
      window.Cal!('on', {
        action: 'linkReady',
        callback: onLinkReady,
      })
    }

    if (onLinkFailed) {
      window.Cal!('on', {
        action: 'linkFailed',
        callback: onLinkFailed,
      })
    }

    if (onDimensionChanged) {
      window.Cal!('on', {
        action: '__dimensionChanged',
        callback: onDimensionChanged,
      })
    }

    if (onAllEvents) {
      window.Cal!('on', {
        action: '*',
        callback: onAllEvents,
      })
    }
  }, [onEventTypeSelected, onBookingSuccessful, onLinkReady, onLinkFailed, onDimensionChanged, onAllEvents])

  const loadCalScript = useCallback(async () => {
    try {
      // Check if script is already loaded
      if (isCalLoaded()) {
        setupEventListeners()
        setIsLoading(false)
        onReady?.()
        return
      }

      // Check if script element already exists
      const existingScript = document.querySelector(`script[src="${calConfig.embedScriptUrl}"]`)
      if (existingScript) {
        await waitForCal()
        setupEventListeners()
        setIsLoading(false)
        onReady?.()
        return
      }

      // Load the script
      const script = document.createElement('script')
      script.src = calConfig.embedScriptUrl
      script.async = true
      
      script.onload = async () => {
        try {
          await waitForCal()
          setupEventListeners()
          setIsLoading(false)
          onReady?.()
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to initialize Cal.com')
          setError(error)
          setIsLoading(false)
          onError?.(error)
        }
      }

      script.onerror = () => {
        const error = new Error('Failed to load Cal.com script')
        setError(error)
        setIsLoading(false)
        onError?.(error)
      }

      document.head.appendChild(script)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unexpected error loading Cal.com')
      setError(error)
      setIsLoading(false)
      onError?.(error)
    }
  }, [onReady, onError, setupEventListeners])

  useEffect(() => {
    loadCalScript()

    return () => {
      // Cleanup is handled by Cal.com itself
      // Script remains in DOM for performance as recommended by Cal.com
    }
  }, [loadCalScript])

  const embedConfig = {
    ...calConfig.defaultEmbedConfig,
    hideEventTypeDetails,
    layout,
    theme,
  }

  if (error) {
    return (
      <div className={`cal-com-widget-error ${className}`} role="alert">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 mb-4">Unable to load booking calendar</p>
          <p className="text-sm text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              loadCalScript()
            }}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`cal-com-widget ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-8" aria-live="polite">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading booking calendar...</span>
        </div>
      )}
      
      <div
        data-cal-namespace={embedConfig.namespace}
        data-cal-link={calLink}
        data-cal-config={JSON.stringify(embedConfig)}
        style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'scroll',
          display: isLoading ? 'none' : 'block',
        }}
        aria-label="Booking calendar"
      />
    </div>
  )
}

/**
 * Cal.com popup button component
 * Triggers Cal.com modal on click
 */
export function CalComButton({
  calLink = calConfig.defaultCalLink,
  children,
  className = '',
  theme = 'light',
  onBookingSuccess,
  onBookingError,
}: CalComButtonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadCalScript = useCallback(async () => {
    try {
      if (isCalLoaded()) {
        setIsLoading(false)
        return
      }

      const existingScript = document.querySelector(`script[src="${calConfig.embedScriptUrl}"]`)
      if (existingScript) {
        await waitForCal()
        setIsLoading(false)
        return
      }

      const script = document.createElement('script')
      script.src = calConfig.embedScriptUrl
      script.async = true
      
      script.onload = async () => {
        try {
          await waitForCal()
          setIsLoading(false)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to initialize Cal.com')
          setError(error)
          setIsLoading(false)
          onBookingError?.(error)
        }
      }

      script.onerror = () => {
        const error = new Error('Failed to load Cal.com script')
        setError(error)
        setIsLoading(false)
        onBookingError?.(error)
      }

      document.head.appendChild(script)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unexpected error loading Cal.com')
      setError(error)
      setIsLoading(false)
      onBookingError?.(error)
    }
  }, [onBookingError])

  useEffect(() => {
    loadCalScript()
  }, [loadCalScript])

  const handleClick = useCallback(() => {
    if (error) {
      onBookingError?.(error)
      return
    }

    if (!isCalLoaded()) {
      const loadError = new Error('Cal.com is not available')
      onBookingError?.(loadError)
      return
    }

    try {
      window.Cal!('inline', {
        elementOrSelector: '#cal-booking-modal',
        calLink,
        layout: 'month_view',
        theme,
        styles: {
          branding: {
            brandColor: calConfig.defaultBrandColor,
          },
        },
      })
      onBookingSuccess?.({})
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to open booking modal')
      onBookingError?.(error)
    }
  }, [calLink, theme, error, onBookingSuccess, onBookingError])

  const isDisabled = isLoading || error !== null

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        data-cal-link={calLink}
        data-cal-namespace="consultation-button"
        className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Schedule consultation"
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading...
          </span>
        ) : error ? (
          'Booking Unavailable'
        ) : (
          children
        )}
      </button>
      
      <div id="cal-booking-modal" aria-live="polite" />
    </>
  )
}

/**
 * Pre-built consultation booking component
 * Complete booking interface with consultation options
 */
export function ConsultationBooking() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Schedule Your Free Consultation
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose a time that works for you to discuss your revenue operations needs. 
          All consultations are completely free with no obligation.
        </p>
      </div>

      {/* Consultation Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Video Call</h3>
          <p className="text-sm text-gray-600">30-60 minutes via Zoom</p>
        </div>

        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">In-Person</h3>
          <p className="text-sm text-gray-600">Dallas-Fort Worth area</p>
        </div>

        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Flexible</h3>
          <p className="text-sm text-gray-600">Evenings & weekends available</p>
        </div>
      </div>

      {/* Cal.com Widget */}
      <div className="min-h-[600px]">
        <CalComWidget
          calLink={calConfig.defaultCalLink}
          theme="light"
          layout="month_view"
          className="w-full h-full"
          onReady={() => console.log('Cal.com booking calendar ready')}
          onError={(error) => console.error('Cal.com error:', error)}
          onEventTypeSelected={(event) => {
            console.log('Event type selected:', event.detail.data)
            // Could track analytics here
          }}
          onBookingSuccessful={(event) => {
            console.log('Booking successful:', event.detail.data)
            // Could trigger success analytics or redirects here
          }}
          onLinkReady={(event) => {
            console.log('Cal.com embed ready:', event.detail.data)
          }}
          onLinkFailed={(event) => {
            console.error('Cal.com embed failed:', event.detail.data)
          }}
          onDimensionChanged={(event) => {
            console.log('Embed dimensions changed:', event.detail.data)
            // Could adjust container sizing here
          }}
          onAllEvents={(event) => {
            console.log('Cal.com event:', event.detail.type, event.detail.data)
            // Could send all events to analytics
          }}
        />
      </div>

      {/* Contact Alternative */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 mb-4">
          Prefer to talk first? Call us directly or send an email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+12345678900"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Call (234) 567-8900
          </a>
          <a
            href="mailto:hello@hudsondigitalsolutions.com"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            hello@hudsondigitalsolutions.com
          </a>
        </div>
      </div>
    </div>
  )
}
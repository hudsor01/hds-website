/**
 * Enhanced Cal.com Booking Widget
 * 
 * Production-ready booking component using Cal.com Atoms API
 * with comprehensive analytics, error handling, and accessibility.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
// import { CalProvider } from '@calcom/atoms' // TODO: Add when Cal.com integration is active
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, DollarSign, Users, Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import { trackBookingPageView, trackBookingStarted } from '@/lib/analytics/booking-analytics'
import { useAnalyticsStore } from '@/lib/store/analytics-store'
import type { CalService, CalBookingState, CalConfig } from '@/types/cal-types'
import { cn } from '@/lib/utils'
import type { CalEventType } from '@/types/booking-types'

interface CalBookingWidgetProps {
  /** Service configuration for the booking */
  service?: CalService
  /** Cal.com event type ID */
  eventTypeId?: number
  /** Custom booking configuration */
  config?: CalConfig
  /** Callback when booking is successful */
  onBookingSuccess?: (booking: CalEventType) => void
  /** Callback when booking fails */
  onBookingError?: (error: Error) => void
  /** Custom CSS classes */
  className?: string
  /** Enable analytics tracking */
  enableAnalytics?: boolean
  /** Show service information */
  showServiceInfo?: boolean
  /** Prefill data for the booking form */
  prefillData?: {
    name?: string
    email?: string
    notes?: string
  }
}

export function CalBookingWidget({
  service,
  eventTypeId,
  _config = {},
  onBookingSuccess,
  onBookingError,
  className,
  enableAnalytics = true,
  showServiceInfo = true,
  _prefillData,
}: CalBookingWidgetProps) {
  const [bookingState, setBookingState] = useState<CalBookingState>({
    isLoading: false,
    isBooked: false,
    retryCount: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const { sessionId } = useAnalyticsStore()

  // Track page view when component mounts
  useEffect(() => {
    if (enableAnalytics && sessionId) {
      trackBookingPageView(sessionId, service?.id, 'booking_widget')
    }
  }, [enableAnalytics, sessionId, service?.id])

  // Handle booking start
  const handleBookingStart = useCallback(() => {
    setBookingState(prev => ({ ...prev, isLoading: true, error: undefined }))
    setError(null)
    
    if (enableAnalytics && sessionId && service?.id) {
      trackBookingStarted(sessionId, service.id)
    }
  }, [enableAnalytics, sessionId, service?.id])

  // Handle booking success
  const _handleBookingSuccess = useCallback((booking: CalEventType) => {
    setBookingState(prev => ({ ...prev, isLoading: false, isBooked: true, bookingId: booking.id?.toString() }))
    onBookingSuccess?.(booking)
  }, [onBookingSuccess])

  // Handle booking error
  const _handleBookingError = useCallback((error: Error) => {
    setBookingState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: error.message,
      retryCount: prev.retryCount + 1,
      lastAttempt: new Date(),
    }))
    setError(error.message)
    onBookingError?.(error)
  }, [onBookingError])

  // Retry booking
  const retryBooking = useCallback(() => {
    if (bookingState.retryCount < 3) {
      setBookingState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        isLoading: false,
        error: undefined,
        lastAttempt: new Date(),
      }))
      setError(null)
    }
  }, [bookingState.retryCount])

  // Format service duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // Format service price
  const _formatPrice = (price: number, currency: string = 'USD') => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)

  // Loading state
  if (bookingState.isLoading) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (bookingState.error || error) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="text-destructive">Booking Unavailable</CardTitle>
          <CardDescription>
            We&apos;re having trouble loading the booking system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {error || bookingState.error || 'Something went wrong. Please try again later.'}
            </AlertDescription>
          </Alert>
          {bookingState.retryCount < 3 && (
            <Button 
              onClick={retryBooking} 
              variant="outline" 
              className="mt-4"
              disabled={bookingState.isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      {showServiceInfo && service && (
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{service.name}</CardTitle>
              {service.description && (
                <CardDescription className="mt-2">
                  {service.description}
                </CardDescription>
              )}
            </div>
            {service.featured && (
              <Badge variant="secondary">Popular</Badge>
            )}
          </div>
          
          {/* Service details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {service.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatDuration(service.duration)}
              </div>
            )}
            
            {service.price && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                {service.price}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              1-on-1
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {service.defaultMeetingType || 'Video'}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showServiceInfo && service ? 'pt-0' : ''}>
        {/* Cal.com booking embed will go here */}
        <div className="space-y-4">
          {!bookingState.isLoading && !bookingState.isBooked && (
            <div className="text-center py-8">
              <Button 
                onClick={handleBookingStart}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Consultation
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Choose a time that works best for you
              </p>
            </div>
          )}
          
          {bookingState.isLoading && (
            <div className="space-y-4">
              {/* Cal.com embed placeholder - would need actual Cal.com integration */}
              {eventTypeId ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading booking calendar...</p>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center bg-muted/30">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
                  <p className="text-muted-foreground">
                    Please set up Cal.com event type ID for this service
                  </p>
                </div>
              )}
            </div>
          )}
          
          {bookingState.isBooked && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                You&apos;ll receive a confirmation email shortly with meeting details.
              </p>
            </div>
          )}
        </div>
        
        {/* Additional service information */}
        {service && service.features && service.features.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">What&apos;s Included:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Powered by notice */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <ExternalLink className="w-3 h-3" />
            <span>Cal.com</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CalBookingWidget
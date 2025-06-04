/**
 * Book Consultation Page
 * 
 * Enhanced booking page with Cal.com Atoms integration,
 * service selection, and comprehensive analytics tracking.
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CalBookingWidget } from '@/components/booking/cal-booking-widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, DollarSign, Users, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/database'
import type { CalService } from '@/types/cal-types'

export const metadata: Metadata = {
  title: 'Book a Consultation | Hudson Digital Solutions',
  description: 'Schedule a free consultation to discuss your digital transformation needs. Expert guidance for web development, revenue operations, and data analytics.',
  keywords: ['consultation', 'booking', 'digital strategy', 'web development', 'revenue operations'],
  openGraph: {
    title: 'Book a Consultation | Hudson Digital Solutions',
    description: 'Schedule a free consultation to discuss your digital transformation needs.',
    type: 'website',
  },
}

// Service data with Cal.com integration
const consultationServices: CalService[] = [
  {
    id: 'free-consultation',
    name: 'Free Strategy Consultation',
    slug: 'free-consultation',
    description: 'Discover opportunities to optimize your digital presence and revenue operations. No commitment required.',
    duration: 30,
    price: 0,
    bookingCurrency: 'USD',
    calEventTypeId: parseInt(process.env.CAL_FREE_CONSULTATION_EVENT_ID || '0') || undefined,
    isActive: true,
    featured: true,
    defaultMeetingType: 'VIDEO',
    allowedMeetingTypes: ['VIDEO', 'PHONE'],
    requiresApproval: false,
    features: [
      'Digital presence assessment',
      'Revenue operations review',
      'Growth opportunity identification',
      'Technology recommendations',
      'Custom strategy roadmap',
    ],
    benefits: [
      'Expert insights from industry professionals',
      'Actionable recommendations',
      'No sales pressure',
      'Immediate value delivery',
    ],
    targetAudience: 'Business owners and decision makers looking to optimize their digital strategy',
    estimatedTimeline: '30 minutes',
    category: 'consultation',
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'deep-dive-consultation',
    name: 'Deep Dive Technical Consultation',
    slug: 'deep-dive-consultation',
    description: 'Comprehensive technical review with detailed analysis and implementation planning.',
    duration: 60,
    price: 150,
    bookingCurrency: 'USD',
    calEventTypeId: parseInt(process.env.CAL_DEEP_DIVE_EVENT_ID || '0') || undefined,
    isActive: true,
    featured: false,
    defaultMeetingType: 'VIDEO',
    allowedMeetingTypes: ['VIDEO'],
    requiresApproval: true,
    features: [
      'Comprehensive system audit',
      'Technical architecture review',
      'Implementation roadmap',
      'Budget and timeline planning',
      'Team requirement analysis',
      '1-week follow-up included',
    ],
    benefits: [
      'Detailed technical insights',
      'Clear implementation plan',
      'Risk assessment and mitigation',
      'Resource planning guidance',
    ],
    targetAudience: 'CTOs, technical leads, and businesses ready for major digital transformation',
    estimatedTimeline: '1 hour + follow-up',
    category: 'consultation',
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function getServicesFromDatabase(): Promise<CalService[]> {
  try {
    const services = await db.service.findMany({
      where: {
        isActive: true,
        calEventTypeId: {
          not: null,
        },
      },
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return services.map(service => ({
      ...service,
      price: service.price || service.startingPrice,
      bookingCurrency: service.bookingCurrency || service.currency,
      calEventTypeId: service.calEventTypeId || undefined,
      allowedMeetingTypes: service.allowedMeetingTypes || ['VIDEO'],
      defaultMeetingType: service.defaultMeetingType || 'VIDEO',
    })) as CalService[]
  } catch (error) {
    console.error('Error fetching services from database:', error)
    // Fallback to static services
    return consultationServices
  }
}

interface BookConsultationPageProps {
  searchParams: Promise<{
    service?: string
    source?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }>
}

export default async function BookConsultationPage({ searchParams }: BookConsultationPageProps) {
  const services = await getServicesFromDatabase()
  const resolvedSearchParams = await searchParams
  const selectedServiceSlug = resolvedSearchParams.service || 'free-consultation'
  const selectedService = services.find(s => s.slug === selectedServiceSlug) || services[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Schedule Your Consultation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the consultation type that best fits your needs. All meetings include expert guidance 
              and actionable recommendations for your business.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Service Selection Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Choose Your Consultation</CardTitle>
                  <CardDescription>
                    Select the option that best matches your current needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/book-consultation?service=${service.slug}`}
                      className="block"
                    >
                      <Card className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedService?.id === service.id 
                          ? 'ring-2 ring-primary shadow-md' 
                          : 'hover:border-primary/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm">{service.name}</h3>
                            {service.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration} min
                              </div>
                              <div className="flex items-center gap-1 font-semibold">
                                {service.price && service.price > 0 ? (
                                  <>
                                    <DollarSign className="w-3 h-3" />
                                    {service.price}
                                  </>
                                ) : (
                                  <span className="text-green-600">Free</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {service.defaultMeetingType === 'VIDEO' ? 'Video Call' : 
                               service.defaultMeetingType === 'PHONE' ? 'Phone Call' : 
                               'In Person'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </CardContent>
              </Card>
              
              {/* Trust indicators */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>No commitment required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Expert guidance included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Actionable recommendations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Secure & confidential</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Widget */}
            <div className="lg:col-span-2">
              <Suspense fallback={<BookingWidgetSkeleton />}>
                <CalBookingWidget
                  service={selectedService}
                  eventTypeId={selectedService?.calEventTypeId}
                  enableAnalytics={true}
                  showServiceInfo={true}
                  config={{
                    theme: 'light',
                    layout: 'month_view',
                  }}
                  onBookingSuccess={(booking) => {
                    console.log('Booking successful:', booking)
                    // Handle successful booking (analytics, redirects, etc.)
                  }}
                  onBookingError={(error) => {
                    console.error('Booking error:', error)
                    // Handle booking errors
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">What happens during the consultation?</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll discuss your current challenges, goals, and opportunities. You&apos;ll receive 
                  actionable insights and recommendations tailored to your specific situation.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is this really free?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Our strategy consultation is completely free with no hidden fees or obligations. 
                  We believe in providing value upfront.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">How should I prepare?</h3>
                <p className="text-sm text-muted-foreground">
                  Come with your questions and any relevant information about your current setup. 
                  We&apos;ll guide you through the rest.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What if I need to reschedule?</h3>
                <p className="text-sm text-muted-foreground">
                  No problem! You can reschedule up to 24 hours before your appointment using 
                  the link in your confirmation email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BookingWidgetSkeleton() {
  return (
    <Card>
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
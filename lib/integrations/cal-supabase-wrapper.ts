/**
 * Cal.com + Supabase Integration Wrapper
 * 
 * Handles Cal.com booking events and syncs them to Supabase database
 * Provides booking management and analytics integration
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '../env'
import type { ErrorContext } from '../../types/analytics-types'

// Cal.com API types
export interface CalBooking {
  id: number
  uid: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: CalAttendee[]
  organizer: CalOrganizer
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED'
  location?: string
  metadata?: ErrorContext
  created: string
  updated: string
}

export interface CalAttendee {
  email: string
  name: string
  timeZone: string
}

export interface CalOrganizer {
  email: string
  name: string
  timeZone: string
}

// Supabase booking types
export interface SupabaseBooking {
  id: string
  cal_booking_id: number
  cal_booking_uid: string
  title: string
  description?: string
  start_time: string
  end_time: string
  attendee_email: string
  attendee_name: string
  attendee_timezone: string
  organizer_email: string
  organizer_name: string
  status: string
  location?: string
  metadata?: ErrorContext
  created_at: string
  updated_at: string
}

// Cal.com API client
class CalComAPI {
  private apiKey: string
  private baseURL = 'https://api.cal.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Cal.com API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getBookings(params?: { 
    status?: string
    startTime?: string
    endTime?: string
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.startTime) searchParams.append('startTime', params.startTime)
    if (params?.endTime) searchParams.append('endTime', params.endTime)
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/bookings${query ? `?${query}` : ''}`)
  }

  async getBooking(id: number) {
    return this.request(`/bookings/${id}`)
  }

  async createBooking(bookingData: unknown) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async updateBooking(id: number, bookingData: unknown) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    })
  }

  async cancelBooking(id: number, reason?: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }
}

// Supabase client for Cal.com integration
function createCalSupabaseClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration required for Cal.com integration')
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

// Cal.com + Supabase wrapper class
export class CalSupabaseWrapper {
  private calApi: CalComAPI
  private supabase: ReturnType<typeof createCalSupabaseClient>

  constructor() {
    if (!env.CAL_COM_API_KEY) {
      throw new Error('CAL_COM_API_KEY environment variable is required')
    }

    this.calApi = new CalComAPI(env.CAL_COM_API_KEY)
    this.supabase = createCalSupabaseClient()
  }

  // Sync Cal.com booking to Supabase
  async syncBookingToSupabase(calBooking: CalBooking): Promise<SupabaseBooking | null> {
    try {
      const attendee = calBooking.attendees[0] // Primary attendee
      
      const supabaseBooking = {
        cal_booking_id: calBooking.id,
        cal_booking_uid: calBooking.uid,
        title: calBooking.title,
        description: calBooking.description,
        start_time: calBooking.startTime,
        end_time: calBooking.endTime,
        attendee_email: attendee?.email,
        attendee_name: attendee?.name,
        attendee_timezone: attendee?.timeZone,
        organizer_email: calBooking.organizer.email,
        organizer_name: calBooking.organizer.name,
        status: calBooking.status,
        location: calBooking.location,
        metadata: calBooking.metadata,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await this.supabase
        .from('bookings')
        .upsert(supabaseBooking, { 
          onConflict: 'cal_booking_id',
          ignoreDuplicates: false, 
        })
        .select()
        .single()

      if (error) {
        console.error('Error syncing booking to Supabase:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in syncBookingToSupabase:', error)
      return null
    }
  }

  // Get all bookings from Supabase
  async getBookingsFromSupabase(filters?: {
    status?: string
    startDate?: string
    endDate?: string
    attendeeEmail?: string
  }) {
    try {
      let query = this.supabase
        .from('bookings')
        .select('*')
        .order('start_time', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate)
      }
      if (filters?.attendeeEmail) {
        query = query.eq('attendee_email', filters.attendeeEmail)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bookings from Supabase:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getBookingsFromSupabase:', error)
      return []
    }
  }

  // Sync all Cal.com bookings to Supabase
  async syncAllBookings(params?: { 
    startTime?: string
    endTime?: string
    limit?: number 
  }) {
    try {
      const response = await this.calApi.getBookings(params)
      const bookings = response.bookings || []

      const syncPromises = bookings.map((booking: CalBooking) => 
        this.syncBookingToSupabase(booking),
      )

      const results = await Promise.allSettled(syncPromises)
      
      const successful = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      console.log(`Synced ${successful} bookings, ${failed} failed`)
      
      return { successful, failed, total: bookings.length }
    } catch (error) {
      console.error('Error in syncAllBookings:', error)
      throw error
    }
  }

  // Handle Cal.com webhook events
  async handleWebhook(event: unknown) {
    try {
      if (!event || typeof event !== 'object' || !('type' in event) || !('data' in event)) {
        throw new Error('Invalid webhook event format')
      }
      
      const { type, data } = event as { type: string; data: Record<string, unknown> }

      switch (type) {
        case 'BOOKING_CREATED':
        case 'BOOKING_RESCHEDULED':
        case 'BOOKING_PAID':
          await this.syncBookingToSupabase(data as unknown as CalBooking)
          break

        case 'BOOKING_CANCELLED':
          await this.handleBookingCancellation(data as unknown as CalBooking)
          break

        case 'BOOKING_REQUESTED':
          await this.handleBookingRequest(data as unknown as CalBooking)
          break

        default:
          console.log('Unhandled webhook event:', type)
      }

      return { success: true }
    } catch (error) {
      console.error('Error handling Cal.com webhook:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred', 
      }
    }
  }

  // Handle booking cancellation
  private async handleBookingCancellation(bookingData: CalBooking) {
    const { error } = await this.supabase
      .from('bookings')
      .update({ 
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('cal_booking_id', bookingData.id)

    if (error) {
      console.error('Error updating cancelled booking:', error)
    }
  }

  // Handle booking request (pending approval)
  private async handleBookingRequest(bookingData: CalBooking) {
    await this.syncBookingToSupabase({
      ...bookingData,
      status: 'PENDING',
    })
  }

  // Get booking analytics
  async getBookingAnalytics(startDate?: string, endDate?: string) {
    try {
      let query = this.supabase
        .from('bookings')
        .select('status, start_time, attendee_email')

      if (startDate) {
        query = query.gte('start_time', startDate)
      }
      if (endDate) {
        query = query.lte('start_time', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching booking analytics:', error)
        return null
      }

      const total = data?.length || 0
      const confirmed = data?.filter(b => b.status === 'ACCEPTED').length || 0
      const pending = data?.filter(b => b.status === 'PENDING').length || 0
      const cancelled = data?.filter(b => b.status === 'CANCELLED').length || 0
      const uniqueAttendees = new Set(data?.map(b => b.attendee_email)).size

      return {
        total,
        confirmed,
        pending,
        cancelled,
        uniqueAttendees,
        confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
      }
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error)
      return null
    }
  }
}

// Singleton instance
export const calSupabase = new CalSupabaseWrapper()

// Webhook handler for Next.js API routes
export async function handleCalWebhook(req: Request) {
  try {
    const body = await req.json()
    return await calSupabase.handleWebhook(body)
  } catch (error) {
    console.error('Error in Cal.com webhook handler:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
    }
  }
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          phone: string | null
          message: string | null
          source: string
          status: string
          lead_score: number
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          referrer_url: string | null
          landing_page: string | null
          ip_address: string | null
          user_agent: string | null
          consent_marketing: boolean
          consent_analytics: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          company?: string | null
          phone?: string | null
          message?: string | null
          source?: string
          status?: string
          lead_score?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          referrer_url?: string | null
          landing_page?: string | null
          ip_address?: string | null
          user_agent?: string | null
          consent_marketing?: boolean
          consent_analytics?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          company?: string | null
          phone?: string | null
          message?: string | null
          source?: string
          status?: string
          lead_score?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          referrer_url?: string | null
          landing_page?: string | null
          ip_address?: string | null
          user_agent?: string | null
          consent_marketing?: boolean
          consent_analytics?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          id: string
          lead_id: string
          type: string
          subject: string | null
          content: string | null
          email_sent_at: string | null
          email_opened_at: string | null
          email_clicked_at: string | null
          automated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          subject?: string | null
          content?: string | null
          email_sent_at?: string | null
          email_opened_at?: string | null
          email_clicked_at?: string | null
          automated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          subject?: string | null
          content?: string | null
          email_sent_at?: string | null
          email_opened_at?: string | null
          email_clicked_at?: string | null
          automated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      page_analytics: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          path: string
          title: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          country: string | null
          region: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          screen_resolution: string | null
          viewport_size: string | null
          duration_seconds: number | null
          scroll_depth_percent: number | null
          bounce: boolean
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          path: string
          title?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          screen_resolution?: string | null
          viewport_size?: string | null
          duration_seconds?: number | null
          scroll_depth_percent?: number | null
          bounce?: boolean
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          path?: string
          title?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          screen_resolution?: string | null
          viewport_size?: string | null
          duration_seconds?: number | null
          scroll_depth_percent?: number | null
          bounce?: boolean
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      web_vitals: {
        Row: {
          id: string
          session_id: string | null
          page_path: string
          metric_type: string
          value: number
          rating: string | null
          user_agent: string | null
          connection_type: string | null
          device_type: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          page_path: string
          metric_type: string
          value: number
          rating?: string | null
          user_agent?: string | null
          connection_type?: string | null
          device_type?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          page_path?: string
          metric_type?: string
          value?: number
          rating?: string | null
          user_agent?: string | null
          connection_type?: string | null
          device_type?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      custom_events: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          event_name: string
          event_category: string | null
          page_path: string | null
          properties: Json | null
          value: number | null
          user_agent: string | null
          ip_address: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          event_name: string
          event_category?: string | null
          page_path?: string | null
          properties?: Json | null
          value?: number | null
          user_agent?: string | null
          ip_address?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          event_name?: string
          event_category?: string | null
          page_path?: string | null
          properties?: Json | null
          value?: number | null
          user_agent?: string | null
          ip_address?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      conversion_funnel: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          funnel_name: string
          step_name: string
          step_order: number
          completed: boolean
          completion_time: string | null
          page_path: string | null
          properties: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          funnel_name: string
          step_name: string
          step_order: number
          completed?: boolean
          completion_time?: string | null
          page_path?: string | null
          properties?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          funnel_name?: string
          step_name?: string
          step_order?: number
          completed?: boolean
          completion_time?: string | null
          page_path?: string | null
          properties?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      ab_test_results: {
        Row: {
          id: string
          test_name: string
          variant_name: string
          user_id: string | null
          session_id: string | null
          converted: boolean
          conversion_event: string | null
          conversion_value: number | null
          properties: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          test_name: string
          variant_name: string
          user_id?: string | null
          session_id?: string | null
          converted?: boolean
          conversion_event?: string | null
          conversion_value?: number | null
          properties?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          test_name?: string
          variant_name?: string
          user_id?: string | null
          session_id?: string | null
          converted?: boolean
          conversion_event?: string | null
          conversion_value?: number | null
          properties?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          id: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms: number | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          user_agent: string | null
          ip_address: string | null
          error_message: string | null
          request_headers: Json | null
          response_headers: Json | null
          request_body: Json | null
          response_body: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms?: number | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          user_agent?: string | null
          ip_address?: string | null
          error_message?: string | null
          request_headers?: Json | null
          response_headers?: Json | null
          request_body?: Json | null
          response_body?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          endpoint?: string
          method?: string
          status_code?: number
          response_time_ms?: number | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          user_agent?: string | null
          ip_address?: string | null
          error_message?: string | null
          request_headers?: Json | null
          response_headers?: Json | null
          request_body?: Json | null
          response_body?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Convenience types for business website tables
export type Lead = Tables<'leads'>
export type LeadInsert = TablesInsert<'leads'>
export type LeadUpdate = TablesUpdate<'leads'>

export type LeadInteraction = Tables<'lead_interactions'>
export type LeadInteractionInsert = TablesInsert<'lead_interactions'>
export type LeadInteractionUpdate = TablesUpdate<'lead_interactions'>

export type PageAnalytics = Tables<'page_analytics'>
export type PageAnalyticsInsert = TablesInsert<'page_analytics'>
export type PageAnalyticsUpdate = TablesUpdate<'page_analytics'>

export type WebVitals = Tables<'web_vitals'>
export type WebVitalsInsert = TablesInsert<'web_vitals'>
export type WebVitalsUpdate = TablesUpdate<'web_vitals'>

export type CustomEvent = Tables<'custom_events'>
export type CustomEventInsert = TablesInsert<'custom_events'>
export type CustomEventUpdate = TablesUpdate<'custom_events'>

export type ConversionFunnel = Tables<'conversion_funnel'>
export type ConversionFunnelInsert = TablesInsert<'conversion_funnel'>
export type ConversionFunnelUpdate = TablesUpdate<'conversion_funnel'>

export type ABTestResult = Tables<'ab_test_results'>
export type ABTestResultInsert = TablesInsert<'ab_test_results'>
export type ABTestResultUpdate = TablesUpdate<'ab_test_results'>

export type APILog = Tables<'api_logs'>
export type APILogInsert = TablesInsert<'api_logs'>
export type APILogUpdate = TablesUpdate<'api_logs'>
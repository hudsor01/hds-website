export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          conversion_event: string | null
          conversion_value: number | null
          converted: boolean | null
          id: string
          properties: Json | null
          session_id: string | null
          test_name: string
          timestamp: string | null
          user_id: string | null
          variant_name: string
        }
        Insert: {
          conversion_event?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          id?: string
          properties?: Json | null
          session_id?: string | null
          test_name: string
          timestamp?: string | null
          user_id?: string | null
          variant_name: string
        }
        Update: {
          conversion_event?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          id?: string
          properties?: Json | null
          session_id?: string | null
          test_name?: string
          timestamp?: string | null
          user_id?: string | null
          variant_name?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          request_body: Json | null
          request_headers: Json | null
          request_size_bytes: number | null
          response_body: Json | null
          response_headers: Json | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_body?: Json | null
          request_headers?: Json | null
          request_size_bytes?: number | null
          response_body?: Json | null
          response_headers?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_body?: Json | null
          request_headers?: Json | null
          request_size_bytes?: number | null
          response_body?: Json | null
          response_headers?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      conversion_funnel: {
        Row: {
          completed: boolean | null
          completion_time: string | null
          funnel_name: string
          id: string
          page_path: string | null
          properties: Json | null
          session_id: string
          step_name: string
          step_order: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completion_time?: string | null
          funnel_name: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id: string
          step_name: string
          step_order: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completion_time?: string | null
          funnel_name?: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string
          step_name?: string
          step_order?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_events: {
        Row: {
          event_category: string | null
          event_name: string
          id: string
          ip_address: unknown | null
          page_path: string | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          event_category?: string | null
          event_name: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          event_category?: string | null
          event_name?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          automated: boolean | null
          content: string | null
          created_at: string | null
          email_clicked_at: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          id: string
          lead_id: string | null
          subject: string | null
          type: string
        }
        Insert: {
          automated?: boolean | null
          content?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          subject?: string | null
          type: string
        }
        Update: {
          automated?: boolean | null
          content?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          lead_id?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          consent_analytics: boolean | null
          consent_marketing: boolean | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown | null
          landing_page: string | null
          lead_score: number | null
          message: string | null
          name: string | null
          phone: string | null
          referrer_url: string | null
          source: string
          status: string
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          lead_score?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          referrer_url?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          lead_score?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          referrer_url?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          bounce: boolean | null
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: unknown | null
          os: string | null
          path: string
          referrer: string | null
          region: string | null
          screen_resolution: string | null
          scroll_depth_percent: number | null
          session_id: string | null
          timestamp: string | null
          title: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          viewport_size: string | null
        }
        Insert: {
          bounce?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          path: string
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          scroll_depth_percent?: number | null
          session_id?: string | null
          timestamp?: string | null
          title?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_size?: string | null
        }
        Update: {
          bounce?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          path?: string
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          scroll_depth_percent?: number | null
          session_id?: string | null
          timestamp?: string | null
          title?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_size?: string | null
        }
        Relationships: []
      }
      web_vitals: {
        Row: {
          connection_type: string | null
          device_type: string | null
          id: string
          metric_type: string
          page_path: string
          rating: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          value: number
        }
        Insert: {
          connection_type?: string | null
          device_type?: string | null
          id?: string
          metric_type: string
          page_path: string
          rating?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          value: number
        }
        Update: {
          connection_type?: string | null
          device_type?: string | null
          id?: string
          metric_type?: string
          page_path?: string
          rating?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enqueue_log_processing: {
        Args: {
          log_data: Record<string, unknown>
        }
        Returns: void
      }
      graphql: {
        Args: {
          query: string
          variables?: Record<string, unknown>
        }
        Returns: Json
      }
      trigger_webhook: {
        Args: {
          event_type: string
          payload: Record<string, unknown>
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

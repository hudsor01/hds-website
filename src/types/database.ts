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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      calculator_leads: {
        Row: {
          calculator_type: string
          company: string | null
          contacted: boolean
          contacted_at: string | null
          conversion_value: number | null
          converted: boolean
          converted_at: string | null
          created_at: string
          email: string
          id: string
          inputs: Json
          ip_address: unknown
          landing_page: string | null
          lead_quality: string | null
          lead_score: number | null
          name: string | null
          notes: string | null
          phone: string | null
          referrer: string | null
          results: Json
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          calculator_type: string
          company?: string | null
          contacted?: boolean
          contacted_at?: string | null
          conversion_value?: number | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          inputs?: Json
          ip_address?: unknown
          landing_page?: string | null
          lead_quality?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          results?: Json
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          calculator_type?: string
          company?: string | null
          contacted?: boolean
          contacted_at?: string | null
          conversion_value?: number | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          inputs?: Json
          ip_address?: unknown
          landing_page?: string | null
          lead_quality?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          results?: Json
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          challenge: string
          client_name: string
          created_at: string | null
          description: string
          featured: boolean | null
          featured_image_url: string | null
          id: string
          industry: string
          metrics: Json | null
          project_duration: string | null
          project_type: string
          project_url: string | null
          published: boolean | null
          results: string
          slug: string
          solution: string
          team_size: number | null
          technologies: Json | null
          testimonial_author: string | null
          testimonial_role: string | null
          testimonial_text: string | null
          testimonial_video_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge: string
          client_name: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          industry: string
          metrics?: Json | null
          project_duration?: string | null
          project_type: string
          project_url?: string | null
          published?: boolean | null
          results: string
          slug: string
          solution: string
          team_size?: number | null
          technologies?: Json | null
          testimonial_author?: string | null
          testimonial_role?: string | null
          testimonial_text?: string | null
          testimonial_video_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge?: string
          client_name?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          industry?: string
          metrics?: Json | null
          project_duration?: string | null
          project_type?: string
          project_url?: string | null
          published?: boolean | null
          results?: string
          slug?: string
          solution?: string
          team_size?: number | null
          technologies?: Json | null
          testimonial_author?: string | null
          testimonial_role?: string | null
          testimonial_text?: string | null
          testimonial_video_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversion_funnel: {
        Row: {
          completed: boolean | null
          completion_time: string | null
          funnel_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          properties: Json | null
          session_id: string
          step_name: string
          step_order: number
          time_to_complete: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completion_time?: string | null
          funnel_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          properties?: Json | null
          session_id: string
          step_name: string
          step_order: number
          time_to_complete?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completion_time?: string | null
          funnel_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          properties?: Json | null
          session_id?: string
          step_name?: string
          step_order?: number
          time_to_complete?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cron_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          job_name: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          status?: string
        }
        Relationships: []
      }
      custom_events: {
        Row: {
          event_category: string | null
          event_label: string | null
          event_name: string
          event_value: number | null
          id: string
          ip_address: unknown
          metadata: Json | null
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
          event_label?: string | null
          event_name: string
          event_value?: number | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
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
          event_label?: string | null
          event_name?: string
          event_value?: number | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
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
      email_engagement: {
        Row: {
          created_at: string
          email: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          link_url: string | null
          message_id: string | null
          sequence_id: string
          step_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          link_url?: string | null
          message_id?: string | null
          sequence_id: string
          step_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          link_url?: string | null
          message_id?: string | null
          sequence_id?: string
          step_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          id: string
          created_at: string
          level: string
          error_type: string
          fingerprint: string
          message: string
          stack_trace: string | null
          url: string | null
          method: string | null
          route: string | null
          request_id: string | null
          user_id: string | null
          user_email: string | null
          environment: string
          vercel_region: string | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          level: string
          error_type: string
          fingerprint: string
          message: string
          stack_trace?: string | null
          url?: string | null
          method?: string | null
          route?: string | null
          request_id?: string | null
          user_id?: string | null
          user_email?: string | null
          environment?: string
          vercel_region?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          level?: string
          error_type?: string
          fingerprint?: string
          message?: string
          stack_trace?: string | null
          url?: string | null
          method?: string | null
          route?: string | null
          request_id?: string | null
          user_id?: string | null
          user_email?: string | null
          environment?: string
          vercel_region?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      faq_interactions: {
        Row: {
          action: string
          created_at: string
          faq_category: string | null
          faq_id: string
          id: string
          page_url: string | null
          question_text: string
          search_query: string | null
          session_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          faq_category?: string | null
          faq_id: string
          id?: string
          page_url?: string | null
          question_text: string
          search_query?: string | null
          session_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          faq_category?: string | null
          faq_id?: string
          id?: string
          page_url?: string | null
          question_text?: string
          search_query?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          order_index: number | null
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_attribution: {
        Row: {
          browser: string | null
          campaign: string | null
          content: string | null
          conversion_type: string | null
          conversion_value: number | null
          converted: boolean
          converted_at: string | null
          current_page: string | null
          device_type: string | null
          email: string
          first_visit_at: string
          id: string
          landing_page: string
          last_visit_at: string
          lead_id: string | null
          medium: string | null
          os: string | null
          referrer: string | null
          session_id: string | null
          source: string | null
          term: string | null
          time_to_conversion: unknown
          utm_params: Json | null
          visit_count: number | null
        }
        Insert: {
          browser?: string | null
          campaign?: string | null
          content?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          converted?: boolean
          converted_at?: string | null
          current_page?: string | null
          device_type?: string | null
          email: string
          first_visit_at?: string
          id?: string
          landing_page: string
          last_visit_at?: string
          lead_id?: string | null
          medium?: string | null
          os?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          term?: string | null
          time_to_conversion?: unknown
          utm_params?: Json | null
          visit_count?: number | null
        }
        Update: {
          browser?: string | null
          campaign?: string | null
          content?: string | null
          conversion_type?: string | null
          conversion_value?: number | null
          converted?: boolean
          converted_at?: string | null
          current_page?: string | null
          device_type?: string | null
          email?: string
          first_visit_at?: string
          id?: string
          landing_page?: string
          last_visit_at?: string
          lead_id?: string | null
          medium?: string | null
          os?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          term?: string | null
          time_to_conversion?: unknown
          utm_params?: Json | null
          visit_count?: number | null
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
      lead_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          metadata: Json | null
          note_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          note_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          note_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "calculator_leads"
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      location_pages: {
        Row: {
          city: string
          content: Json | null
          country: string
          created_at: string
          featured: boolean
          hero_text: string | null
          id: string
          latitude: number | null
          lead_count: number
          local_case_studies: string[] | null
          local_testimonials: string[] | null
          longitude: number | null
          meta_description: string | null
          og_image_url: string | null
          published: boolean
          published_at: string | null
          schema_markup: Json | null
          service_areas: string[] | null
          slug: string
          state: string | null
          title: string
          updated_at: string
          view_count: number
          zip_code: string | null
        }
        Insert: {
          city: string
          content?: Json | null
          country?: string
          created_at?: string
          featured?: boolean
          hero_text?: string | null
          id?: string
          latitude?: number | null
          lead_count?: number
          local_case_studies?: string[] | null
          local_testimonials?: string[] | null
          longitude?: number | null
          meta_description?: string | null
          og_image_url?: string | null
          published?: boolean
          published_at?: string | null
          schema_markup?: Json | null
          service_areas?: string[] | null
          slug: string
          state?: string | null
          title: string
          updated_at?: string
          view_count?: number
          zip_code?: string | null
        }
        Update: {
          city?: string
          content?: Json | null
          country?: string
          created_at?: string
          featured?: boolean
          hero_text?: string | null
          id?: string
          latitude?: number | null
          lead_count?: number
          local_case_studies?: string[] | null
          local_testimonials?: string[] | null
          longitude?: number | null
          meta_description?: string | null
          og_image_url?: string | null
          published?: boolean
          published_at?: string | null
          schema_markup?: Json | null
          service_areas?: string[] | null
          slug?: string
          state?: string | null
          title?: string
          updated_at?: string
          view_count?: number
          zip_code?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
          status: string
          subscribed_at: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
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
          duration: number | null
          duration_seconds: number | null
          id: string
          ip_address: unknown
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
          duration?: number | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
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
          duration?: number | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
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
      processing_queue: {
        Row: {
          created_at: string | null
          data: Json
          id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          case_study_url: string | null
          category: string
          challenges: string[] | null
          created_at: string
          description: string
          display_order: number
          external_link: string | null
          featured: boolean
          gallery_images: string[] | null
          github_link: string | null
          gradient_class: string
          id: string
          image_url: string
          industry: string | null
          long_description: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          project_duration: string | null
          published: boolean
          published_at: string | null
          results_metrics: Json | null
          slug: string
          solutions: string[] | null
          stats: Json
          team_size: number | null
          tech_stack: string[]
          technologies: string[] | null
          testimonial_author: string | null
          testimonial_author_title: string | null
          testimonial_text: string | null
          testimonial_video_url: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          case_study_url?: string | null
          category: string
          challenges?: string[] | null
          created_at?: string
          description: string
          display_order?: number
          external_link?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          github_link?: string | null
          gradient_class?: string
          id?: string
          image_url: string
          industry?: string | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_duration?: string | null
          published?: boolean
          published_at?: string | null
          results_metrics?: Json | null
          slug: string
          solutions?: string[] | null
          stats?: Json
          team_size?: number | null
          tech_stack?: string[]
          technologies?: string[] | null
          testimonial_author?: string | null
          testimonial_author_title?: string | null
          testimonial_text?: string | null
          testimonial_video_url?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          case_study_url?: string | null
          category?: string
          challenges?: string[] | null
          created_at?: string
          description?: string
          display_order?: number
          external_link?: string | null
          featured?: boolean
          gallery_images?: string[] | null
          github_link?: string | null
          gradient_class?: string
          id?: string
          image_url?: string
          industry?: string | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_duration?: string | null
          published?: boolean
          published_at?: string | null
          results_metrics?: Json | null
          slug?: string
          solutions?: string[] | null
          stats?: Json
          team_size?: number | null
          tech_stack?: string[]
          technologies?: string[] | null
          testimonial_author?: string | null
          testimonial_author_title?: string | null
          testimonial_text?: string | null
          testimonial_video_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          created_at: string
          error: string | null
          id: string
          max_retries: number
          recipient_email: string
          recipient_name: string
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          sequence_id: string
          status: string
          step_id: string
          variables: Json
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          max_retries?: number
          recipient_email: string
          recipient_name: string
          retry_count?: number
          scheduled_for: string
          sent_at?: string | null
          sequence_id: string
          status?: string
          step_id: string
          variables?: Json
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          max_retries?: number
          recipient_email?: string
          recipient_name?: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string
          status?: string
          step_id?: string
          variables?: Json
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      testimonial_requests: {
        Row: {
          client_email: string | null
          client_name: string
          created_at: string | null
          expires_at: string | null
          id: string
          project_name: string | null
          submitted: boolean | null
          submitted_at: string | null
          token: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          project_name?: string | null
          submitted?: boolean | null
          submitted_at?: string | null
          token: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          project_name?: string | null
          submitted?: boolean | null
          submitted_at?: string | null
          token?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean | null
          client_name: string
          company: string | null
          content: string
          created_at: string | null
          featured: boolean | null
          id: string
          photo_url: string | null
          rating: number
          request_id: string | null
          role: string | null
          service_type: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          client_name: string
          company?: string | null
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          photo_url?: string | null
          rating: number
          request_id?: string | null
          role?: string | null
          service_type?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          client_name?: string
          company?: string | null
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          photo_url?: string | null
          rating?: number
          request_id?: string | null
          role?: string | null
          service_type?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "testimonial_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ttl_calculations: {
        Row: {
          county: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          inputs: Json
          last_viewed_at: string | null
          name: string | null
          purchase_price: number | null
          results: Json
          share_code: string
          view_count: number | null
        }
        Insert: {
          county?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          inputs: Json
          last_viewed_at?: string | null
          name?: string | null
          purchase_price?: number | null
          results: Json
          share_code: string
          view_count?: number | null
        }
        Update: {
          county?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          inputs?: Json
          last_viewed_at?: string | null
          name?: string | null
          purchase_price?: number | null
          results?: Json
          share_code?: string
          view_count?: number | null
        }
        Relationships: []
      }
      web_vitals: {
        Row: {
          connection_type: string | null
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
      webhook_logs: {
        Row: {
          event_type: string
          id: string
          payload: Json
          triggered_at: string | null
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          triggered_at?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          triggered_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      email_sequence_performance: {
        Row: {
          click_through_rate: number | null
          open_rate: number | null
          sequence_id: string | null
          total_sent: number | null
          unique_clicks: number | null
          unique_opens: number | null
          unsubscribes: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      hypopg_hidden_indexes: {
        Row: {
          am_name: unknown
          index_name: unknown
          indexrelid: unknown
          is_hypo: boolean | null
          schema_name: unknown
          table_name: unknown
        }
        Relationships: []
      }
      hypopg_list_indexes: {
        Row: {
          am_name: unknown
          index_name: string | null
          indexrelid: unknown
          schema_name: unknown
          table_name: unknown
        }
        Relationships: []
      }
      lead_funnel_by_source: {
        Row: {
          calculator_completions: number | null
          calculator_conversion_rate: number | null
          conversions: number | null
          overall_conversion_rate: number | null
          source: string | null
          total_visits: number | null
        }
        Relationships: []
      }
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown
          fk_schema_name: unknown
          fk_table_name: unknown
          fk_table_oid: unknown
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown
          pk_index_name: unknown
          pk_schema_name: unknown
          pk_table_name: unknown
          pk_table_oid: unknown
        }
        Relationships: []
      }
      pg_stat_monitor: {
        Row: {
          application_name: string | null
          bucket: number | null
          bucket_done: boolean | null
          bucket_start_time: string | null
          calls: number | null
          client_ip: unknown
          cmd_type: number | null
          cmd_type_text: string | null
          comments: string | null
          cpu_sys_time: number | null
          cpu_user_time: number | null
          datname: string | null
          dbid: unknown
          elevel: number | null
          jit_deform_count: number | null
          jit_deform_time: number | null
          jit_emission_count: number | null
          jit_emission_time: number | null
          jit_functions: number | null
          jit_generation_time: number | null
          jit_inlining_count: number | null
          jit_inlining_time: number | null
          jit_optimization_count: number | null
          jit_optimization_time: number | null
          local_blk_read_time: number | null
          local_blk_write_time: number | null
          local_blks_dirtied: number | null
          local_blks_hit: number | null
          local_blks_read: number | null
          local_blks_written: number | null
          max_exec_time: number | null
          max_plan_time: number | null
          mean_exec_time: number | null
          mean_plan_time: number | null
          message: string | null
          min_exec_time: number | null
          min_plan_time: number | null
          minmax_stats_since: string | null
          pgsm_query_id: number | null
          planid: number | null
          plans: number | null
          query: string | null
          query_plan: string | null
          queryid: number | null
          relations: string[] | null
          resp_calls: string[] | null
          rows: number | null
          shared_blk_read_time: number | null
          shared_blk_write_time: number | null
          shared_blks_dirtied: number | null
          shared_blks_hit: number | null
          shared_blks_read: number | null
          shared_blks_written: number | null
          sqlcode: string | null
          stats_since: string | null
          stddev_exec_time: number | null
          stddev_plan_time: number | null
          temp_blk_read_time: number | null
          temp_blk_write_time: number | null
          temp_blks_read: number | null
          temp_blks_written: number | null
          top_query: string | null
          top_queryid: number | null
          toplevel: boolean | null
          total_exec_time: number | null
          total_plan_time: number | null
          userid: unknown
          username: string | null
          wal_bytes: number | null
          wal_fpi: number | null
          wal_records: number | null
        }
        Relationships: []
      }
      raster_columns: {
        Row: {
          blocksize_x: number | null
          blocksize_y: number | null
          extent: unknown
          nodata_values: number[] | null
          num_bands: number | null
          out_db: boolean[] | null
          pixel_types: string[] | null
          r_raster_column: unknown
          r_table_catalog: unknown
          r_table_name: unknown
          r_table_schema: unknown
          regular_blocking: boolean | null
          same_alignment: boolean | null
          scale_x: number | null
          scale_y: number | null
          spatial_index: boolean | null
          srid: number | null
        }
        Relationships: []
      }
      raster_overviews: {
        Row: {
          o_raster_column: unknown
          o_table_catalog: unknown
          o_table_name: unknown
          o_table_schema: unknown
          overview_factor: number | null
          r_raster_column: unknown
          r_table_catalog: unknown
          r_table_name: unknown
          r_table_schema: unknown
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown
          langoid: unknown
          name: unknown
          oid: unknown
          owner: unknown
          returns: string | null
          returns_set: boolean | null
          schema: unknown
          volatility: string | null
        }
        Relationships: []
      }
      top_performing_faqs: {
        Row: {
          expansions: number | null
          faq_category: string | null
          faq_id: string | null
          helpful_no: number | null
          helpful_yes: number | null
          helpfulness_score: number | null
          question_text: string | null
          total_interactions: number | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      __st_countagg_transfn: {
        Args: {
          agg: Database["public"]["CompositeTypes"]["agg_count"]
          exclude_nodata_value?: boolean
          nband?: number
          rast: unknown
          sample_percent?: number
        }
        Returns: Database["public"]["CompositeTypes"]["agg_count"]
        SetofOptions: {
          from: "*"
          to: "agg_count"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _add_overview_constraint: {
        Args: {
          factor: number
          ovcolumn: unknown
          ovschema: unknown
          ovtable: unknown
          refcolumn: unknown
          refschema: unknown
          reftable: unknown
        }
        Returns: boolean
      }
      _add_raster_constraint: {
        Args: { cn: unknown; sql: string }
        Returns: boolean
      }
      _add_raster_constraint_alignment: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_blocksize: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: boolean
      }
      _add_raster_constraint_coverage_tile: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_extent: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_nodata_values: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_num_bands: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_out_db: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_pixel_types: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_scale: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: boolean
      }
      _add_raster_constraint_spatially_unique: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _add_raster_constraint_srid: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _cleanup: { Args: never; Returns: boolean }
      _contract_on: { Args: { "": string }; Returns: unknown }
      _currtest: { Args: never; Returns: number }
      _db_privs: { Args: never; Returns: unknown[] }
      _drop_overview_constraint: {
        Args: { ovcolumn: unknown; ovschema: unknown; ovtable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint: {
        Args: { cn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_alignment: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_blocksize: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: boolean
      }
      _drop_raster_constraint_coverage_tile: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_extent: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_nodata_values: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_num_bands: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_out_db: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_pixel_types: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_regular_blocking: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_scale: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: boolean
      }
      _drop_raster_constraint_spatially_unique: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _drop_raster_constraint_srid: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _extensions: { Args: never; Returns: unknown[] }
      _get: { Args: { "": string }; Returns: number }
      _get_latest: { Args: { "": string }; Returns: number[] }
      _get_note: { Args: { "": string }; Returns: string }
      _is_verbose: { Args: never; Returns: boolean }
      _overview_constraint: {
        Args: {
          factor: number
          ov: unknown
          refcolumn: unknown
          refschema: unknown
          reftable: unknown
        }
        Returns: boolean
      }
      _overview_constraint_info: {
        Args: { ovcolumn: unknown; ovschema: unknown; ovtable: unknown }
        Returns: Record<string, unknown>
      }
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _prokind: { Args: { p_oid: unknown }; Returns: unknown }
      _query: { Args: { "": string }; Returns: string }
      _raster_constraint_info_alignment: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _raster_constraint_info_blocksize: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: number
      }
      _raster_constraint_info_coverage_tile: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _raster_constraint_info_extent: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: unknown
      }
      _raster_constraint_info_index: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _raster_constraint_info_nodata_values: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: number[]
      }
      _raster_constraint_info_num_bands: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: number
      }
      _raster_constraint_info_out_db: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean[]
      }
      _raster_constraint_info_pixel_types: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: string[]
      }
      _raster_constraint_info_regular_blocking: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _raster_constraint_info_scale: {
        Args: {
          axis: string
          rastcolumn: unknown
          rastschema: unknown
          rasttable: unknown
        }
        Returns: number
      }
      _raster_constraint_info_spatially_unique: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: boolean
      }
      _raster_constraint_info_srid: {
        Args: { rastcolumn: unknown; rastschema: unknown; rasttable: unknown }
        Returns: number
      }
      _raster_constraint_nodata_values: {
        Args: { rast: unknown }
        Returns: number[]
      }
      _raster_constraint_out_db: { Args: { rast: unknown }; Returns: boolean[] }
      _raster_constraint_pixel_types: {
        Args: { rast: unknown }
        Returns: string[]
      }
      _refine_vol: { Args: { "": string }; Returns: string }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_aspect4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_asraster: {
        Args: {
          geom: unknown
          gridx?: number
          gridy?: number
          height?: number
          nodataval?: number[]
          pixeltype?: string[]
          scalex?: number
          scaley?: number
          skewx?: number
          skewy?: number
          touched?: boolean
          upperleftx?: number
          upperlefty?: number
          value?: number[]
          width?: number
        }
        Returns: unknown
      }
      _st_clip: {
        Args: {
          crop?: boolean
          geom: unknown
          nband: number[]
          nodataval?: number[]
          rast: unknown
        }
        Returns: unknown
      }
      _st_colormap: {
        Args: {
          colormap: string
          method?: string
          nband: number
          rast: unknown
        }
        Returns: unknown
      }
      _st_contains:
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_containsproperly:
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_convertarray4ma: { Args: { value: number[] }; Returns: number[] }
      _st_count: {
        Args: {
          exclude_nodata_value?: boolean
          nband?: number
          rast: unknown
          sample_percent?: number
        }
        Returns: number
      }
      _st_countagg_finalfn: {
        Args: { agg: Database["public"]["CompositeTypes"]["agg_count"] }
        Returns: number
      }
      _st_countagg_transfn:
        | {
            Args: {
              agg: Database["public"]["CompositeTypes"]["agg_count"]
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
              sample_percent: number
            }
            Returns: Database["public"]["CompositeTypes"]["agg_count"]
            SetofOptions: {
              from: "*"
              to: "agg_count"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              agg: Database["public"]["CompositeTypes"]["agg_count"]
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
            }
            Returns: Database["public"]["CompositeTypes"]["agg_count"]
            SetofOptions: {
              from: "*"
              to: "agg_count"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              agg: Database["public"]["CompositeTypes"]["agg_count"]
              exclude_nodata_value: boolean
              rast: unknown
            }
            Returns: Database["public"]["CompositeTypes"]["agg_count"]
            SetofOptions: {
              from: "*"
              to: "agg_count"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      _st_coveredby:
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dfullywithin: {
        Args: {
          distance: number
          nband1: number
          nband2: number
          rast1: unknown
          rast2: unknown
        }
        Returns: boolean
      }
      _st_dwithin:
        | {
            Args: {
              distance: number
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geog1: unknown
              geog2: unknown
              tolerance: number
              use_spheroid?: boolean
            }
            Returns: boolean
          }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_gdalwarp: {
        Args: {
          algorithm?: string
          gridx?: number
          gridy?: number
          height?: number
          maxerr?: number
          rast: unknown
          scalex?: number
          scaley?: number
          skewx?: number
          skewy?: number
          srid?: number
          width?: number
        }
        Returns: unknown
      }
      _st_grayscale4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_hillshade4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_histogram: {
        Args: {
          bins?: number
          exclude_nodata_value?: boolean
          max?: number
          min?: number
          nband?: number
          rast: unknown
          right?: boolean
          sample_percent?: number
          width?: number[]
        }
        Returns: Record<string, unknown>[]
      }
      _st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | {
            Args: { geom: unknown; nband?: number; rast: unknown }
            Returns: boolean
          }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_mapalgebra:
        | {
            Args: {
              expression: string
              extenttype?: string
              nodata1expr?: string
              nodata2expr?: string
              nodatanodataval?: number
              pixeltype?: string
              rastbandargset: Database["public"]["CompositeTypes"]["rastbandarg"][]
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              distancex?: number
              distancey?: number
              extenttype?: string
              mask?: number[]
              pixeltype?: string
              rastbandargset: Database["public"]["CompositeTypes"]["rastbandarg"][]
              userargs?: string[]
              weighted?: boolean
            }
            Returns: unknown
          }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_neighborhood: {
        Args: {
          band: number
          columnx: number
          distancex: number
          distancey: number
          exclude_nodata_value?: boolean
          rast: unknown
          rowy: number
        }
        Returns: number[]
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps:
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_pixelascentroids: {
        Args: {
          band?: number
          columnx?: number
          exclude_nodata_value?: boolean
          rast: unknown
          rowy?: number
        }
        Returns: {
          geom: unknown
          val: number
          x: number
          y: number
        }[]
      }
      _st_pixelaspolygons: {
        Args: {
          band?: number
          columnx?: number
          exclude_nodata_value?: boolean
          rast: unknown
          rowy?: number
        }
        Returns: {
          geom: unknown
          val: number
          x: number
          y: number
        }[]
      }
      _st_quantile: {
        Args: {
          exclude_nodata_value?: boolean
          nband?: number
          quantiles?: number[]
          rast: unknown
          sample_percent?: number
        }
        Returns: Record<string, unknown>[]
      }
      _st_rastertoworldcoord: {
        Args: { columnx?: number; rast: unknown; rowy?: number }
        Returns: Record<string, unknown>
      }
      _st_reclass: {
        Args: {
          rast: unknown
          reclassargset: Database["public"]["CompositeTypes"]["reclassarg"][]
        }
        Returns: unknown
      }
      _st_roughness4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_samealignment_finalfn: {
        Args: { agg: Database["public"]["CompositeTypes"]["agg_samealignment"] }
        Returns: boolean
      }
      _st_samealignment_transfn: {
        Args: {
          agg: Database["public"]["CompositeTypes"]["agg_samealignment"]
          rast: unknown
        }
        Returns: Database["public"]["CompositeTypes"]["agg_samealignment"]
        SetofOptions: {
          from: "*"
          to: "agg_samealignment"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _st_setvalues: {
        Args: {
          hasnosetvalue?: boolean
          keepnodata?: boolean
          nband: number
          newvalueset: number[]
          noset?: boolean[]
          nosetvalue?: number
          rast: unknown
          x: number
          y: number
        }
        Returns: unknown
      }
      _st_slope4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_summarystats: {
        Args: {
          exclude_nodata_value?: boolean
          nband?: number
          rast: unknown
          sample_percent?: number
        }
        Returns: Database["public"]["CompositeTypes"]["summarystats"]
        SetofOptions: {
          from: "*"
          to: "summarystats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _st_tile: {
        Args: {
          height: number
          nband?: number[]
          nodataval?: number
          padwithnodata?: boolean
          rast: unknown
          width: number
        }
        Returns: unknown[]
      }
      _st_touches:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      _st_tpi4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_tri4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      _st_valuecount:
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      _st_worldtorastercoord: {
        Args: { latitude?: number; longitude?: number; rast: unknown }
        Returns: Record<string, unknown>
      }
      _table_privs: { Args: never; Returns: unknown[] }
      _temptypes: { Args: { "": string }; Returns: string }
      _todo: { Args: never; Returns: string }
      _updaterastersrid: {
        Args: {
          column_name: unknown
          new_srid: number
          schema_name: unknown
          table_name: unknown
        }
        Returns: boolean
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      addoverviewconstraints:
        | {
            Args: {
              ovcolumn: unknown
              ovfactor: number
              ovtable: unknown
              refcolumn: unknown
              reftable: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              ovcolumn: unknown
              ovfactor: number
              ovschema: unknown
              ovtable: unknown
              refcolumn: unknown
              refschema: unknown
              reftable: unknown
            }
            Returns: boolean
          }
      addrasterconstraints:
        | {
            Args: {
              constraints: string[]
              rastcolumn: unknown
              rasttable: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              blocksize_x?: boolean
              blocksize_y?: boolean
              extent?: boolean
              nodata_values?: boolean
              num_bands?: boolean
              out_db?: boolean
              pixel_types?: boolean
              rastcolumn: unknown
              rasttable: unknown
              regular_blocking?: boolean
              same_alignment?: boolean
              scale_x?: boolean
              scale_y?: boolean
              srid?: boolean
            }
            Returns: boolean
          }
        | {
            Args: {
              constraints: string[]
              rastcolumn: unknown
              rastschema: unknown
              rasttable: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              blocksize_x?: boolean
              blocksize_y?: boolean
              extent?: boolean
              nodata_values?: boolean
              num_bands?: boolean
              out_db?: boolean
              pixel_types?: boolean
              rastcolumn: unknown
              rastschema: unknown
              rasttable: unknown
              regular_blocking?: boolean
              same_alignment?: boolean
              scale_x?: boolean
              scale_y?: boolean
              srid?: boolean
            }
            Returns: boolean
          }
      autoprewarm_dump_now: { Args: never; Returns: number }
      autoprewarm_start_worker: { Args: never; Returns: undefined }
      cleanup_expired_ttl_calculations: { Args: never; Returns: number }
      col_is_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
      col_not_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
      crosstab: { Args: { "": string }; Returns: Record<string, unknown>[] }
      crosstab2: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_2"][]
        SetofOptions: {
          from: "*"
          to: "tablefunc_crosstab_2"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      crosstab3: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_3"][]
        SetofOptions: {
          from: "*"
          to: "tablefunc_crosstab_3"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      crosstab4: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_4"][]
        SetofOptions: {
          from: "*"
          to: "tablefunc_crosstab_4"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      daitch_mokotoff: { Args: { "": string }; Returns: string[] }
      decode_error_level: { Args: { elevel: number }; Returns: string }
      diag:
        | {
            Args: { msg: unknown }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { msg: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      diag_test_name: { Args: { "": string }; Returns: string }
      disablelongtransactions: { Args: never; Returns: string }
      dmetaphone: { Args: { "": string }; Returns: string }
      dmetaphone_alt: { Args: { "": string }; Returns: string }
      do_tap:
        | { Args: { "": string }; Returns: string[] }
        | { Args: never; Returns: string[] }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropoverviewconstraints:
        | { Args: { ovcolumn: unknown; ovtable: unknown }; Returns: boolean }
        | {
            Args: { ovcolumn: unknown; ovschema: unknown; ovtable: unknown }
            Returns: boolean
          }
      droprasterconstraints:
        | {
            Args: {
              blocksize_x?: boolean
              blocksize_y?: boolean
              extent?: boolean
              nodata_values?: boolean
              num_bands?: boolean
              out_db?: boolean
              pixel_types?: boolean
              rastcolumn: unknown
              rasttable: unknown
              regular_blocking?: boolean
              same_alignment?: boolean
              scale_x?: boolean
              scale_y?: boolean
              srid?: boolean
            }
            Returns: boolean
          }
        | {
            Args: {
              constraints: string[]
              rastcolumn: unknown
              rasttable: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              constraints: string[]
              rastcolumn: unknown
              rastschema: unknown
              rasttable: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              blocksize_x?: boolean
              blocksize_y?: boolean
              extent?: boolean
              nodata_values?: boolean
              num_bands?: boolean
              out_db?: boolean
              pixel_types?: boolean
              rastcolumn: unknown
              rastschema: unknown
              rasttable: unknown
              regular_blocking?: boolean
              same_alignment?: boolean
              scale_x?: boolean
              scale_y?: boolean
              srid?: boolean
            }
            Returns: boolean
          }
      each: { Args: { hs: unknown }; Returns: Record<string, unknown>[] }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      fail:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      findfuncs: { Args: { "": string }; Returns: string[] }
      finish: { Args: { exception_on_failure?: boolean }; Returns: string[] }
      generate_share_code: { Args: never; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_cmd_type: { Args: { cmd_type: number }; Returns: string }
      get_histogram_timings: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      has_unique: { Args: { "": string }; Returns: string }
      histogram: {
        Args: { _bucket: number; _quryid: number }
        Returns: Record<string, unknown>[]
      }
      hypopg: { Args: never; Returns: Record<string, unknown>[] }
      hypopg_create_index: {
        Args: { sql_order: string }
        Returns: Record<string, unknown>[]
      }
      hypopg_drop_index: { Args: { indexid: unknown }; Returns: boolean }
      hypopg_get_indexdef: { Args: { indexid: unknown }; Returns: string }
      hypopg_hidden_indexes: {
        Args: never
        Returns: {
          indexid: unknown
        }[]
      }
      hypopg_hide_index: { Args: { indexid: unknown }; Returns: boolean }
      hypopg_relation_size: { Args: { indexid: unknown }; Returns: number }
      hypopg_reset: { Args: never; Returns: undefined }
      hypopg_reset_index: { Args: never; Returns: undefined }
      hypopg_unhide_all_indexes: { Args: never; Returns: undefined }
      hypopg_unhide_index: { Args: { indexid: unknown }; Returns: boolean }
      in_todo: { Args: never; Returns: boolean }
      index_advisor: {
        Args: { query: string }
        Returns: {
          errors: string[]
          index_statements: string[]
          startup_cost_after: Json
          startup_cost_before: Json
          total_cost_after: Json
          total_cost_before: Json
        }[]
      }
      is_empty: { Args: { "": string }; Returns: string }
      isnt_empty: { Args: { "": string }; Returns: string }
      json_matches_schema: {
        Args: { instance: Json; schema: Json }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: { instance: Json; schema: Json }
        Returns: boolean
      }
      jsonschema_is_valid: { Args: { schema: Json }; Returns: boolean }
      jsonschema_validation_errors: {
        Args: { instance: Json; schema: Json }
        Returns: string[]
      }
      lives_ok: { Args: { "": string }; Returns: string }
      longtransactionsenabled: { Args: never; Returns: boolean }
      no_plan: { Args: never; Returns: boolean[] }
      num_failed: { Args: never; Returns: number }
      os_name: { Args: never; Returns: string }
      pass:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      pg_stat_monitor_internal: {
        Args: { showtext: boolean }
        Returns: Record<string, unknown>[]
      }
      pg_stat_monitor_reset: { Args: never; Returns: undefined }
      pg_stat_monitor_version: { Args: never; Returns: string }
      pg_version: { Args: never; Returns: string }
      pg_version_num: { Args: never; Returns: number }
      pgrowlocks: {
        Args: { relname: string }
        Returns: Record<string, unknown>[]
      }
      pgsm_create_11_view: { Args: never; Returns: number }
      pgsm_create_13_view: { Args: never; Returns: number }
      pgsm_create_14_view: { Args: never; Returns: number }
      pgsm_create_15_view: { Args: never; Returns: number }
      pgsm_create_17_view: { Args: never; Returns: number }
      pgsm_create_view: { Args: never; Returns: number }
      pgtap_version: { Args: never; Returns: number }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_gdal_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_raster_lib_build_date: { Args: never; Returns: string }
      postgis_raster_lib_version: { Args: never; Returns: string }
      postgis_raster_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      query_analytics: {
        Args: { query_text: string; vars: Json }
        Returns: Json
      }
      range: { Args: never; Returns: string[] }
      runtests:
        | { Args: never; Returns: string[] }
        | { Args: { "": string }; Returns: string[] }
      skip:
        | { Args: { how_many: number; why: string }; Returns: string }
        | { Args: { "": string }; Returns: string }
      soundex: { Args: { "": string }; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addband:
        | {
            Args: {
              fromband?: number
              fromrast: unknown
              torast: unknown
              torastindex?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              fromband?: number
              fromrasts: unknown[]
              torast: unknown
              torastindex?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              index: number
              nodataval?: number
              outdbfile: string
              outdbindex: number[]
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              addbandargset: Database["public"]["CompositeTypes"]["addbandarg"][]
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              index?: number
              nodataval?: number
              outdbfile: string
              outdbindex: number[]
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              initialvalue?: number
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              index: number
              initialvalue?: number
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_approxcount:
        | { Args: { rast: unknown; sample_percent: number }; Returns: number }
        | {
            Args: {
              exclude_nodata_value: boolean
              rast: unknown
              sample_percent?: number
            }
            Returns: number
          }
        | {
            Args: { nband: number; rast: unknown; sample_percent: number }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              sample_percent?: number
            }
            Returns: number
          }
      st_approxhistogram:
        | {
            Args: { rast: unknown; sample_percent: number }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: { nband: number; rast: unknown; sample_percent: number }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins: number
              nband: number
              rast: unknown
              right: boolean
              sample_percent: number
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins: number
              nband: number
              rast: unknown
              right?: boolean
              sample_percent: number
              width?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins: number
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
              right: boolean
              sample_percent: number
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins?: number
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              right?: boolean
              sample_percent?: number
              width?: number[]
            }
            Returns: Record<string, unknown>[]
          }
      st_approxquantile:
        | {
            Args: { quantiles: number[]; rast: unknown }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              quantiles?: number[]
              rast: unknown
              sample_percent: number
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              nband: number
              quantiles?: number[]
              rast: unknown
              sample_percent: number
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              quantiles?: number[]
              rast: unknown
              sample_percent?: number
            }
            Returns: Record<string, unknown>[]
          }
        | { Args: { quantile: number; rast: unknown }; Returns: number }
        | {
            Args: { quantile: number; rast: unknown; sample_percent: number }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              quantile?: number
              rast: unknown
            }
            Returns: number
          }
        | {
            Args: {
              nband: number
              quantile: number
              rast: unknown
              sample_percent: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              quantile: number
              rast: unknown
              sample_percent: number
            }
            Returns: number
          }
      st_approxsummarystats:
        | {
            Args: { rast: unknown; sample_percent: number }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              rast: unknown
              sample_percent?: number
            }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { nband: number; rast: unknown; sample_percent: number }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              sample_percent?: number
            }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgdalraster: {
        Args: {
          format: string
          options?: string[]
          rast: unknown
          srid?: number
        }
        Returns: string
      }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asjpeg:
        | {
            Args: { nbands: number[]; options?: string[]; rast: unknown }
            Returns: string
          }
        | {
            Args: { nband: number; options?: string[]; rast: unknown }
            Returns: string
          }
        | {
            Args: { nband: number; quality: number; rast: unknown }
            Returns: string
          }
        | { Args: { options?: string[]; rast: unknown }; Returns: string }
        | {
            Args: { nbands: number[]; quality: number; rast: unknown }
            Returns: string
          }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_aspect:
        | {
            Args: {
              interpolate_nodata?: boolean
              nband?: number
              pixeltype?: string
              rast: unknown
              units?: string
            }
            Returns: unknown
          }
        | {
            Args: {
              customextent: unknown
              interpolate_nodata?: boolean
              nband: number
              pixeltype?: string
              rast: unknown
              units?: string
            }
            Returns: unknown
          }
      st_aspng:
        | {
            Args: { nbands: number[]; options?: string[]; rast: unknown }
            Returns: string
          }
        | {
            Args: { nband: number; options?: string[]; rast: unknown }
            Returns: string
          }
        | {
            Args: { compression: number; nband: number; rast: unknown }
            Returns: string
          }
        | { Args: { options?: string[]; rast: unknown }; Returns: string }
        | {
            Args: { compression: number; nbands: number[]; rast: unknown }
            Returns: string
          }
      st_asraster:
        | {
            Args: {
              geom: unknown
              gridx: number
              gridy: number
              height: number
              nodataval?: number
              pixeltype: string
              skewx?: number
              skewy?: number
              touched?: boolean
              value?: number
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              height: number
              nodataval?: number
              pixeltype: string
              skewx?: number
              skewy?: number
              touched?: boolean
              upperleftx?: number
              upperlefty?: number
              value?: number
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              gridx?: number
              gridy?: number
              height: number
              nodataval?: number[]
              pixeltype?: string[]
              skewx?: number
              skewy?: number
              touched?: boolean
              value?: number[]
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              height: number
              nodataval?: number[]
              pixeltype: string[]
              skewx?: number
              skewy?: number
              touched?: boolean
              upperleftx?: number
              upperlefty?: number
              value?: number[]
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              gridx: number
              gridy: number
              nodataval?: number
              pixeltype: string
              scalex: number
              scaley: number
              skewx?: number
              skewy?: number
              touched?: boolean
              value?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              nodataval?: number
              pixeltype: string
              scalex: number
              scaley: number
              skewx?: number
              skewy?: number
              touched?: boolean
              upperleftx?: number
              upperlefty?: number
              value?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              gridx?: number
              gridy?: number
              nodataval?: number[]
              pixeltype?: string[]
              scalex: number
              scaley: number
              skewx?: number
              skewy?: number
              touched?: boolean
              value?: number[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              nodataval?: number[]
              pixeltype: string[]
              scalex: number
              scaley: number
              skewx?: number
              skewy?: number
              touched?: boolean
              upperleftx?: number
              upperlefty?: number
              value?: number[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              nodataval?: number
              pixeltype: string
              ref: unknown
              touched?: boolean
              value?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              nodataval?: number[]
              pixeltype?: string[]
              ref: unknown
              touched?: boolean
              value?: number[]
            }
            Returns: unknown
          }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astiff:
        | {
            Args: {
              nbands: number[]
              options?: string[]
              rast: unknown
              srid?: number
            }
            Returns: string
          }
        | {
            Args: {
              compression: string
              nbands: number[]
              rast: unknown
              srid?: number
            }
            Returns: string
          }
        | {
            Args: { options?: string[]; rast: unknown; srid?: number }
            Returns: string
          }
        | {
            Args: { compression: string; rast: unknown; srid?: number }
            Returns: string
          }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_band:
        | { Args: { nbands?: number[]; rast: unknown }; Returns: unknown }
        | {
            Args: { delimiter?: string; nbands: string; rast: unknown }
            Returns: unknown
          }
        | { Args: { nband: number; rast: unknown }; Returns: unknown }
      st_bandfilesize: {
        Args: { band?: number; rast: unknown }
        Returns: number
      }
      st_bandfiletimestamp: {
        Args: { band?: number; rast: unknown }
        Returns: number
      }
      st_bandisnodata:
        | {
            Args: { band?: number; forcechecking?: boolean; rast: unknown }
            Returns: boolean
          }
        | { Args: { forcechecking: boolean; rast: unknown }; Returns: boolean }
      st_bandmetadata:
        | {
            Args: { band: number[]; rast: unknown }
            Returns: {
              bandnum: number
              filesize: number
              filetimestamp: number
              isoutdb: boolean
              nodatavalue: number
              outdbbandnum: number
              path: string
              pixeltype: string
            }[]
          }
        | {
            Args: { band?: number; rast: unknown }
            Returns: {
              filesize: number
              filetimestamp: number
              isoutdb: boolean
              nodatavalue: number
              outdbbandnum: number
              path: string
              pixeltype: string
            }[]
          }
      st_bandnodatavalue: {
        Args: { band?: number; rast: unknown }
        Returns: number
      }
      st_bandpath: { Args: { band?: number; rast: unknown }; Returns: string }
      st_bandpixeltype: {
        Args: { band?: number; rast: unknown }
        Returns: string
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clip:
        | {
            Args: { crop: boolean; geom: unknown; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              crop?: boolean
              geom: unknown
              nodataval: number
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              crop?: boolean
              geom: unknown
              nodataval?: number[]
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: { crop: boolean; geom: unknown; nband: number; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              crop?: boolean
              geom: unknown
              nband: number
              nodataval: number
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              crop?: boolean
              geom: unknown
              nband: number[]
              nodataval?: number[]
              rast: unknown
            }
            Returns: unknown
          }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_colormap:
        | {
            Args: { colormap: string; method?: string; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              colormap?: string
              method?: string
              nband?: number
              rast: unknown
            }
            Returns: unknown
          }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_containsproperly:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_contour: {
        Args: {
          bandnumber?: number
          fixed_levels?: number[]
          level_base?: number
          level_interval?: number
          polygonize?: boolean
          rast: unknown
        }
        Returns: {
          geom: unknown
          id: number
          value: number
        }[]
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_count:
        | {
            Args: { exclude_nodata_value: boolean; rast: unknown }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
            }
            Returns: number
          }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_createoverview: {
        Args: { algo?: string; col: unknown; factor: number; tab: unknown }
        Returns: unknown
      }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_dfullywithin:
        | {
            Args: { distance: number; rast1: unknown; rast2: unknown }
            Returns: boolean
          }
        | {
            Args: {
              distance: number
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distinct4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_dumpaspolygons: {
        Args: { band?: number; exclude_nodata_value?: boolean; rast: unknown }
        Returns: Database["public"]["CompositeTypes"]["geomval"][]
        SetofOptions: {
          from: "*"
          to: "geomval"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      st_dumpvalues:
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number[]
              rast: unknown
            }
            Returns: {
              nband: number
              valarray: number[]
            }[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband: number
              rast: unknown
            }
            Returns: number[]
          }
      st_dwithin:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
              tolerance: number
              use_spheroid?: boolean
            }
            Returns: boolean
          }
        | {
            Args: { distance: number; rast1: unknown; rast2: unknown }
            Returns: boolean
          }
        | {
            Args: {
              distance: number
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_fromgdalraster: {
        Args: { gdaldata: string; srid?: number }
        Returns: unknown
      }
      st_gdaldrivers: { Args: never; Returns: Record<string, unknown>[] }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_georeference: {
        Args: { format?: string; rast: unknown }
        Returns: string
      }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_grayscale:
        | {
            Args: {
              extenttype?: string
              rastbandargset: Database["public"]["CompositeTypes"]["rastbandarg"][]
            }
            Returns: unknown
          }
        | {
            Args: {
              blueband?: number
              extenttype?: string
              greenband?: number
              rast: unknown
              redband?: number
            }
            Returns: unknown
          }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hasnoband: {
        Args: { nband?: number; rast: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_hillshade:
        | {
            Args: {
              altitude?: number
              azimuth?: number
              interpolate_nodata?: boolean
              max_bright?: number
              nband?: number
              pixeltype?: string
              rast: unknown
              scale?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              altitude?: number
              azimuth?: number
              customextent: unknown
              interpolate_nodata?: boolean
              max_bright?: number
              nband: number
              pixeltype?: string
              rast: unknown
              scale?: number
            }
            Returns: unknown
          }
      st_histogram:
        | {
            Args: { bins: number; nband: number; rast: unknown; right: boolean }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins: number
              nband: number
              rast: unknown
              right?: boolean
              width?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins: number
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
              right: boolean
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              bins?: number
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              right?: boolean
              width?: number[]
            }
            Returns: Record<string, unknown>[]
          }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_interpolateraster: {
        Args: {
          bandnumber?: number
          geom: unknown
          options: string
          rast: unknown
        }
        Returns: unknown
      }
      st_intersection:
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize?: number }
            Returns: unknown
          }
        | {
            Args: {
              nodataval: number
              rast1: unknown
              rast2: unknown
              returnband: string
            }
            Returns: unknown
          }
        | {
            Args: {
              nodataval?: number[]
              rast1: unknown
              rast2: unknown
              returnband?: string
            }
            Returns: unknown
          }
        | {
            Args: { nodataval: number; rast1: unknown; rast2: unknown }
            Returns: unknown
          }
        | {
            Args: { nodataval: number[]; rast1: unknown; rast2: unknown }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              nodataval: number
              rast1: unknown
              rast2: unknown
              returnband: string
            }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              nodataval: number
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              nodataval: number[]
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: { band: number; geomin: unknown; rast: unknown }
            Returns: Database["public"]["CompositeTypes"]["geomval"][]
            SetofOptions: {
              from: "*"
              to: "geomval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { geomin: unknown; rast: unknown }
            Returns: Database["public"]["CompositeTypes"]["geomval"][]
            SetofOptions: {
              from: "*"
              to: "geomval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              band1: number
              band2: number
              nodataval?: number[]
              rast1: unknown
              rast2: unknown
              returnband?: string
            }
            Returns: unknown
          }
        | {
            Args: { band?: number; geomin: unknown; rast: unknown }
            Returns: Database["public"]["CompositeTypes"]["geomval"][]
            SetofOptions: {
              from: "*"
              to: "geomval"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: { geom: unknown; nband: number; rast: unknown }
            Returns: boolean
          }
        | {
            Args: { geom: unknown; nband?: number; rast: unknown }
            Returns: boolean
          }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
        | {
            Args: { geom: unknown; nband?: number; rast: unknown }
            Returns: boolean
          }
      st_invdistweight4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      st_iscoveragetile: {
        Args: {
          coverage: unknown
          rast: unknown
          tileheight: number
          tilewidth: number
        }
        Returns: boolean
      }
      st_isempty: { Args: { rast: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeemptycoverage: {
        Args: {
          height: number
          scalex: number
          scaley: number
          skewx: number
          skewy: number
          srid?: number
          tileheight: number
          tilewidth: number
          upperleftx: number
          upperlefty: number
          width: number
        }
        Returns: unknown[]
      }
      st_makeemptyraster:
        | {
            Args: {
              height: number
              scalex: number
              scaley: number
              skewx: number
              skewy: number
              srid?: number
              upperleftx: number
              upperlefty: number
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              height: number
              pixelsize: number
              upperleftx: number
              upperlefty: number
              width: number
            }
            Returns: unknown
          }
        | { Args: { rast: unknown }; Returns: unknown }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_mapalgebra:
        | {
            Args: {
              expression: string
              extenttype?: string
              nodata1expr?: string
              nodata2expr?: string
              nodatanodataval?: number
              pixeltype?: string
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              expression: string
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              expression: string
              nband: number
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              distancex?: number
              distancey?: number
              extenttype?: string
              nband: number
              pixeltype?: string
              rast: unknown
              userargs?: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              distancex?: number
              distancey?: number
              extenttype?: string
              nband1: number
              nband2: number
              pixeltype?: string
              rast1: unknown
              rast2: unknown
              userargs?: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              expression: string
              extenttype?: string
              nodata1expr?: string
              nodata2expr?: string
              nodatanodataval?: number
              pixeltype?: string
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              distancex?: number
              distancey?: number
              extenttype?: string
              pixeltype?: string
              rastbandargset: Database["public"]["CompositeTypes"]["rastbandarg"][]
              userargs?: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              extenttype?: string
              mask: number[]
              nband: number
              pixeltype?: string
              rast: unknown
              userargs?: string[]
              weighted: boolean
            }
            Returns: unknown
          }
        | {
            Args: {
              callbackfunc: unknown
              customextent?: unknown
              distancex?: number
              distancey?: number
              extenttype?: string
              nband: number[]
              pixeltype?: string
              rast: unknown
              userargs?: string[]
            }
            Returns: unknown
          }
      st_mapalgebraexpr:
        | {
            Args: {
              band: number
              expression: string
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              expression: string
              extenttype?: string
              nodata1expr?: string
              nodata2expr?: string
              nodatanodataval?: number
              pixeltype?: string
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              expression: string
              extenttype?: string
              nodata1expr?: string
              nodata2expr?: string
              nodatanodataval?: number
              pixeltype?: string
              rast1: unknown
              rast2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              expression: string
              nodataval?: number
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
      st_mapalgebrafct:
        | {
            Args: {
              args: string[]
              band: number
              onerastuserfunc: unknown
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              band1: number
              band2: number
              extenttype?: string
              pixeltype?: string
              rast1: unknown
              rast2: unknown
              tworastuserfunc: unknown
              userargs?: string[]
            }
            Returns: unknown
          }
        | {
            Args: { args: string[]; onerastuserfunc: unknown; rast: unknown }
            Returns: unknown
          }
        | {
            Args: { onerastuserfunc: unknown; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              extenttype?: string
              pixeltype?: string
              rast1: unknown
              rast2: unknown
              tworastuserfunc: unknown
              userargs?: string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              args: string[]
              onerastuserfunc: unknown
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: { onerastuserfunc: unknown; pixeltype: string; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              args: string[]
              band: number
              onerastuserfunc: unknown
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: { band: number; onerastuserfunc: unknown; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              band: number
              onerastuserfunc: unknown
              pixeltype: string
              rast: unknown
            }
            Returns: unknown
          }
      st_mapalgebrafctngb: {
        Args: {
          args: string[]
          band: number
          ngbheight: number
          ngbwidth: number
          nodatamode: string
          onerastngbuserfunc: unknown
          pixeltype: string
          rast: unknown
        }
        Returns: unknown
      }
      st_max4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_mean4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_metadata: { Args: { rast: unknown }; Returns: Record<string, unknown> }
      st_min4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_minconvexhull: {
        Args: { nband?: number; rast: unknown }
        Returns: unknown
      }
      st_mindist4ma: {
        Args: { pos: number[]; userargs?: string[]; value: number[] }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minpossiblevalue: { Args: { pixeltype: string }; Returns: number }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_nearestvalue:
        | {
            Args: {
              band: number
              exclude_nodata_value?: boolean
              pt: unknown
              rast: unknown
            }
            Returns: number
          }
        | {
            Args: {
              columnx: number
              exclude_nodata_value?: boolean
              rast: unknown
              rowy: number
            }
            Returns: number
          }
        | {
            Args: { exclude_nodata_value?: boolean; pt: unknown; rast: unknown }
            Returns: number
          }
        | {
            Args: {
              band: number
              columnx: number
              exclude_nodata_value?: boolean
              rast: unknown
              rowy: number
            }
            Returns: number
          }
      st_neighborhood:
        | {
            Args: {
              distancex: number
              distancey: number
              exclude_nodata_value?: boolean
              pt: unknown
              rast: unknown
            }
            Returns: number[]
          }
        | {
            Args: {
              columnx: number
              distancex: number
              distancey: number
              exclude_nodata_value?: boolean
              rast: unknown
              rowy: number
            }
            Returns: number[]
          }
        | {
            Args: {
              band: number
              columnx: number
              distancex: number
              distancey: number
              exclude_nodata_value?: boolean
              rast: unknown
              rowy: number
            }
            Returns: number[]
          }
        | {
            Args: {
              band: number
              distancex: number
              distancey: number
              exclude_nodata_value?: boolean
              pt: unknown
              rast: unknown
            }
            Returns: number[]
          }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_notsamealignmentreason: {
        Args: { rast1: unknown; rast2: unknown }
        Returns: string
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pixelascentroid: {
        Args: { rast: unknown; x: number; y: number }
        Returns: unknown
      }
      st_pixelascentroids: {
        Args: { band?: number; exclude_nodata_value?: boolean; rast: unknown }
        Returns: {
          geom: unknown
          val: number
          x: number
          y: number
        }[]
      }
      st_pixelaspoint: {
        Args: { rast: unknown; x: number; y: number }
        Returns: unknown
      }
      st_pixelaspoints: {
        Args: { band?: number; exclude_nodata_value?: boolean; rast: unknown }
        Returns: {
          geom: unknown
          val: number
          x: number
          y: number
        }[]
      }
      st_pixelaspolygon: {
        Args: { rast: unknown; x: number; y: number }
        Returns: unknown
      }
      st_pixelaspolygons: {
        Args: { band?: number; exclude_nodata_value?: boolean; rast: unknown }
        Returns: {
          geom: unknown
          val: number
          x: number
          y: number
        }[]
      }
      st_pixelofvalue:
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband: number
              rast: unknown
              search: number[]
            }
            Returns: {
              val: number
              x: number
              y: number
            }[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              rast: unknown
              search: number
            }
            Returns: {
              x: number
              y: number
            }[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband: number
              rast: unknown
              search: number
            }
            Returns: {
              x: number
              y: number
            }[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              rast: unknown
              search: number[]
            }
            Returns: {
              val: number
              x: number
              y: number
            }[]
          }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygon: { Args: { band?: number; rast: unknown }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantile:
        | {
            Args: { quantiles: number[]; rast: unknown }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: { nband: number; quantiles: number[]; rast: unknown }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              quantiles?: number[]
              rast: unknown
            }
            Returns: Record<string, unknown>[]
          }
        | { Args: { quantile: number; rast: unknown }; Returns: number }
        | {
            Args: {
              exclude_nodata_value: boolean
              quantile?: number
              rast: unknown
            }
            Returns: number
          }
        | {
            Args: { nband: number; quantile: number; rast: unknown }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              quantile: number
              rast: unknown
            }
            Returns: number
          }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_range4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_rastertoworldcoord: {
        Args: { columnx: number; rast: unknown; rowy: number }
        Returns: Record<string, unknown>
      }
      st_rastertoworldcoordx:
        | { Args: { rast: unknown; xr: number }; Returns: number }
        | { Args: { rast: unknown; xr: number; yr: number }; Returns: number }
      st_rastertoworldcoordy:
        | { Args: { rast: unknown; yr: number }; Returns: number }
        | { Args: { rast: unknown; xr: number; yr: number }; Returns: number }
      st_rastfromhexwkb: { Args: { "": string }; Returns: unknown }
      st_reclass:
        | {
            Args: { pixeltype: string; rast: unknown; reclassexpr: string }
            Returns: unknown
          }
        | {
            Args: {
              nband: number
              nodataval?: number
              pixeltype: string
              rast: unknown
              reclassexpr: string
            }
            Returns: unknown
          }
        | {
            Args: {
              rast: unknown
              reclassargset: Database["public"]["CompositeTypes"]["reclassarg"][]
            }
            Returns: unknown
          }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_resample:
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              ref: unknown
              usescale: boolean
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              gridx?: number
              gridy?: number
              height: number
              maxerr?: number
              rast: unknown
              skewx?: number
              skewy?: number
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              gridx?: number
              gridy?: number
              maxerr?: number
              rast: unknown
              scalex?: number
              scaley?: number
              skewx?: number
              skewy?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              ref: unknown
              usescale?: boolean
            }
            Returns: unknown
          }
      st_rescale:
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              scalex: number
              scaley: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              scalexy: number
            }
            Returns: unknown
          }
      st_resize:
        | {
            Args: {
              algorithm?: string
              height: number
              maxerr?: number
              rast: unknown
              width: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              height: string
              maxerr?: number
              rast: unknown
              width: string
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              percentheight: number
              percentwidth: number
              rast: unknown
            }
            Returns: unknown
          }
      st_reskew:
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              skewx: number
              skewy: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              skewxy: number
            }
            Returns: unknown
          }
      st_retile: {
        Args: {
          algo?: string
          col: unknown
          ext: unknown
          sfx: number
          sfy: number
          tab: unknown
          th: number
          tw: number
        }
        Returns: unknown[]
      }
      st_roughness:
        | {
            Args: {
              interpolate_nodata?: boolean
              nband?: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              customextent: unknown
              interpolate_nodata?: boolean
              nband: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
      st_samealignment:
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              scalex1: number
              scalex2: number
              scaley1: number
              scaley2: number
              skewx1: number
              skewx2: number
              skewy1: number
              skewy2: number
              ulx1: number
              ulx2: number
              uly1: number
              uly2: number
            }
            Returns: boolean
          }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setbandindex: {
        Args: {
          band: number
          force?: boolean
          outdbindex: number
          rast: unknown
        }
        Returns: unknown
      }
      st_setbandisnodata: {
        Args: { band?: number; rast: unknown }
        Returns: unknown
      }
      st_setbandnodatavalue:
        | {
            Args: {
              band: number
              forcechecking?: boolean
              nodatavalue: number
              rast: unknown
            }
            Returns: unknown
          }
        | { Args: { nodatavalue: number; rast: unknown }; Returns: unknown }
      st_setbandpath: {
        Args: {
          band: number
          force?: boolean
          outdbindex: number
          outdbpath: string
          rast: unknown
        }
        Returns: unknown
      }
      st_setgeoreference:
        | {
            Args: {
              rast: unknown
              scalex: number
              scaley: number
              skewx: number
              skewy: number
              upperleftx: number
              upperlefty: number
            }
            Returns: unknown
          }
        | {
            Args: { format?: string; georef: string; rast: unknown }
            Returns: unknown
          }
      st_setgeotransform: {
        Args: {
          imag: number
          jmag: number
          rast: unknown
          theta_i: number
          theta_ij: number
          xoffset: number
          yoffset: number
        }
        Returns: unknown
      }
      st_setm: {
        Args: { band?: number; geom: unknown; rast: unknown; resample?: string }
        Returns: unknown
      }
      st_setrotation: {
        Args: { rast: unknown; rotation: number }
        Returns: unknown
      }
      st_setscale:
        | {
            Args: { rast: unknown; scalex: number; scaley: number }
            Returns: unknown
          }
        | { Args: { rast: unknown; scale: number }; Returns: unknown }
      st_setskew:
        | {
            Args: { rast: unknown; skewx: number; skewy: number }
            Returns: unknown
          }
        | { Args: { rast: unknown; skew: number }; Returns: unknown }
      st_setsrid:
        | { Args: { rast: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_setupperleft: {
        Args: { rast: unknown; upperleftx: number; upperlefty: number }
        Returns: unknown
      }
      st_setvalue:
        | {
            Args: {
              band: number
              newvalue: number
              rast: unknown
              x: number
              y: number
            }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; newvalue: number; rast: unknown }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              nband: number
              newvalue: number
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: { newvalue: number; rast: unknown; x: number; y: number }
            Returns: unknown
          }
      st_setvalues:
        | {
            Args: {
              geomvalset: Database["public"]["CompositeTypes"]["geomval"][]
              keepnodata?: boolean
              nband: number
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              keepnodata?: boolean
              nband: number
              newvalueset: number[]
              nosetvalue: number
              rast: unknown
              x: number
              y: number
            }
            Returns: unknown
          }
        | {
            Args: {
              keepnodata?: boolean
              nband: number
              newvalueset: number[]
              noset?: boolean[]
              rast: unknown
              x: number
              y: number
            }
            Returns: unknown
          }
        | {
            Args: {
              height: number
              keepnodata?: boolean
              newvalue: number
              rast: unknown
              width: number
              x: number
              y: number
            }
            Returns: unknown
          }
        | {
            Args: {
              height: number
              keepnodata?: boolean
              nband: number
              newvalue: number
              rast: unknown
              width: number
              x: number
              y: number
            }
            Returns: unknown
          }
      st_setz: {
        Args: { band?: number; geom: unknown; rast: unknown; resample?: string }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_slope:
        | {
            Args: {
              interpolate_nodata?: boolean
              nband?: number
              pixeltype?: string
              rast: unknown
              scale?: number
              units?: string
            }
            Returns: unknown
          }
        | {
            Args: {
              customextent: unknown
              interpolate_nodata?: boolean
              nband: number
              pixeltype?: string
              rast: unknown
              scale?: number
              units?: string
            }
            Returns: unknown
          }
      st_snaptogrid:
        | {
            Args: {
              algorithm?: string
              gridx: number
              gridy: number
              maxerr?: number
              rast: unknown
              scalex: number
              scaley: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              gridx: number
              gridy: number
              maxerr?: number
              rast: unknown
              scalexy: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              gridx: number
              gridy: number
              maxerr?: number
              rast: unknown
              scalex?: number
              scaley?: number
            }
            Returns: unknown
          }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_stddev4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_sum4ma:
        | {
            Args: { args: string[]; matrix: number[]; nodatamode: string }
            Returns: number
          }
        | {
            Args: { pos: number[]; userargs?: string[]; value: number[] }
            Returns: number
          }
      st_summary: { Args: { rast: unknown }; Returns: string }
      st_summarystats:
        | {
            Args: { exclude_nodata_value: boolean; rast: unknown }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
            }
            Returns: Database["public"]["CompositeTypes"]["summarystats"]
            SetofOptions: {
              from: "*"
              to: "summarystats"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tile:
        | {
            Args: {
              height: number
              nband: number
              nodataval?: number
              padwithnodata?: boolean
              rast: unknown
              width: number
            }
            Returns: unknown[]
          }
        | {
            Args: {
              height: number
              nband: number[]
              nodataval?: number
              padwithnodata?: boolean
              rast: unknown
              width: number
            }
            Returns: unknown[]
          }
        | {
            Args: {
              height: number
              nodataval?: number
              padwithnodata?: boolean
              rast: unknown
              width: number
            }
            Returns: unknown[]
          }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_tpi:
        | {
            Args: {
              interpolate_nodata?: boolean
              nband?: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              customextent: unknown
              interpolate_nodata?: boolean
              nband: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              scalex: number
              scaley: number
              srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              scalexy: number
              srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              maxerr?: number
              rast: unknown
              scalex?: number
              scaley?: number
              srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              algorithm?: string
              alignto: unknown
              maxerr?: number
              rast: unknown
            }
            Returns: unknown
          }
      st_tri:
        | {
            Args: {
              interpolate_nodata?: boolean
              nband?: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              customextent: unknown
              interpolate_nodata?: boolean
              nband: number
              pixeltype?: string
              rast: unknown
            }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_value:
        | {
            Args: {
              band: number
              exclude_nodata_value?: boolean
              pt: unknown
              rast: unknown
              resample?: string
            }
            Returns: number
          }
        | {
            Args: {
              band: number
              exclude_nodata_value?: boolean
              rast: unknown
              x: number
              y: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              rast: unknown
              x: number
              y: number
            }
            Returns: number
          }
        | {
            Args: { exclude_nodata_value?: boolean; pt: unknown; rast: unknown }
            Returns: number
          }
      st_valuecount:
        | {
            Args: { rast: unknown; roundto?: number; searchvalues: number[] }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              nband: number
              rast: unknown
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: { rast: unknown; roundto?: number; searchvalue: number }
            Returns: number
          }
        | {
            Args: {
              nband: number
              rast: unknown
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
      st_valuepercent:
        | {
            Args: { rast: unknown; roundto?: number; searchvalues: number[] }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              nband: number
              rast: unknown
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rast: unknown
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              exclude_nodata_value?: boolean
              nband?: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalues?: number[]
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: { rast: unknown; roundto?: number; searchvalue: number }
            Returns: number
          }
        | {
            Args: {
              nband: number
              rast: unknown
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              rast: unknown
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
        | {
            Args: {
              exclude_nodata_value: boolean
              nband: number
              rastercolumn: string
              rastertable: string
              roundto?: number
              searchvalue: number
            }
            Returns: number
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { rast1: unknown; rast2: unknown }; Returns: boolean }
        | {
            Args: {
              nband1: number
              nband2: number
              rast1: unknown
              rast2: unknown
            }
            Returns: boolean
          }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_worldtorastercoord:
        | {
            Args: { latitude: number; longitude: number; rast: unknown }
            Returns: Record<string, unknown>
          }
        | {
            Args: { pt: unknown; rast: unknown }
            Returns: Record<string, unknown>
          }
      st_worldtorastercoordx:
        | { Args: { rast: unknown; xw: number }; Returns: number }
        | { Args: { rast: unknown; xw: number; yw: number }; Returns: number }
        | { Args: { pt: unknown; rast: unknown }; Returns: number }
      st_worldtorastercoordy:
        | { Args: { rast: unknown; yw: number }; Returns: number }
        | { Args: { rast: unknown; xw: number; yw: number }; Returns: number }
        | { Args: { pt: unknown; rast: unknown }; Returns: number }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      text_soundex: { Args: { "": string }; Returns: string }
      throws_ok: { Args: { "": string }; Returns: string }
      todo:
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
        | { Args: { how_many: number }; Returns: boolean[] }
        | { Args: { why: string }; Returns: boolean[] }
      todo_end: { Args: never; Returns: boolean[] }
      todo_start:
        | { Args: { "": string }; Returns: boolean[] }
        | { Args: never; Returns: boolean[] }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      updaterastersrid:
        | {
            Args: {
              column_name: unknown
              new_srid: number
              schema_name: unknown
              table_name: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              column_name: unknown
              new_srid: number
              table_name: unknown
            }
            Returns: boolean
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
      addbandarg: {
        index: number | null
        pixeltype: string | null
        initialvalue: number | null
        nodataval: number | null
      }
      agg_count: {
        count: number | null
        nband: number | null
        exclude_nodata_value: boolean | null
        sample_percent: number | null
      }
      agg_samealignment: {
        refraster: unknown
        aligned: boolean | null
      }
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      geomval: {
        geom: unknown
        val: number | null
      }
      rastbandarg: {
        rast: unknown
        nband: number | null
      }
      reclassarg: {
        nband: number | null
        reclassexpr: string | null
        pixeltype: string | null
        nodataval: number | null
      }
      summarystats: {
        count: number | null
        sum: number | null
        mean: number | null
        stddev: number | null
        min: number | null
        max: number | null
      }
      tablefunc_crosstab_2: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
      }
      tablefunc_crosstab_3: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
        category_3: string | null
      }
      tablefunc_crosstab_4: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
        category_3: string | null
        category_4: string | null
      }
      unionarg: {
        nband: number | null
        uniontype: string | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
  public: {
    Enums: {},
  },
} as const

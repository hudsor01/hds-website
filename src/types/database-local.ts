export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          completed_at: string | null
          funnel_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          step_name: string
          step_order: number
          time_to_complete: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          funnel_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          step_name: string
          step_order: number
          time_to_complete?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          funnel_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          step_name?: string
          step_order?: number
          time_to_complete?: number | null
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
          metadata: Json | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_category?: string | null
          event_label?: string | null
          event_name: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_category?: string | null
          event_label?: string | null
          event_name?: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
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
          lead_score: number | null
          message: string | null
          name: string | null
          phone: string | null
          source: string
          status: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          lead_score?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          lead_score?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
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
          id: string
          os: string | null
          page_path: string
          referrer: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          bounce?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
          os?: string | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          bounce?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration?: number | null
          id?: string
          os?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      cleanup_expired_ttl_calculations: { Args: never; Returns: number }
      generate_share_code: { Args: never; Returns: string }
      query_analytics: {
        Args: { query_text: string; vars: Json }
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


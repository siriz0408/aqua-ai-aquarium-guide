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
      _backup_profiles: {
        Row: {
          admin_permissions: Json | null
          admin_role: string | null
          avatar_url: string | null
          created_at: string | null
          created_by_admin_id: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          last_active: string | null
          last_admin_login: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          admin_permissions?: Json | null
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by_admin_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          last_active?: string | null
          last_admin_login?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_permissions?: Json | null
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by_admin_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          last_active?: string | null
          last_admin_login?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin_activity_logs_admin_user_id"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_invitations: {
        Row: {
          accepted: boolean | null
          admin_role: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          permissions: Json | null
        }
        Insert: {
          accepted?: boolean | null
          admin_role?: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          permissions?: Json | null
        }
        Update: {
          accepted?: boolean | null
          admin_role?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notes: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          note: string
          note_type: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          note: string
          note_type?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          note?: string
          note_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin_notes_admin_id"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_admin_notes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aquariums: {
        Row: {
          alkalinity: number | null
          ammonia: number | null
          calcium: number | null
          created_at: string
          id: string
          magnesium: number | null
          name: string
          nitrate: number | null
          nitrite: number | null
          ph: number | null
          phosphate: number | null
          salinity: number | null
          setup_date: string | null
          size_gallons: number | null
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alkalinity?: number | null
          ammonia?: number | null
          calcium?: number | null
          created_at?: string
          id?: string
          magnesium?: number | null
          name: string
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          phosphate?: number | null
          salinity?: number | null
          setup_date?: string | null
          size_gallons?: number | null
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alkalinity?: number | null
          ammonia?: number | null
          calcium?: number | null
          created_at?: string
          id?: string
          magnesium?: number | null
          name?: string
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          phosphate?: number | null
          salinity?: number | null
          setup_date?: string | null
          size_gallons?: number | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      educational_equipment: {
        Row: {
          category: string
          compatibility_equipment: string[] | null
          created_at: string
          difficulty_level: string
          id: string
          image_gallery: string[] | null
          image_url: string | null
          installation_notes: string | null
          maintenance_frequency: string | null
          name: string
          price_range: string | null
          recommended_tank_sizes: string[] | null
          specifications: Json | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          category: string
          compatibility_equipment?: string[] | null
          created_at?: string
          difficulty_level?: string
          id?: string
          image_gallery?: string[] | null
          image_url?: string | null
          installation_notes?: string | null
          maintenance_frequency?: string | null
          name: string
          price_range?: string | null
          recommended_tank_sizes?: string[] | null
          specifications?: Json | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          compatibility_equipment?: string[] | null
          created_at?: string
          difficulty_level?: string
          id?: string
          image_gallery?: string[] | null
          image_url?: string | null
          installation_notes?: string | null
          maintenance_frequency?: string | null
          name?: string
          price_range?: string | null
          recommended_tank_sizes?: string[] | null
          specifications?: Json | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      educational_fish: {
        Row: {
          care_level: string
          category: string
          class: string | null
          common_names: Json | null
          compatibility_notes: string | null
          conservation_status: string | null
          created_at: string
          data_source: string | null
          diet_type: string | null
          family: string | null
          food_details: string | null
          gbif_last_updated: string | null
          gbif_species_key: number | null
          gbif_usage_key: number | null
          genus: string | null
          geographic_distribution: Json | null
          habitat_notes: string | null
          id: string
          image_gallery: string[] | null
          image_url: string | null
          kingdom: string | null
          name: string
          order_name: string | null
          ph_range: string | null
          phylum: string | null
          reef_safe: boolean | null
          scientific_name: string | null
          scientific_name_authorship: string | null
          similar_species: string[] | null
          species_name: string | null
          summary: string | null
          synonyms: Json | null
          tank_size_minimum: number | null
          taxonomic_status: string | null
          updated_at: string
          water_temperature_range: string | null
          water_type: string | null
        }
        Insert: {
          care_level?: string
          category?: string
          class?: string | null
          common_names?: Json | null
          compatibility_notes?: string | null
          conservation_status?: string | null
          created_at?: string
          data_source?: string | null
          diet_type?: string | null
          family?: string | null
          food_details?: string | null
          gbif_last_updated?: string | null
          gbif_species_key?: number | null
          gbif_usage_key?: number | null
          genus?: string | null
          geographic_distribution?: Json | null
          habitat_notes?: string | null
          id?: string
          image_gallery?: string[] | null
          image_url?: string | null
          kingdom?: string | null
          name: string
          order_name?: string | null
          ph_range?: string | null
          phylum?: string | null
          reef_safe?: boolean | null
          scientific_name?: string | null
          scientific_name_authorship?: string | null
          similar_species?: string[] | null
          species_name?: string | null
          summary?: string | null
          synonyms?: Json | null
          tank_size_minimum?: number | null
          taxonomic_status?: string | null
          updated_at?: string
          water_temperature_range?: string | null
          water_type?: string | null
        }
        Update: {
          care_level?: string
          category?: string
          class?: string | null
          common_names?: Json | null
          compatibility_notes?: string | null
          conservation_status?: string | null
          created_at?: string
          data_source?: string | null
          diet_type?: string | null
          family?: string | null
          food_details?: string | null
          gbif_last_updated?: string | null
          gbif_species_key?: number | null
          gbif_usage_key?: number | null
          genus?: string | null
          geographic_distribution?: Json | null
          habitat_notes?: string | null
          id?: string
          image_gallery?: string[] | null
          image_url?: string | null
          kingdom?: string | null
          name?: string
          order_name?: string | null
          ph_range?: string | null
          phylum?: string | null
          reef_safe?: boolean | null
          scientific_name?: string | null
          scientific_name_authorship?: string | null
          similar_species?: string[] | null
          species_name?: string | null
          summary?: string | null
          synonyms?: Json | null
          tank_size_minimum?: number | null
          taxonomic_status?: string | null
          updated_at?: string
          water_temperature_range?: string | null
          water_type?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          aquarium_id: string
          created_at: string
          id: string
          image_url: string | null
          maintenance_tips: string | null
          model: string | null
          name: string
          type: string
          updated_at: string
          upgrade_notes: string | null
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          maintenance_tips?: string | null
          model?: string | null
          name: string
          type: string
          updated_at?: string
          upgrade_notes?: string | null
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          maintenance_tips?: string | null
          model?: string | null
          name?: string
          type?: string
          updated_at?: string
          upgrade_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      fish: {
        Row: {
          aquarium_id: string
          created_at: string
          date_added: string | null
          id: string
          name: string
          notes: string | null
          scientific_name: string | null
          size_inches: number | null
          species: string
          updated_at: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          date_added?: string | null
          id?: string
          name: string
          notes?: string | null
          scientific_name?: string | null
          size_inches?: number | null
          species: string
          updated_at?: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          date_added?: string | null
          id?: string
          name?: string
          notes?: string | null
          scientific_name?: string | null
          size_inches?: number | null
          species?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fish_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock: {
        Row: {
          aquarium_id: string
          care_level: string
          compatibility: string | null
          created_at: string
          health_notes: string | null
          id: string
          image_url: string | null
          name: string
          species: string
          updated_at: string
        }
        Insert: {
          aquarium_id: string
          care_level?: string
          compatibility?: string | null
          created_at?: string
          health_notes?: string | null
          id?: string
          image_url?: string | null
          name: string
          species: string
          updated_at?: string
        }
        Update: {
          aquarium_id?: string
          care_level?: string
          compatibility?: string | null
          created_at?: string
          health_notes?: string | null
          id?: string
          image_url?: string | null
          name?: string
          species?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_events: {
        Row: {
          actual_duration: number | null
          completed_date: string | null
          created_at: string
          difficulty_rating: number | null
          id: string
          notes: string | null
          schedule_id: string | null
          scheduled_date: string
          status: string
          tank_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_duration?: number | null
          completed_date?: string | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          notes?: string | null
          schedule_id?: string | null
          scheduled_date: string
          status?: string
          tank_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_duration?: number | null
          completed_date?: string | null
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          notes?: string | null
          schedule_id?: string | null
          scheduled_date?: string
          status?: string
          tank_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          custom_instructions: string | null
          custom_priority: string | null
          description: string | null
          frequency_days: number
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          last_completed_date: string | null
          name: string
          next_due_date: string | null
          notifications_enabled: boolean | null
          tank_id: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_instructions?: string | null
          custom_priority?: string | null
          description?: string | null
          frequency_days: number
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          last_completed_date?: string | null
          name: string
          next_due_date?: string | null
          notifications_enabled?: boolean | null
          tank_id?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_instructions?: string | null
          custom_priority?: string | null
          description?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          last_completed_date?: string | null
          name?: string
          next_due_date?: string | null
          notifications_enabled?: boolean | null
          tank_id?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_templates: {
        Row: {
          base_interval_days: number
          bioload_dependent: boolean | null
          created_at: string
          description: string | null
          difficulty: string | null
          equipment_dependent: boolean | null
          equipment_types: string[] | null
          estimated_time: string | null
          experience_modifier: Json | null
          frequency: string
          id: string
          instructions: string | null
          maturity_modifier: Json | null
          name: string
          priority: string
          required_tools: string[] | null
          size_dependent: boolean | null
          tank_type: string
          task_type: string
          tips: string[] | null
          updated_at: string
          warnings: string[] | null
        }
        Insert: {
          base_interval_days: number
          bioload_dependent?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment_dependent?: boolean | null
          equipment_types?: string[] | null
          estimated_time?: string | null
          experience_modifier?: Json | null
          frequency: string
          id?: string
          instructions?: string | null
          maturity_modifier?: Json | null
          name: string
          priority?: string
          required_tools?: string[] | null
          size_dependent?: boolean | null
          tank_type: string
          task_type?: string
          tips?: string[] | null
          updated_at?: string
          warnings?: string[] | null
        }
        Update: {
          base_interval_days?: number
          bioload_dependent?: boolean | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment_dependent?: boolean | null
          equipment_types?: string[] | null
          estimated_time?: string | null
          experience_modifier?: Json | null
          frequency?: string
          id?: string
          instructions?: string | null
          maturity_modifier?: Json | null
          name?: string
          priority?: string
          required_tools?: string[] | null
          size_dependent?: boolean | null
          tank_type?: string
          task_type?: string
          tips?: string[] | null
          updated_at?: string
          warnings?: string[] | null
        }
        Relationships: []
      }
      manual_sync_operations: {
        Row: {
          admin_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          operation_type: string
          stripe_customer_id: string | null
          success: boolean | null
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          admin_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          operation_type: string
          stripe_customer_id?: string | null
          success?: boolean | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          admin_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          operation_type?: string
          stripe_customer_id?: string | null
          success?: boolean | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_sync_operations_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          ai_insights_enabled: boolean
          created_at: string
          critical_alerts_enabled: boolean
          due_tasks_enabled: boolean
          enabled: boolean
          escalation_intervals: number[]
          group_notifications: boolean
          id: string
          overdue_tasks_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          snooze_duration_hours: number
          task_priority_threshold: string
          time_of_day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights_enabled?: boolean
          created_at?: string
          critical_alerts_enabled?: boolean
          due_tasks_enabled?: boolean
          enabled?: boolean
          escalation_intervals?: number[]
          group_notifications?: boolean
          id?: string
          overdue_tasks_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          snooze_duration_hours?: number
          task_priority_threshold?: string
          time_of_day?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights_enabled?: boolean
          created_at?: string
          critical_alerts_enabled?: boolean
          due_tasks_enabled?: boolean
          enabled?: boolean
          escalation_intervals?: number[]
          group_notifications?: boolean
          id?: string
          overdue_tasks_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          snooze_duration_hours?: number
          task_priority_threshold?: string
          time_of_day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_permissions: Json | null
          admin_role: string | null
          avatar_url: string | null
          created_at: string
          created_by_admin_id: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          last_active: string | null
          last_admin_login: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          admin_permissions?: Json | null
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by_admin_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          last_active?: string | null
          last_admin_login?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          admin_permissions?: Json | null
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by_admin_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_active?: string | null
          last_admin_login?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      setup_plans: {
        Row: {
          budget_timeline: Json
          compatible_livestock: Json
          created_at: string
          equipment: Json
          id: string
          monthly_maintenance: string | null
          plan_name: string
          recommendations: Json | null
          tank_specs: Json
          timeline: Json
          total_estimate: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_timeline: Json
          compatible_livestock: Json
          created_at?: string
          equipment: Json
          id?: string
          monthly_maintenance?: string | null
          plan_name: string
          recommendations?: Json | null
          tank_specs: Json
          timeline: Json
          total_estimate?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_timeline?: Json
          compatible_livestock?: Json
          created_at?: string
          equipment?: Json
          id?: string
          monthly_maintenance?: string | null
          plan_name?: string
          recommendations?: Json | null
          tank_specs?: Json
          timeline?: Json
          total_estimate?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_ticket_responses: {
        Row: {
          created_at: string
          from_admin: boolean | null
          id: string
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          from_admin?: boolean | null
          id?: string
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          from_admin?: boolean | null
          id?: string
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_ticket_responses_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_admin_id: string | null
          created_at: string
          id: string
          message: string
          priority: string | null
          resolved_at: string | null
          response_count: number | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          resolved_at?: string | null
          response_count?: number | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          resolved_at?: string | null
          response_count?: number | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_tickets_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_lists: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          list_type: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          list_type?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          list_type?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completion_count: number | null
          conversation_id: string | null
          created_at: string
          description: string | null
          detailed_instructions: string | null
          difficulty: string | null
          due_date: string | null
          estimated_time: string | null
          frequency: string | null
          id: string
          is_recurring: boolean | null
          list_id: string | null
          occurrence_date: string | null
          parent_task_id: string | null
          priority: string
          recurrence_pattern: Json | null
          required_tools: string[] | null
          resources: Json | null
          series_id: string | null
          skip_count: number | null
          status: string
          steps: Json | null
          task_type: string
          tips: string[] | null
          title: string
          updated_at: string
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          completion_count?: number | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          detailed_instructions?: string | null
          difficulty?: string | null
          due_date?: string | null
          estimated_time?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          list_id?: string | null
          occurrence_date?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_pattern?: Json | null
          required_tools?: string[] | null
          resources?: Json | null
          series_id?: string | null
          skip_count?: number | null
          status?: string
          steps?: Json | null
          task_type?: string
          tips?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          completion_count?: number | null
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          detailed_instructions?: string | null
          difficulty?: string | null
          due_date?: string | null
          estimated_time?: string | null
          frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          list_id?: string | null
          occurrence_date?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_pattern?: Json | null
          required_tools?: string[] | null
          resources?: Json | null
          series_id?: string | null
          skip_count?: number | null
          status?: string
          steps?: Json | null
          task_type?: string
          tips?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipment_lists: {
        Row: {
          added_at: string
          equipment_id: string
          id: string
          list_type: string
          notes: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          equipment_id: string
          id?: string
          list_type?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          equipment_id?: string
          id?: string
          list_type?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_lists_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "educational_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      user_fish_lists: {
        Row: {
          added_at: string
          fish_id: string
          id: string
          list_type: string
          notes: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          fish_id: string
          id?: string
          list_type?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          fish_id?: string
          id?: string
          list_type?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_fish_lists_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "educational_fish"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_setup: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      water_test_logs: {
        Row: {
          alkalinity: number | null
          ammonia: number | null
          aquarium_id: string
          calcium: number | null
          created_at: string
          id: string
          magnesium: number | null
          nitrate: number | null
          nitrite: number | null
          notes: string | null
          ph: number | null
          phosphate: number | null
          salinity: number | null
          temperature: number | null
          test_date: string
        }
        Insert: {
          alkalinity?: number | null
          ammonia?: number | null
          aquarium_id: string
          calcium?: number | null
          created_at?: string
          id?: string
          magnesium?: number | null
          nitrate?: number | null
          nitrite?: number | null
          notes?: string | null
          ph?: number | null
          phosphate?: number | null
          salinity?: number | null
          temperature?: number | null
          test_date?: string
        }
        Update: {
          alkalinity?: number | null
          ammonia?: number | null
          aquarium_id?: string
          calcium?: number | null
          created_at?: string
          id?: string
          magnesium?: number | null
          nitrate?: number | null
          nitrite?: number | null
          notes?: string | null
          ph?: number | null
          phosphate?: number | null
          salinity?: number | null
          temperature?: number | null
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_test_logs_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          customer_id: string | null
          error_message: string | null
          event_type: string
          id: string
          processed_at: string | null
          processing_status: string | null
          raw_data: Json | null
          stripe_event_id: string
          subscription_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          raw_data?: Json | null
          stripe_event_id: string
          subscription_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          raw_data?: Json | null
          stripe_event_id?: string
          subscription_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          status: string | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_profile: {
        Args: { requesting_admin_id: string; target_user_id: string }
        Returns: boolean
      }
      admin_get_all_profiles: {
        Args: { requesting_admin_id: string }
        Returns: {
          id: string
          email: string
          full_name: string
          is_admin: boolean
          admin_role: string
          subscription_status: string
          subscription_tier: string
          free_credits_remaining: number
          total_credits_used: number
          created_at: string
          last_active: string
          admin_permissions: Json
        }[]
      }
      admin_impersonate_user: {
        Args: { requesting_admin_id: string; target_user_id: string }
        Returns: {
          access_token: string
          refresh_token: string
          user_data: Json
        }[]
      }
      admin_manual_sync_user: {
        Args: {
          requesting_admin_id: string
          target_email: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_status?: string
        }
        Returns: Json
      }
      admin_update_profile: {
        Args: {
          requesting_admin_id: string
          target_user_id: string
          new_full_name: string
          new_is_admin: boolean
          new_admin_role: string
          new_subscription_status: string
          new_subscription_tier: string
          new_free_credits_remaining?: number
        }
        Returns: boolean
      }
      can_access_ai_features: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_access: {
        Args: { user_id: string }
        Returns: {
          has_access: boolean
          access_reason: string
          trial_hours_remaining: number
        }[]
      }
      check_user_admin_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      complete_maintenance_task: {
        Args: {
          p_schedule_id: string
          p_completion_date?: string
          p_notes?: string
        }
        Returns: undefined
      }
      complete_recurring_task: {
        Args: {
          task_id: string
          completion_date?: string
          skip_occurrence?: boolean
        }
        Returns: Json
      }
      ensure_user_profile: {
        Args: { user_id: string }
        Returns: undefined
      }
      generate_next_task_occurrence: {
        Args: { task_id: string; completion_date?: string }
        Returns: string
      }
      generate_tank_maintenance_schedule: {
        Args: {
          p_user_id: string
          p_tank_id: string
          p_tank_type: string
          p_tank_size_gallons: number
          p_user_experience?: string
          p_tank_age_months?: number
        }
        Returns: undefined
      }
      get_expiring_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          stripe_subscription_id: string
          subscription_end_date: string
          days_until_expiry: number
        }[]
      }
      get_subscription_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_subscriptions: number
          expired_subscriptions: number
          expiring_soon: number
          never_subscribed: number
          revenue_at_risk: number
        }[]
      }
      get_user_admin_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_user_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      get_user_by_stripe_customer: {
        Args: { customer_id: string } | { customer_id: string }
        Returns: {
          user_id: string
          email: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_subscription_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_data: Json
          p_stripe_event_id?: string
        }
        Returns: undefined
      }
      promote_user_to_admin: {
        Args: { user_email: string; role?: string }
        Returns: boolean
      }
      sync_stripe_subscription: {
        Args: {
          customer_email: string
          stripe_customer_id: string
          stripe_subscription_id?: string
          subscription_status?: string
          price_id?: string
        }
        Returns: Json
      }
      update_subscription_status: {
        Args:
          | {
              stripe_customer_id: string
              status: string
              tier: string
              end_date: string
            }
          | {
              target_user_id: string
              new_subscription_status: string
              new_subscription_tier: string
              new_stripe_customer_id?: string
              new_stripe_subscription_id?: string
              new_stripe_price_id?: string
              new_subscription_start_date?: string
              new_subscription_end_date?: string
            }
          | {
              target_user_id: string
              new_subscription_status: string
              new_subscription_tier: string
              new_subscription_type?: string
              new_stripe_customer_id?: string
              new_stripe_subscription_id?: string
            }
        Returns: undefined
      }
      update_user_subscription: {
        Args: {
          p_user_id: string
          p_stripe_customer_id: string
          p_subscription_id: string
          p_subscription_status: string
          p_subscription_tier: string
          p_current_period_end: string
          p_cancel_at_period_end?: boolean
        }
        Returns: undefined
      }
      user_has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

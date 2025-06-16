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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
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
          conversation_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          frequency: string | null
          id: string
          list_id: string | null
          priority: string
          status: string
          task_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          list_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          list_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string
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

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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessment_drafts: {
        Row: {
          created_at: string | null
          draft_data: Json
          evaluation_id: string | null
          id: string
          last_saved: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          draft_data?: Json
          evaluation_id?: string | null
          id?: string
          last_saved?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          draft_data?: Json
          evaluation_id?: string | null
          id?: string
          last_saved?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_drafts_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: true
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          adams_test: string | null
          age: number | null
          beighton_test: string | null
          cobb_angle: number | null
          complaints: string | null
          cranio_cervical_angle: number | null
          created_at: string | null
          height: number | null
          id: string
          lumbar_lordosis: number | null
          ober_test: string | null
          observations: string | null
          pelvic_imbalance: number | null
          pelvic_tilt: number | null
          scapular_abduction: string | null
          scapular_elevation: string | null
          shoulder_imbalance: number | null
          squat_pattern: string | null
          status: string | null
          student_id: string | null
          teacher_id: string | null
          thomas_test: string | null
          thoracic_kyphosis: number | null
          title: string
          updated_at: string | null
          walking_pattern: string | null
          weight: number | null
        }
        Insert: {
          adams_test?: string | null
          age?: number | null
          beighton_test?: string | null
          cobb_angle?: number | null
          complaints?: string | null
          cranio_cervical_angle?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          lumbar_lordosis?: number | null
          ober_test?: string | null
          observations?: string | null
          pelvic_imbalance?: number | null
          pelvic_tilt?: number | null
          scapular_abduction?: string | null
          scapular_elevation?: string | null
          shoulder_imbalance?: number | null
          squat_pattern?: string | null
          status?: string | null
          student_id?: string | null
          teacher_id?: string | null
          thomas_test?: string | null
          thoracic_kyphosis?: number | null
          title: string
          updated_at?: string | null
          walking_pattern?: string | null
          weight?: number | null
        }
        Update: {
          adams_test?: string | null
          age?: number | null
          beighton_test?: string | null
          cobb_angle?: number | null
          complaints?: string | null
          cranio_cervical_angle?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          lumbar_lordosis?: number | null
          ober_test?: string | null
          observations?: string | null
          pelvic_imbalance?: number | null
          pelvic_tilt?: number | null
          scapular_abduction?: string | null
          scapular_elevation?: string | null
          shoulder_imbalance?: number | null
          squat_pattern?: string | null
          status?: string | null
          student_id?: string | null
          teacher_id?: string | null
          thomas_test?: string | null
          thoracic_kyphosis?: number | null
          title?: string
          updated_at?: string | null
          walking_pattern?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      photos: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          evaluation_id: string | null
          id: string
          image_url: string
          is_validated: boolean | null
          measurements: Json | null
          view_type: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          image_url: string
          is_validated?: boolean | null
          measurements?: Json | null
          view_type: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          image_url?: string
          is_validated?: boolean | null
          measurements?: Json | null
          view_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          evaluation_id: string | null
          id: string
          is_shared: boolean | null
          pdf_url: string | null
          share_token: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          is_shared?: boolean | null
          pdf_url?: string | null
          share_token?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_id?: string | null
          id?: string
          is_shared?: boolean | null
          pdf_url?: string | null
          share_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          id: string
          student_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_student_to_teacher: {
        Args: { student_email: string; teacher_id: string }
        Returns: {
          message: string
          student_id: string
          success: boolean
        }[]
      }
      add_user_role: {
        Args:
          | {
              additional_permissions?: string[]
              new_role: string
              target_user_id: string
            }
          | { new_role: string; target_user_id: string }
        Returns: boolean
      }
      can_perform_action: {
        Args: { required_role: string }
        Returns: boolean
      }
      create_evaluation: {
        Args: { p_student_id?: string; p_title: string }
        Returns: {
          evaluation_id: string
          message: string
          success: boolean
        }[]
      }
      get_student_evaluations: {
        Args: { student_id?: string }
        Returns: {
          created_at: string
          id: string
          status: string
          teacher_email: string
          teacher_name: string
          title: string
        }[]
      }
      get_teacher_students: {
        Args: { teacher_id?: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          student_id: string
        }[]
      }
      get_user_profile: {
        Args: { user_id?: string }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_student: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_teacher: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_user_role: {
        Args: { check_role: string }
        Returns: boolean
      }
      remove_user_role: {
        Args: { role_to_remove: string; target_user_id: string }
        Returns: boolean
      }
      update_evaluation_status: {
        Args: { evaluation_id: string; new_status: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      user_has_permission: {
        Args: { check_permission: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "teacher" | "student"
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
  public: {
    Enums: {
      user_role: ["teacher", "student"],
    },
  },
} as const

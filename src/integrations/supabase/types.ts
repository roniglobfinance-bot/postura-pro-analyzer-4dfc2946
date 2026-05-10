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
      ai_analysis_feedback: {
        Row: {
          analysis_run_id: string | null
          complaint_analysis_id: string | null
          correction_text: string | null
          created_at: string
          id: string
          movement_analysis_id: string | null
          teacher_id: string
          was_accurate: boolean | null
        }
        Insert: {
          analysis_run_id?: string | null
          complaint_analysis_id?: string | null
          correction_text?: string | null
          created_at?: string
          id?: string
          movement_analysis_id?: string | null
          teacher_id: string
          was_accurate?: boolean | null
        }
        Update: {
          analysis_run_id?: string | null
          complaint_analysis_id?: string | null
          correction_text?: string | null
          created_at?: string
          id?: string
          movement_analysis_id?: string | null
          teacher_id?: string
          was_accurate?: boolean | null
        }
        Relationships: []
      }
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
      postural_analyses: {
        Row: {
          analysis_date: string | null
          created_at: string | null
          created_by: string
          evaluation_id: string
          exercise_protocols: Json | null
          id: string
          identified_patterns: Json | null
          overall_score: number
          recommendations: Json | null
          risk_level: string
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string | null
          created_at?: string | null
          created_by: string
          evaluation_id: string
          exercise_protocols?: Json | null
          id?: string
          identified_patterns?: Json | null
          overall_score: number
          recommendations?: Json | null
          risk_level: string
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string | null
          created_at?: string | null
          created_by?: string
          evaluation_id?: string
          exercise_protocols?: Json | null
          id?: string
          identified_patterns?: Json | null
          overall_score?: number
          recommendations?: Json | null
          risk_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postural_analyses_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_analysis_runs: {
        Row: {
          assessment_id: string
          confidence_final: number | null
          created_at: string
          dominant_vector: Json | null
          id: string
          model_version: string | null
          status: string
        }
        Insert: {
          assessment_id: string
          confidence_final?: number | null
          created_at?: string
          dominant_vector?: Json | null
          id?: string
          model_version?: string | null
          status?: string
        }
        Update: {
          assessment_id?: string
          confidence_final?: number | null
          created_at?: string
          dominant_vector?: Json | null
          id?: string
          model_version?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppa_analysis_runs_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "ppa_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_assessments: {
        Row: {
          context: Json
          created_at: string
          id: string
          pain: Json
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          pain?: Json
          status?: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          pain?: Json
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppa_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ppa_assessments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_body_composition: {
        Row: {
          assessment_id: string | null
          confidence: number | null
          created_at: string
          estimated_body_fat_pct: number | null
          estimated_lean_mass_kg: number | null
          front_photo_url: string | null
          height_cm: number | null
          id: string
          notes: string | null
          side_photo_url: string | null
          student_id: string
          weight_kg: number | null
        }
        Insert: {
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string
          estimated_body_fat_pct?: number | null
          estimated_lean_mass_kg?: number | null
          front_photo_url?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          side_photo_url?: string | null
          student_id: string
          weight_kg?: number | null
        }
        Update: {
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string
          estimated_body_fat_pct?: number | null
          estimated_lean_mass_kg?: number | null
          front_photo_url?: string | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          side_photo_url?: string | null
          student_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      ppa_clusters: {
        Row: {
          analysis_run_id: string
          cluster_types: Json | null
          id: string
          rationale: Json | null
          score: number
        }
        Insert: {
          analysis_run_id: string
          cluster_types?: Json | null
          id?: string
          rationale?: Json | null
          score?: number
        }
        Update: {
          analysis_run_id?: string
          cluster_types?: Json | null
          id?: string
          rationale?: Json | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ppa_clusters_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "ppa_analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_complaint_analyses: {
        Row: {
          ai_interpretation: string | null
          assessment_id: string | null
          created_at: string
          extracted_region: string | null
          id: string
          pattern_match: string | null
          pattern_type: string | null
          raw_text: string
          red_flags: Json | null
          student_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          assessment_id?: string | null
          created_at?: string
          extracted_region?: string | null
          id?: string
          pattern_match?: string | null
          pattern_type?: string | null
          raw_text: string
          red_flags?: Json | null
          student_id: string
        }
        Update: {
          ai_interpretation?: string | null
          assessment_id?: string | null
          created_at?: string
          extracted_region?: string | null
          id?: string
          pattern_match?: string | null
          pattern_type?: string | null
          raw_text?: string
          red_flags?: Json | null
          student_id?: string
        }
        Relationships: []
      }
      ppa_engine_decisions: {
        Row: {
          analysis_run_id: string
          created_at: string
          decided_by: string
          final_decision: Json | null
          id: string
          macro_state: string
          micro_states: Json | null
          risk_level: string
        }
        Insert: {
          analysis_run_id: string
          created_at?: string
          decided_by?: string
          final_decision?: Json | null
          id?: string
          macro_state: string
          micro_states?: Json | null
          risk_level?: string
        }
        Update: {
          analysis_run_id?: string
          created_at?: string
          decided_by?: string
          final_decision?: Json | null
          id?: string
          macro_state?: string
          micro_states?: Json | null
          risk_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppa_engine_decisions_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "ppa_analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_findings: {
        Row: {
          analysis_run_id: string
          chain: Json | null
          confidence: number | null
          direction: string | null
          finding_key: string
          id: string
          severity: number
        }
        Insert: {
          analysis_run_id: string
          chain?: Json | null
          confidence?: number | null
          direction?: string | null
          finding_key: string
          id?: string
          severity?: number
        }
        Update: {
          analysis_run_id?: string
          chain?: Json | null
          confidence?: number | null
          direction?: string | null
          finding_key?: string
          id?: string
          severity?: number
        }
        Relationships: [
          {
            foreignKeyName: "ppa_findings_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "ppa_analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_media_assets: {
        Row: {
          assessment_id: string
          capture_confidence: number | null
          created_at: string
          id: string
          image_url: string
          qa_reasons: Json | null
          qa_status: string
          side: string
          type: string
          view: string
        }
        Insert: {
          assessment_id: string
          capture_confidence?: number | null
          created_at?: string
          id?: string
          image_url: string
          qa_reasons?: Json | null
          qa_status?: string
          side?: string
          type?: string
          view: string
        }
        Update: {
          assessment_id?: string
          capture_confidence?: number | null
          created_at?: string
          id?: string
          image_url?: string
          qa_reasons?: Json | null
          qa_status?: string
          side?: string
          type?: string
          view?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppa_media_assets_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "ppa_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_metrics: {
        Row: {
          analysis_run_id: string
          confidence: number | null
          id: string
          key: string
          severity: number
          threshold_ref: number | null
          unit: string | null
          value: number
        }
        Insert: {
          analysis_run_id: string
          confidence?: number | null
          id?: string
          key: string
          severity?: number
          threshold_ref?: number | null
          unit?: string | null
          value?: number
        }
        Update: {
          analysis_run_id?: string
          confidence?: number | null
          id?: string
          key?: string
          severity?: number
          threshold_ref?: number | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ppa_metrics_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "ppa_analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_monitoring_logs: {
        Row: {
          created_at: string
          id: string
          integrity_result: string
          notes: string | null
          pain_delta: Json | null
          session_id: string | null
          student_id: string
          tns: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          integrity_result?: string
          notes?: string | null
          pain_delta?: Json | null
          session_id?: string | null
          student_id: string
          tns?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          integrity_result?: string
          notes?: string | null
          pain_delta?: Json | null
          session_id?: string | null
          student_id?: string
          tns?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ppa_monitoring_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_movement_analyses: {
        Row: {
          ai_summary: string | null
          assessment_id: string
          created_at: string
          detected_faults: Json | null
          exercise_type: string
          id: string
          keypoint_trajectory: Json | null
          rom_data: Json | null
          video_url: string | null
        }
        Insert: {
          ai_summary?: string | null
          assessment_id: string
          created_at?: string
          detected_faults?: Json | null
          exercise_type: string
          id?: string
          keypoint_trajectory?: Json | null
          rom_data?: Json | null
          video_url?: string | null
        }
        Update: {
          ai_summary?: string | null
          assessment_id?: string
          created_at?: string
          detected_faults?: Json | null
          exercise_type?: string
          id?: string
          keypoint_trajectory?: Json | null
          rom_data?: Json | null
          video_url?: string | null
        }
        Relationships: []
      }
      ppa_plan_links: {
        Row: {
          active: boolean
          analysis_run_id: string
          created_at: string
          id: string
          periodizer_plan_id: string | null
          published_at: string | null
          recommendations: Json | null
          report_html: string | null
          smart_treino_plan_id: string | null
          student_id: string
        }
        Insert: {
          active?: boolean
          analysis_run_id: string
          created_at?: string
          id?: string
          periodizer_plan_id?: string | null
          published_at?: string | null
          recommendations?: Json | null
          report_html?: string | null
          smart_treino_plan_id?: string | null
          student_id: string
        }
        Update: {
          active?: boolean
          analysis_run_id?: string
          created_at?: string
          id?: string
          periodizer_plan_id?: string | null
          published_at?: string | null
          recommendations?: Json | null
          report_html?: string | null
          smart_treino_plan_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppa_plan_links_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "ppa_analysis_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ppa_plan_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_protocols_library: {
        Row: {
          category: string
          contraindications: Json | null
          created_at: string
          id: string
          protocol_key: string
          steps: Json
          version: number
        }
        Insert: {
          category: string
          contraindications?: Json | null
          created_at?: string
          id?: string
          protocol_key: string
          steps?: Json
          version?: number
        }
        Update: {
          category?: string
          contraindications?: Json | null
          created_at?: string
          id?: string
          protocol_key?: string
          steps?: Json
          version?: number
        }
        Relationships: []
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
      add_user_role:
        | {
            Args: { new_role: string; target_user_id: string }
            Returns: boolean
          }
        | {
            Args: {
              additional_permissions?: string[]
              new_role: string
              target_user_id: string
            }
            Returns: boolean
          }
      add_user_role_simple: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      can_perform_action: { Args: { required_role: string }; Returns: boolean }
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
      is_student: { Args: { user_id?: string }; Returns: boolean }
      is_teacher: { Args: { user_id?: string }; Returns: boolean }
      is_user_role: { Args: { check_role: string }; Returns: boolean }
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
      user_role: "teacher" | "student" | "admin"
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
      user_role: ["teacher", "student", "admin"],
    },
  },
} as const

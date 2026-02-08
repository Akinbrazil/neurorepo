// NeuroScope VR - Supabase Database Types

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          crp_number: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          crp_number?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          crp_number?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          therapist_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          medical_notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      dass21_scores: {
        Row: {
          id: string;
          patient_id: string;
          therapist_id: string;
          depression_score: number;
          anxiety_score: number;
          stress_score: number;
          total_score: number;
          depression_severity: string;
          anxiety_severity: string;
          stress_severity: string;
          assessment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          therapist_id: string;
          depression_score: number;
          anxiety_score: number;
          stress_score: number;
          total_score: number;
          depression_severity: string;
          anxiety_severity: string;
          stress_severity: string;
          assessment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          therapist_id?: string;
          depression_score?: number;
          anxiety_score?: number;
          stress_score?: number;
          total_score?: number;
          depression_severity?: string;
          anxiety_severity?: string;
          stress_severity?: string;
          assessment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          therapist_id: string;
          session_number: number;
          environment_type: string;
          duration_minutes: number | null;
          intensity_level: number;
          status: string;
          started_at: string | null;
          ended_at: string | null;
          patient_comfort_checks: number;
          therapist_notes: string | null;
          patient_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          therapist_id: string;
          session_number: number;
          environment_type?: string;
          duration_minutes?: number | null;
          intensity_level?: number;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          patient_comfort_checks?: number;
          therapist_notes?: string | null;
          patient_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          therapist_id?: string;
          session_number?: number;
          environment_type?: string;
          duration_minutes?: number | null;
          intensity_level?: number;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          patient_comfort_checks?: number;
          therapist_notes?: string | null;
          patient_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_realtime: {
        Row: {
          id: string;
          session_id: string;
          therapist_id: string;
          patient_id: string;
          current_intensity: number;
          is_mic_on: boolean;
          therapist_message: string | null;
          patient_comfort_status: string;
          patient_gaze_x: number | null;
          patient_gaze_y: number | null;
          patient_gaze_z: number | null;
          last_comfort_check_at: string | null;
          is_active: boolean;
          session_started_at: string;
          last_updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          therapist_id: string;
          patient_id: string;
          current_intensity?: number;
          is_mic_on?: boolean;
          therapist_message?: string | null;
          patient_comfort_status?: string;
          patient_gaze_x?: number | null;
          patient_gaze_y?: number | null;
          patient_gaze_z?: number | null;
          last_comfort_check_at?: string | null;
          is_active?: boolean;
          session_started_at?: string;
          last_updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          therapist_id?: string;
          patient_id?: string;
          current_intensity?: number;
          is_mic_on?: boolean;
          therapist_message?: string | null;
          patient_comfort_status?: string;
          patient_gaze_x?: number | null;
          patient_gaze_y?: number | null;
          patient_gaze_z?: number | null;
          last_comfort_check_at?: string | null;
          is_active?: boolean;
          session_started_at?: string;
          last_updated_at?: string;
        };
      };
      comfort_check_events: {
        Row: {
          id: string;
          session_id: string;
          patient_id: string;
          check_type: string;
          comfort_level: string;
          gaze_duration_ms: number | null;
          environment_at_check: string;
          intensity_at_check: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          patient_id: string;
          check_type?: string;
          comfort_level: string;
          gaze_duration_ms?: number | null;
          environment_at_check: string;
          intensity_at_check: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          patient_id?: string;
          check_type?: string;
          comfort_level?: string;
          gaze_duration_ms?: number | null;
          environment_at_check?: string;
          intensity_at_check?: number;
          created_at?: string;
        };
      };
      voice_channels: {
        Row: {
          id: string;
          session_id: string;
          therapist_id: string;
          patient_id: string;
          therapist_offer: any | null;
          patient_answer: any | null;
          ice_candidates: any;
          is_connected: boolean;
          therapist_joined_at: string | null;
          patient_joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          therapist_id: string;
          patient_id: string;
          therapist_offer?: any | null;
          patient_answer?: any | null;
          ice_candidates?: any;
          is_connected?: boolean;
          therapist_joined_at?: string | null;
          patient_joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          therapist_id?: string;
          patient_id?: string;
          therapist_offer?: any | null;
          patient_answer?: any | null;
          ice_candidates?: any;
          is_connected?: boolean;
          therapist_joined_at?: string | null;
          patient_joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      patient_with_dass21: {
        Row: {
          id: string;
          therapist_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          medical_notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          depression_score: number | null;
          anxiety_score: number | null;
          stress_score: number | null;
          total_score: number | null;
          depression_severity: string | null;
          anxiety_severity: string | null;
          stress_severity: string | null;
          last_assessment_date: string | null;
        };
      };
      session_with_patient: {
        Row: {
          id: string;
          patient_id: string;
          therapist_id: string;
          session_number: number;
          environment_type: string;
          duration_minutes: number | null;
          intensity_level: number;
          status: string;
          started_at: string | null;
          ended_at: string | null;
          patient_comfort_checks: number;
          therapist_notes: string | null;
          patient_feedback: string | null;
          created_at: string;
          updated_at: string;
          patient_name: string | null;
          patient_email: string | null;
          patient_phone: string | null;
        };
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      calculate_dass21_severity: {
        Args: {
          p_depression: number;
          p_anxiety: number;
          p_stress: number;
        };
        Returns: {
          depression_severity: string;
          anxiety_severity: string;
          stress_severity: string;
          total_score: number;
        };
      };
      start_session: {
        Args: {
          p_session_id: string;
        };
        Returns: void;
      };
      end_session: {
        Args: {
          p_session_id: string;
        };
        Returns: void;
      };
      record_comfort_check: {
        Args: {
          p_session_id: string;
          p_patient_id: string;
          p_comfort_level: string;
          p_gaze_duration_ms?: number;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

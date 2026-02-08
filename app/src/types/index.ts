// NeuroScope VR - Type Definitions

// User/Therapist Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  crp_number?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Patient
export interface Patient {
  id: string;
  therapist_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// DASS-21 Scores
export interface DASS21Scores {
  id: string;
  patient_id: string;
  therapist_id: string;
  depression_score: number;
  anxiety_score: number;
  stress_score: number;
  total_score: number;
  depression_severity: 'Normal' | 'Leve' | 'Moderado' | 'Grave' | 'Extremamente Grave';
  anxiety_severity: 'Normal' | 'Leve' | 'Moderado' | 'Grave' | 'Extremamente Grave';
  stress_severity: 'Normal' | 'Leve' | 'Moderado' | 'Grave' | 'Extremamente Grave';
  assessment_date: string;
  notes?: string;
  created_at: string;
}

// Session
export interface Session {
  id: string;
  patient_id: string;
  therapist_id: string;
  session_number: number;
  environment_type: 'floresta' | 'praia' | 'sala-aula' | 'breathing-temple' | 'sunrise-meadow' | 'sensory-void';
  duration_minutes?: number;
  intensity_level: 1 | 2 | 3;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  patient_comfort_checks: number;
  therapist_notes?: string;
  patient_feedback?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
}

// Real-time Session Sync
export interface SessionRealtime {
  id: string;
  session_id: string;
  therapist_id: string;
  patient_id: string;
  current_intensity: 1 | 2 | 3;
  is_mic_on: boolean;
  therapist_message?: string;
  patient_comfort_status: 'comfortable' | 'neutral' | 'uncomfortable';
  patient_gaze_x?: number;
  patient_gaze_y?: number;
  patient_gaze_z?: number;
  last_comfort_check_at?: string;
  is_active: boolean;
  session_started_at: string;
  last_updated_at: string;
}

// Comfort Check Event
export interface ComfortCheckEvent {
  id: string;
  session_id: string;
  patient_id: string;
  check_type: 'gaze' | 'controller' | 'voice';
  comfort_level: 'comfortable' | 'neutral' | 'uncomfortable';
  gaze_duration_ms?: number;
  environment_at_check: string;
  intensity_at_check: number;
  created_at: string;
}

// Voice Channel (WebRTC)
export interface VoiceChannel {
  id: string;
  session_id: string;
  therapist_id: string;
  patient_id: string;
  therapist_offer?: RTCSessionDescriptionInit;
  patient_answer?: RTCSessionDescriptionInit;
  ice_candidates: RTCIceCandidate[];
  is_connected: boolean;
  therapist_joined_at?: string;
  patient_joined_at?: string;
  created_at: string;
  updated_at: string;
}

// Patient with latest DASS-21 (view)
export interface PatientWithDASS21 extends Patient {
  depression_score?: number;
  anxiety_score?: number;
  stress_score?: number;
  total_score?: number;
  depression_severity?: string;
  anxiety_severity?: string;
  stress_severity?: string;
  last_assessment_date?: string;
}

// Application State
export type AppView = 'landing' | 'login' | 'dashboard' | 'session-control' | 'vr-environment' | 'patient-register' | 'dass21-form' | 'therapist-demo' | 'patient-demo' | 'vr-environments';

export interface AppState {
  currentView: AppView;
  user: Profile | null;
  selectedPatient: PatientWithDASS21 | null;
  selectedSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

// VR Environment Settings
export interface VREnvironmentSettings {
  intensity: 1 | 2 | 3;
  environment: 'floresta' | 'praia';
  isMicActive: boolean;
  therapistVoiceVolume: number;
  natureSoundsVolume: number;
}

// Gaze Data for Comfort Check
export interface GazeData {
  x: number;
  y: number;
  z: number;
  isOnComfortIcon: boolean;
  durationMs: number;
}

// WebRTC State
export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

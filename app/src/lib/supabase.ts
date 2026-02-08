// NeuroScope VR - Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Profile, Patient, DASS21Scores, Session, SessionRealtime, VoiceChannel } from '@/types';

// These would be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Patient helpers
export const getPatients = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('patient_with_dass21')
    .select('*')
    .eq('therapist_id', therapistId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getPatientById = async (patientId: string) => {
  const { data, error } = await supabase
    .from('patient_with_dass21')
    .select('*')
    .eq('id', patientId)
    .single();
  return { data, error };
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();
  return { data, error };
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', patientId)
    .select()
    .single();
  return { data, error };
};

// DASS-21 helpers
export const getDASS21Scores = async (patientId: string) => {
  const { data, error } = await supabase
    .from('dass21_scores')
    .select('*')
    .eq('patient_id', patientId)
    .order('assessment_date', { ascending: false });
  return { data, error };
};

export const createDASS21Score = async (score: Omit<DASS21Scores, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('dass21_scores')
    .insert(score)
    .select()
    .single();
  return { data, error };
};

// Calculate DASS-21 severity levels
export const calculateDASS21Severity = (
  depression: number,
  anxiety: number,
  stress: number
) => {
  const getDepressionSeverity = (score: number): DASS21Scores['depression_severity'] => {
    if (score <= 4) return 'Normal';
    if (score <= 6) return 'Leve';
    if (score <= 10) return 'Moderado';
    if (score <= 13) return 'Grave';
    return 'Extremamente Grave';
  };

  const getAnxietySeverity = (score: number): DASS21Scores['anxiety_severity'] => {
    if (score <= 3) return 'Normal';
    if (score <= 5) return 'Leve';
    if (score <= 7) return 'Moderado';
    if (score <= 9) return 'Grave';
    return 'Extremamente Grave';
  };

  const getStressSeverity = (score: number): DASS21Scores['stress_severity'] => {
    if (score <= 7) return 'Normal';
    if (score <= 9) return 'Leve';
    if (score <= 12) return 'Moderado';
    if (score <= 16) return 'Grave';
    return 'Extremamente Grave';
  };

  return {
    depression_severity: getDepressionSeverity(depression),
    anxiety_severity: getAnxietySeverity(anxiety),
    stress_severity: getStressSeverity(stress),
    total_score: depression + anxiety + stress,
  };
};

// Session helpers
export const getSessions = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('session_with_patient')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getPatientSessions = async (patientId: string) => {
  const { data, error } = await supabase
    .from('session_with_patient')
    .select('*')
    .eq('patient_id', patientId)
    .order('session_number', { ascending: true });
  return { data, error };
};

export const createSession = async (session: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'patient_comfort_checks'>) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single();
  return { data, error };
};

export const updateSession = async (sessionId: string, updates: Partial<Session>) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};

// Session Realtime helpers
export const getSessionRealtime = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('session_realtime')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  return { data, error };
};

export const updateSessionRealtime = async (sessionId: string, updates: Partial<SessionRealtime>) => {
  const { data, error } = await supabase
    .from('session_realtime')
    .update({ ...updates, last_updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .select()
    .single();
  return { data, error };
};

// Subscribe to session realtime changes
export const subscribeToSessionRealtime = (
  sessionId: string,
  callback: (payload: { new: SessionRealtime; old: SessionRealtime | null }) => void
) => {
  return supabase
    .channel(`session_realtime:${sessionId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'session_realtime',
        filter: `session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
};

// Comfort check helpers
export const recordComfortCheck = async (
  sessionId: string,
  patientId: string,
  comfortLevel: 'comfortable' | 'neutral' | 'uncomfortable',
  gazeDurationMs?: number
) => {
  const { data, error } = await supabase.rpc('record_comfort_check', {
    p_session_id: sessionId,
    p_patient_id: patientId,
    p_comfort_level: comfortLevel,
    p_gaze_duration_ms: gazeDurationMs,
  });
  return { data, error };
};

// Voice channel helpers
export const getVoiceChannel = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('voice_channels')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  return { data, error };
};

export const createVoiceChannel = async (voiceChannel: Omit<VoiceChannel, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('voice_channels')
    .insert(voiceChannel)
    .select()
    .single();
  return { data, error };
};

export const updateVoiceChannel = async (channelId: string, updates: Partial<VoiceChannel>) => {
  const { data, error } = await supabase
    .from('voice_channels')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', channelId)
    .select()
    .single();
  return { data, error };
};

// Subscribe to voice channel changes
export const subscribeToVoiceChannel = (
  sessionId: string,
  callback: (payload: { new: VoiceChannel; old: VoiceChannel | null }) => void
) => {
  return supabase
    .channel(`voice_channels:${sessionId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'voice_channels',
        filter: `session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
};

-- NeuroScope VR Platform - Supabase Database Schema
-- This schema enables real-time synchronization between therapist dashboard and patient VR environment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Therapist Information)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    crp_number VARCHAR(20), -- Conselho Regional de Psicologia
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Patient policies
CREATE POLICY "Therapists can view own patients" ON patients
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own patients" ON patients
    FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own patients" ON patients
    FOR DELETE USING (auth.uid() = therapist_id);

-- ============================================
-- DASS-21 SCORES TABLE (Depression, Anxiety, Stress Scale)
-- ============================================
CREATE TABLE dass21_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- DASS-21 Questions (1-3: Depression, 4-6: Anxiety, 7-9: Stress)
    depression_score INTEGER NOT NULL CHECK (depression_score >= 0 AND depression_score <= 21),
    anxiety_score INTEGER NOT NULL CHECK (anxiety_score >= 0 AND anxiety_score <= 21),
    stress_score INTEGER NOT NULL CHECK (stress_score >= 0 AND stress_score <= 21),
    total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 63),
    -- Severity classifications
    depression_severity VARCHAR(20) NOT NULL, -- Normal, Mild, Moderate, Severe, Extremely Severe
    anxiety_severity VARCHAR(20) NOT NULL,
    stress_severity VARCHAR(20) NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on dass21_scores
ALTER TABLE dass21_scores ENABLE ROW LEVEL SECURITY;

-- DASS-21 policies
CREATE POLICY "Therapists can view own patients' DASS-21 scores" ON dass21_scores
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create DASS-21 scores" ON dass21_scores
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    environment_type VARCHAR(50) NOT NULL DEFAULT 'floresta', -- 'floresta', 'praia' or 'sala-aula'
    duration_minutes INTEGER,
    intensity_level INTEGER DEFAULT 1 CHECK (intensity_level >= 1 AND intensity_level <= 3),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    patient_comfort_checks INTEGER DEFAULT 0,
    therapist_notes TEXT,
    patient_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Therapists can view own sessions" ON sessions
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = therapist_id);

-- ============================================
-- SESSION_REALTIME TABLE (Real-time sync between therapist and patient)
-- ============================================
CREATE TABLE session_realtime (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Control fields (set by therapist)
    current_intensity INTEGER DEFAULT 1 CHECK (current_intensity >= 1 AND current_intensity <= 3),
    is_mic_on BOOLEAN DEFAULT false,
    therapist_message TEXT, -- For text-based communication if needed
    
    -- Status fields (updated by patient VR app)
    patient_comfort_status VARCHAR(20) DEFAULT 'neutral', -- comfortable, neutral, uncomfortable
    patient_gaze_x FLOAT,
    patient_gaze_y FLOAT,
    patient_gaze_z FLOAT,
    last_comfort_check_at TIMESTAMP WITH TIME ZONE,
    
    -- Session state
    is_active BOOLEAN DEFAULT true,
    session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on session_realtime
ALTER TABLE session_realtime ENABLE ROW LEVEL SECURITY;

-- Session realtime policies
CREATE POLICY "Therapists can manage session realtime" ON session_realtime
    FOR ALL USING (auth.uid() = therapist_id);

-- Enable realtime for session_realtime table
ALTER PUBLICATION supabase_realtime ADD TABLE session_realtime;

-- Trigger to update last_updated_at
CREATE OR REPLACE FUNCTION update_session_realtime_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_realtime_last_updated
    BEFORE UPDATE ON session_realtime
    FOR EACH ROW EXECUTE FUNCTION update_session_realtime_timestamp();

-- ============================================
-- COMFORT CHECK EVENTS TABLE (Audit log)
-- ============================================
CREATE TABLE comfort_check_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    check_type VARCHAR(20) NOT NULL DEFAULT 'gaze', -- gaze, controller, voice
    comfort_level VARCHAR(20) NOT NULL, -- comfortable, neutral, uncomfortable
    gaze_duration_ms INTEGER, -- How long the gaze was held (for gaze-based checks)
    environment_at_check VARCHAR(50),
    intensity_at_check INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on comfort_check_events
ALTER TABLE comfort_check_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view comfort check events" ON comfort_check_events
    FOR SELECT USING (auth.uid() IN (
        SELECT therapist_id FROM sessions WHERE id = session_id
    ));

-- ============================================
-- VOICE CHANNELS TABLE (WebRTC signaling)
-- ============================================
CREATE TABLE voice_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- WebRTC signaling data
    therapist_offer JSONB,
    patient_answer JSONB,
    ice_candidates JSONB DEFAULT '[]'::jsonb,
    
    -- Channel state
    is_connected BOOLEAN DEFAULT false,
    therapist_joined_at TIMESTAMP WITH TIME ZONE,
    patient_joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on voice_channels
ALTER TABLE voice_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can manage voice channels" ON voice_channels
    FOR ALL USING (auth.uid() = therapist_id OR auth.uid() = patient_id);

-- Enable realtime for voice_channels
ALTER PUBLICATION supabase_realtime ADD TABLE voice_channels;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_patients_therapist_id ON patients(therapist_id);
CREATE INDEX idx_dass21_scores_patient_id ON dass21_scores(patient_id);
CREATE INDEX idx_dass21_scores_assessment_date ON dass21_scores(assessment_date);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_therapist_id ON sessions(therapist_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_session_realtime_session_id ON session_realtime(session_id);
CREATE INDEX idx_session_realtime_is_active ON session_realtime(is_active);
CREATE INDEX idx_comfort_check_events_session_id ON comfort_check_events(session_id);
CREATE INDEX idx_voice_channels_session_id ON voice_channels(session_id);

-- ============================================
-- VIEWS FOR CONVENIENCE
-- ============================================

-- View: Patient with latest DASS-21 scores
CREATE VIEW patient_with_dass21 AS
SELECT 
    p.*,
    d.depression_score,
    d.anxiety_score,
    d.stress_score,
    d.total_score,
    d.depression_severity,
    d.anxiety_severity,
    d.stress_severity,
    d.assessment_date as last_assessment_date
FROM patients p
LEFT JOIN LATERAL (
    SELECT * FROM dass21_scores 
    WHERE patient_id = p.id 
    ORDER BY assessment_date DESC 
    LIMIT 1
) d ON true;

-- View: Session with patient info
CREATE VIEW session_with_patient AS
SELECT 
    s.*,
    p.full_name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone
FROM sessions s
JOIN patients p ON s.patient_id = p.id;

-- ============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to calculate DASS-21 severity
CREATE OR REPLACE FUNCTION calculate_dass21_severity(
    p_depression INTEGER,
    p_anxiety INTEGER,
    p_stress INTEGER
)
RETURNS TABLE (
    depression_severity VARCHAR(20),
    anxiety_severity VARCHAR(20),
    stress_severity VARCHAR(20),
    total_score INTEGER
) AS $$
DECLARE
    v_dep_sev VARCHAR(20);
    v_anx_sev VARCHAR(20);
    v_str_sev VARCHAR(20);
BEGIN
    -- Depression severity
    v_dep_sev := CASE
        WHEN p_depression <= 4 THEN 'Normal'
        WHEN p_depression <= 6 THEN 'Leve'
        WHEN p_depression <= 10 THEN 'Moderado'
        WHEN p_depression <= 13 THEN 'Grave'
        ELSE 'Extremamente Grave'
    END;
    
    -- Anxiety severity
    v_anx_sev := CASE
        WHEN p_anxiety <= 3 THEN 'Normal'
        WHEN p_anxiety <= 5 THEN 'Leve'
        WHEN p_anxiety <= 7 THEN 'Moderado'
        WHEN p_anxiety <= 9 THEN 'Grave'
        ELSE 'Extremamente Grave'
    END;
    
    -- Stress severity
    v_str_sev := CASE
        WHEN p_stress <= 7 THEN 'Normal'
        WHEN p_stress <= 9 THEN 'Leve'
        WHEN p_stress <= 12 THEN 'Moderado'
        WHEN p_stress <= 16 THEN 'Grave'
        ELSE 'Extremamente Grave'
    END;
    
    RETURN QUERY SELECT v_dep_sev, v_anx_sev, v_str_sev, p_depression + p_anxiety + p_stress;
END;
$$ LANGUAGE plpgsql;

-- Function to start a session
CREATE OR REPLACE FUNCTION start_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update session status
    UPDATE sessions 
    SET status = 'in_progress', 
        started_at = NOW(),
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Create or update realtime record
    INSERT INTO session_realtime (session_id, therapist_id, patient_id, is_active)
    SELECT 
        s.id,
        s.therapist_id,
        s.patient_id,
        true
    FROM sessions s
    WHERE s.id = p_session_id
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        is_active = true,
        session_started_at = NOW(),
        last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to end a session
CREATE OR REPLACE FUNCTION end_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update session status
    UPDATE sessions 
    SET status = 'completed', 
        ended_at = NOW(),
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Deactivate realtime record
    UPDATE session_realtime 
    SET is_active = false,
        last_updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record comfort check
CREATE OR REPLACE FUNCTION record_comfort_check(
    p_session_id UUID,
    p_patient_id UUID,
    p_comfort_level VARCHAR(20),
    p_gaze_duration_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_intensity INTEGER;
    v_environment VARCHAR(50);
BEGIN
    -- Get current session settings
    SELECT current_intensity, 'floresta' INTO v_intensity, v_environment
    FROM session_realtime 
    WHERE session_id = p_session_id;
    
    -- Insert comfort check event
    INSERT INTO comfort_check_events (
        session_id, patient_id, comfort_level, 
        gaze_duration_ms, intensity_at_check, environment_at_check
    ) VALUES (
        p_session_id, p_patient_id, p_comfort_level,
        p_gaze_duration_ms, v_intensity, v_environment
    );
    
    -- Update session realtime
    UPDATE session_realtime 
    SET 
        patient_comfort_status = p_comfort_level,
        last_comfort_check_at = NOW(),
        last_updated_at = NOW()
    WHERE session_id = p_session_id;
    
    -- Increment comfort check counter in sessions
    UPDATE sessions 
    SET patient_comfort_checks = patient_comfort_checks + 1
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

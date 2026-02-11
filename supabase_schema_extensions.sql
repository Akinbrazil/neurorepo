-- NeuroScope VR Platform - Supabase Schema Extensions
-- Vision B: Multi-tenant SaaS & CID-10 Support

-- ============================================
-- CLINICS TABLE (Multi-tenant SaaS)
-- ============================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj_nif VARCHAR(50) UNIQUE NOT NULL,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'Basic', -- 'Basic', 'Premium', 'Enterprise'
    country VARCHAR(50) NOT NULL DEFAULT 'Brasil', -- 'Brasil', 'Portugal'
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on clinics
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Clinic policies
CREATE POLICY "Admins can manage clinics" ON clinics
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Managers can view own clinic" ON clinics
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM managers WHERE clinic_id = id
    ));

-- ============================================
-- MANAGERS TABLE (Clinic Administrators)
-- ============================================
CREATE TABLE managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Manager', -- 'Admin', 'Manager', 'Supervisor'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, clinic_id)
);

-- Enable RLS on managers
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

-- Manager policies
CREATE POLICY "Admins can manage managers" ON managers
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Managers can view own record" ON managers
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- EXTEND PROFILES TABLE
-- ============================================
-- Add clinic_id and role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'therapist'; -- 'therapist', 'admin', 'manager'

-- Update existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view clinic therapists" ON profiles
    FOR SELECT USING (
        clinic_id IS NOT NULL AND 
        auth.uid() IN (
            SELECT user_id FROM managers WHERE clinic_id = profiles.clinic_id
        )
    );

-- ============================================
-- EXTEND PATIENTS TABLE - CID-10 Support
-- ============================================
-- Add CID-10 code and status to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cid_code VARCHAR(10); -- e.g., 'F41.1' for Generalized Anxiety
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cid_description VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Em tratamento'; -- 'Em tratamento', 'Alta', 'Pausado'
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age_category VARCHAR(20); -- 'Criança', 'Adolescente', 'Adulto'

-- Function to auto-set age category
CREATE OR REPLACE FUNCTION calculate_age_category(birth_date DATE)
RETURNS VARCHAR(20) AS $$
DECLARE
    age INTEGER;
BEGIN
    IF birth_date IS NULL THEN
        RETURN 'Adulto';
    END IF;
    
    age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
    
    IF age <= 12 THEN
        RETURN 'Criança';
    ELSIF age <= 18 THEN
        RETURN 'Adolescente';
    ELSE
        RETURN 'Adulto';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update age category
CREATE OR REPLACE FUNCTION update_patient_age_category()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age_category := calculate_age_category(NEW.date_of_birth);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_age_category
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_patient_age_category();

-- ============================================
-- SESSION LOGS TABLE (Business Intelligence)
-- ============================================
CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'session_started', 'session_ended', 'comfort_update', 'environment_changed'
    environment_type VARCHAR(50),
    intensity_level INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on session_logs
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Session logs policies
CREATE POLICY "Admins can view all logs" ON session_logs
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Therapists can view own logs" ON session_logs
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Managers can view clinic logs" ON session_logs
    FOR SELECT USING (
        clinic_id IS NOT NULL AND 
        auth.uid() IN (
            SELECT user_id FROM managers WHERE clinic_id = session_logs.clinic_id
        )
    );

-- ============================================
-- VIEWS FOR MANAGER DASHBOARD
-- ============================================

-- View: Clinic productivity metrics
CREATE VIEW clinic_productivity AS
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    COUNT(DISTINCT p.id) as total_patients,
    COUNT(DISTINCT prof.id) as total_therapists,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'in_progress' THEN s.id END) as active_sessions
FROM clinics c
LEFT JOIN profiles prof ON prof.clinic_id = c.id
LEFT JOIN patients p ON p.therapist_id = prof.id
LEFT JOIN sessions s ON s.therapist_id = prof.id
GROUP BY c.id, c.name;

-- View: Therapist productivity
CREATE VIEW therapist_productivity AS
SELECT 
    prof.id as therapist_id,
    prof.full_name as therapist_name,
    prof.clinic_id,
    c.name as clinic_name,
    COUNT(DISTINCT p.id) as total_patients,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN p.status = 'Em tratamento' THEN p.id END) as active_patients
FROM profiles prof
LEFT JOIN clinics c ON c.id = prof.clinic_id
LEFT JOIN patients p ON p.therapist_id = prof.id
LEFT JOIN sessions s ON s.therapist_id = prof.id
GROUP BY prof.id, prof.full_name, prof.clinic_id, c.name;

-- View: Patients by pathology (CID-10)
CREATE VIEW patients_by_pathology AS
SELECT 
    cid_code,
    cid_description,
    COUNT(*) as patient_count,
    COUNT(CASE WHEN status = 'Em tratamento' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'Alta' THEN 1 END) as discharged_count,
    AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) as average_age
FROM patients
WHERE cid_code IS NOT NULL
GROUP BY cid_code, cid_description;

-- ============================================
-- FUNCTIONS FOR ADVANCED FILTERING
-- ============================================

-- Function to get patients by pathology
CREATE OR REPLACE FUNCTION get_patients_by_pathology(
    p_therapist_id UUID,
    p_cid_prefix VARCHAR(10)
)
RETURNS TABLE (
    patient_id UUID,
    full_name VARCHAR(255),
    cid_code VARCHAR(10),
    cid_description VARCHAR(255),
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.cid_code,
        p.cid_description,
        p.status
    FROM patients p
    WHERE p.therapist_id = p_therapist_id
    AND p.cid_code LIKE p_cid_prefix || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get patients by status
CREATE OR REPLACE FUNCTION get_patients_by_status(
    p_therapist_id UUID,
    p_status VARCHAR(20)
)
RETURNS TABLE (
    patient_id UUID,
    full_name VARCHAR(255),
    status VARCHAR(20),
    age_category VARCHAR(20),
    last_assessment_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.status,
        p.age_category,
        MAX(d.assessment_date) as last_assessment_date
    FROM patients p
    LEFT JOIN dass21_scores d ON d.patient_id = p.id
    WHERE p.therapist_id = p_therapist_id
    AND p.status = p_status
    GROUP BY p.id, p.full_name, p.status, p.age_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get manager dashboard data
CREATE OR REPLACE FUNCTION get_manager_dashboard(p_clinic_id UUID)
RETURNS TABLE (
    total_therapists BIGINT,
    total_patients BIGINT,
    active_sessions BIGINT,
    sessions_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT prof.id) as total_therapists,
        COUNT(DISTINCT p.id) as total_patients,
        COUNT(DISTINCT CASE WHEN s.status = 'in_progress' THEN s.id END) as active_sessions,
        COUNT(DISTINCT CASE WHEN s.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN s.id END) as sessions_this_month
    FROM clinics c
    LEFT JOIN profiles prof ON prof.clinic_id = c.id
    LEFT JOIN patients p ON p.therapist_id = prof.id
    LEFT JOIN sessions s ON s.therapist_id = prof.id
    WHERE c.id = p_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patients_cid_code ON patients(cid_code);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_managers_clinic ON managers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_clinic ON session_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_therapist ON session_logs(therapist_id);

-- ============================================
-- REALTIME ENABLEMENT
-- ============================================
-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE session_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE clinics;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managers_updated_at
    BEFORE UPDATE ON managers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- KingstonConnect Database Schema
-- Migration: 001_initial_schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- Custom Types
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'hod', 'principal');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE event_category AS ENUM ('exam', 'holiday', 'event', 'activity', 'deadline');
CREATE TYPE event_scope AS ENUM ('college', 'department', 'section');
CREATE TYPE content_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- ============================================
-- Departments Table
-- ============================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    hod_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Profiles Table (extends auth.users)
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    register_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'student',
    department_id UUID REFERENCES departments(id),
    year INTEGER CHECK (year >= 1 AND year <= 4),
    section TEXT,
    pin_hash TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for HOD reference
ALTER TABLE departments 
ADD CONSTRAINT fk_hod 
FOREIGN KEY (hod_id) REFERENCES profiles(id);

-- ============================================
-- Sections Table
-- ============================================

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    section_name TEXT NOT NULL,
    class_teacher_id UUID REFERENCES profiles(id),
    student_count INTEGER DEFAULT 0,
    UNIQUE(department_id, year, section_name)
);

-- ============================================
-- Attendance Table
-- ============================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    subject TEXT,
    marked_by UUID REFERENCES profiles(id),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, subject)
);

CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ============================================
-- Tests Table
-- ============================================

CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    department_id UUID REFERENCES departments(id),
    year INTEGER NOT NULL,
    section TEXT NOT NULL,
    subjects JSONB NOT NULL DEFAULT '[]',
    total_marks INTEGER NOT NULL,
    created_by UUID REFERENCES profiles(id),
    status content_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tests_dept ON tests(department_id, year, section);

-- ============================================
-- Results Table
-- ============================================

CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    marks JSONB NOT NULL DEFAULT '{}',
    total INTEGER,
    percentage DECIMAL(5,2),
    grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(test_id, student_id)
);

CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_test ON results(test_id);

-- ============================================
-- Calendar Events Table
-- ============================================

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    end_date DATE,
    category event_category NOT NULL,
    scope event_scope NOT NULL DEFAULT 'college',
    scope_id UUID,
    color TEXT DEFAULT '#6366f1',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_date ON calendar_events(date);
CREATE INDEX idx_calendar_scope ON calendar_events(scope, scope_id);

-- ============================================
-- Notes Table
-- ============================================

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    department_id UUID REFERENCES departments(id),
    year INTEGER,
    section TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    status content_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_dept ON notes(department_id, year, section);
CREATE INDEX idx_notes_status ON notes(status);

-- ============================================
-- Note Chunks for RAG
-- ============================================

CREATE TABLE note_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INTEGER,
    embedding vector(384)
);

CREATE INDEX idx_note_chunks_embedding ON note_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- Chats Table
-- ============================================

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chats_participants ON chats USING GIN(participants);

-- ============================================
-- Messages Table
-- ============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    read_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);

-- ============================================
-- Announcements Table
-- ============================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    scope event_scope NOT NULL DEFAULT 'college',
    scope_id UUID,
    pinned BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_scope ON announcements(scope, scope_id);
CREATE INDEX idx_announcements_pinned ON announcements(pinned, created_at DESC);

-- ============================================
-- Notifications Table
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ============================================
-- Audit Logs Table
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's department
CREATE OR REPLACE FUNCTION get_user_department()
RETURNS UUID AS $$
    SELECT department_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's year
CREATE OR REPLACE FUNCTION get_user_year()
RETURNS INTEGER AS $$
    SELECT year FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's section
CREATE OR REPLACE FUNCTION get_user_section()
RETURNS TEXT AS $$
    SELECT section FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RAG Match Function
-- ============================================

CREATE OR REPLACE FUNCTION match_note_chunks(
    query_embedding vector(384),
    match_count INT DEFAULT 5,
    filter_dept UUID DEFAULT NULL,
    filter_year INT DEFAULT NULL,
    filter_section TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    note_id UUID,
    content TEXT,
    page_number INT,
    note_title TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nc.id,
        nc.note_id,
        nc.content,
        nc.page_number,
        n.title as note_title,
        1 - (nc.embedding <=> query_embedding) as similarity
    FROM note_chunks nc
    JOIN notes n ON nc.note_id = n.id
    WHERE n.status = 'approved'
        AND (filter_dept IS NULL OR n.department_id = filter_dept)
        AND (filter_year IS NULL OR n.year = filter_year)
        AND (filter_section IS NULL OR n.section = filter_section)
    ORDER BY nc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

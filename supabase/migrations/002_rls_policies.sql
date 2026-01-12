-- ============================================
-- KingstonConnect Row Level Security Policies
-- Migration: 002_rls_policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can view profiles in their department
CREATE POLICY "profiles_select_department" ON profiles
    FOR SELECT USING (
        department_id = get_user_department()
        AND get_user_role() IN ('teacher', 'hod', 'principal')
    );

-- Principal can view all profiles
CREATE POLICY "profiles_select_principal" ON profiles
    FOR SELECT USING (get_user_role() = 'principal');

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- HOD can update profiles in their department
CREATE POLICY "profiles_update_hod" ON profiles
    FOR UPDATE USING (
        get_user_role() = 'hod' 
        AND department_id = get_user_department()
    );

-- Principal can update any profile
CREATE POLICY "profiles_update_principal" ON profiles
    FOR UPDATE USING (get_user_role() = 'principal');

-- ============================================
-- DEPARTMENTS POLICIES
-- ============================================

-- Everyone can read departments
CREATE POLICY "departments_select_all" ON departments
    FOR SELECT USING (true);

-- Only principal can modify departments
CREATE POLICY "departments_all_principal" ON departments
    FOR ALL USING (get_user_role() = 'principal');

-- ============================================
-- SECTIONS POLICIES
-- ============================================

-- Everyone can read sections
CREATE POLICY "sections_select_all" ON sections
    FOR SELECT USING (true);

-- HOD can manage sections in their department
CREATE POLICY "sections_all_hod" ON sections
    FOR ALL USING (
        get_user_role() = 'hod' 
        AND department_id = get_user_department()
    );

-- Principal can manage all sections
CREATE POLICY "sections_all_principal" ON sections
    FOR ALL USING (get_user_role() = 'principal');

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================

-- Students can view their own attendance
CREATE POLICY "attendance_select_student" ON attendance
    FOR SELECT USING (student_id = auth.uid());

-- Teachers can view and manage attendance for their class
CREATE POLICY "attendance_all_teacher" ON attendance
    FOR ALL USING (
        get_user_role() = 'teacher' AND
        student_id IN (
            SELECT id FROM profiles 
            WHERE department_id = get_user_department()
            AND year = get_user_year()
            AND section = get_user_section()
        )
    );

-- HOD can view all department attendance
CREATE POLICY "attendance_select_hod" ON attendance
    FOR SELECT USING (
        get_user_role() = 'hod' AND
        student_id IN (
            SELECT id FROM profiles 
            WHERE department_id = get_user_department()
        )
    );

-- Principal can view all attendance
CREATE POLICY "attendance_select_principal" ON attendance
    FOR SELECT USING (get_user_role() = 'principal');

-- ============================================
-- TESTS POLICIES
-- ============================================

-- Students can view published tests for their class
CREATE POLICY "tests_select_student" ON tests
    FOR SELECT USING (
        status = 'approved' AND
        department_id = get_user_department() AND
        year = get_user_year() AND
        section = get_user_section()
    );

-- Teachers can manage tests for their class
CREATE POLICY "tests_all_teacher" ON tests
    FOR ALL USING (
        get_user_role() = 'teacher' AND
        department_id = get_user_department() AND
        year = get_user_year() AND
        section = get_user_section()
    );

-- HOD can view and approve department tests
CREATE POLICY "tests_all_hod" ON tests
    FOR ALL USING (
        get_user_role() = 'hod' AND
        department_id = get_user_department()
    );

-- Principal can view all tests
CREATE POLICY "tests_select_principal" ON tests
    FOR SELECT USING (get_user_role() = 'principal');

-- ============================================
-- RESULTS POLICIES
-- ============================================

-- Students can view their own results for published tests
CREATE POLICY "results_select_student" ON results
    FOR SELECT USING (
        student_id = auth.uid() AND
        test_id IN (SELECT id FROM tests WHERE status = 'approved')
    );

-- Teachers can manage results for their class tests
CREATE POLICY "results_all_teacher" ON results
    FOR ALL USING (
        get_user_role() = 'teacher' AND
        test_id IN (
            SELECT id FROM tests 
            WHERE department_id = get_user_department()
            AND year = get_user_year()
            AND section = get_user_section()
        )
    );

-- HOD can view department results
CREATE POLICY "results_select_hod" ON results
    FOR SELECT USING (
        get_user_role() = 'hod' AND
        test_id IN (
            SELECT id FROM tests 
            WHERE department_id = get_user_department()
        )
    );

-- Principal can view all results
CREATE POLICY "results_select_principal" ON results
    FOR SELECT USING (get_user_role() = 'principal');

-- ============================================
-- CALENDAR EVENTS POLICIES
-- ============================================

-- Students can view relevant calendar events
CREATE POLICY "calendar_select_student" ON calendar_events
    FOR SELECT USING (
        scope = 'college' OR
        (scope = 'department' AND scope_id = get_user_department()) OR
        (scope = 'section' AND scope_id IN (
            SELECT id FROM sections 
            WHERE department_id = get_user_department()
            AND year = get_user_year()
            AND section_name = get_user_section()
        ))
    );

-- Teachers can create section events
CREATE POLICY "calendar_insert_teacher" ON calendar_events
    FOR INSERT WITH CHECK (
        get_user_role() = 'teacher' AND 
        scope = 'section'
    );

-- HOD can create department events
CREATE POLICY "calendar_insert_hod" ON calendar_events
    FOR INSERT WITH CHECK (
        get_user_role() = 'hod' AND 
        scope IN ('section', 'department')
    );

-- Principal can manage all events
CREATE POLICY "calendar_all_principal" ON calendar_events
    FOR ALL USING (get_user_role() = 'principal');

-- ============================================
-- NOTES POLICIES
-- ============================================

-- Students can view approved notes for their class
CREATE POLICY "notes_select_student" ON notes
    FOR SELECT USING (
        status = 'approved' AND
        department_id = get_user_department() AND
        year = get_user_year() AND
        section = get_user_section()
    );

-- Teachers can manage their own notes
CREATE POLICY "notes_all_teacher" ON notes
    FOR ALL USING (uploaded_by = auth.uid());

-- Teachers can view all notes in their department
CREATE POLICY "notes_select_teacher" ON notes
    FOR SELECT USING (
        get_user_role() = 'teacher' AND
        department_id = get_user_department()
    );

-- HOD can approve/reject department notes
CREATE POLICY "notes_all_hod" ON notes
    FOR ALL USING (
        get_user_role() = 'hod' AND
        department_id = get_user_department()
    );

-- Principal can view all notes
CREATE POLICY "notes_select_principal" ON notes
    FOR SELECT USING (get_user_role() = 'principal');

-- ============================================
-- NOTE CHUNKS POLICIES (RAG)
-- ============================================

-- Users can query note chunks for approved notes they can access
CREATE POLICY "note_chunks_select" ON note_chunks
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM notes 
            WHERE status = 'approved' AND
            department_id = get_user_department() AND
            (
                get_user_role() IN ('teacher', 'hod', 'principal') OR
                (year = get_user_year() AND section = get_user_section())
            )
        )
    );

-- ============================================
-- CHATS POLICIES
-- ============================================

-- Users can access chats they participate in
CREATE POLICY "chats_select_participant" ON chats
    FOR SELECT USING (auth.uid() = ANY(participants));

-- Users can create chats
CREATE POLICY "chats_insert_authenticated" ON chats
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages in their chats
CREATE POLICY "messages_select_participant" ON messages
    FOR SELECT USING (
        chat_id IN (
            SELECT id FROM chats 
            WHERE auth.uid() = ANY(participants)
        )
    );

-- Users can send messages to their chats
CREATE POLICY "messages_insert_participant" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        chat_id IN (
            SELECT id FROM chats 
            WHERE auth.uid() = ANY(participants)
        )
    );

-- ============================================
-- ANNOUNCEMENTS POLICIES
-- ============================================

-- Students can view relevant announcements
CREATE POLICY "announcements_select_student" ON announcements
    FOR SELECT USING (
        scope = 'college' OR
        (scope = 'department' AND scope_id = get_user_department()) OR
        (scope = 'section' AND scope_id IN (
            SELECT id FROM sections 
            WHERE department_id = get_user_department()
            AND year = get_user_year()
            AND section_name = get_user_section()
        ))
    );

-- Teachers can create section announcements
CREATE POLICY "announcements_insert_teacher" ON announcements
    FOR INSERT WITH CHECK (
        get_user_role() = 'teacher' AND scope = 'section'
    );

-- HOD can create department announcements
CREATE POLICY "announcements_insert_hod" ON announcements
    FOR INSERT WITH CHECK (
        get_user_role() = 'hod' AND scope IN ('section', 'department')
    );

-- Principal can manage all announcements
CREATE POLICY "announcements_all_principal" ON announcements
    FOR ALL USING (get_user_role() = 'principal');

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System can insert notifications (via service role)
CREATE POLICY "notifications_insert_service" ON notifications
    FOR INSERT WITH CHECK (true);

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only HOD and Principal can view audit logs
CREATE POLICY "audit_logs_select_admin" ON audit_logs
    FOR SELECT USING (get_user_role() IN ('hod', 'principal'));

-- Service role can insert audit logs
CREATE POLICY "audit_logs_insert_service" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- KingstonConnect Seed Data
-- For development and testing
-- ============================================

-- Insert sample departments
INSERT INTO departments (id, name, code) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'CSE'),
    ('22222222-2222-2222-2222-222222222222', 'Electronics & Communication Engineering', 'ECE'),
    ('33333333-3333-3333-3333-333333333333', 'Electrical & Electronics Engineering', 'EEE'),
    ('44444444-4444-4444-4444-444444444444', 'Mechanical Engineering', 'MECH'),
    ('55555555-5555-5555-5555-555555555555', 'Civil Engineering', 'CIVIL');

-- Insert sample sections
INSERT INTO sections (department_id, year, section_name, student_count) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 'A', 68),
    ('11111111-1111-1111-1111-111111111111', 1, 'B', 65),
    ('11111111-1111-1111-1111-111111111111', 2, 'A', 70),
    ('11111111-1111-1111-1111-111111111111', 2, 'B', 68),
    ('11111111-1111-1111-1111-111111111111', 3, 'A', 72),
    ('11111111-1111-1111-1111-111111111111', 3, 'B', 70),
    ('11111111-1111-1111-1111-111111111111', 4, 'A', 65),
    ('11111111-1111-1111-1111-111111111111', 4, 'B', 63),
    ('22222222-2222-2222-2222-222222222222', 1, 'A', 60),
    ('22222222-2222-2222-2222-222222222222', 2, 'A', 58),
    ('33333333-3333-3333-3333-333333333333', 1, 'A', 55),
    ('44444444-4444-4444-4444-444444444444', 1, 'A', 62),
    ('55555555-5555-5555-5555-555555555555', 1, 'A', 50);

-- Insert sample calendar events
INSERT INTO calendar_events (title, description, date, category, scope, color, created_by) VALUES
    ('Republic Day', 'National holiday', '2026-01-26', 'holiday', 'college', '#10b981', NULL),
    ('Unit Test 2', 'Second unit test for all departments', '2026-01-15', 'exam', 'college', '#ef4444', NULL),
    ('Sports Day', 'Annual sports meet', '2026-02-14', 'event', 'college', '#6366f1', NULL),
    ('Lab Assignment Deadline', 'Submit programming lab assignments', '2026-01-18', 'deadline', 'department', '#8b5cf6', NULL),
    ('Department Meeting', 'Monthly staff meeting', '2026-01-20', 'activity', 'department', '#f59e0b', NULL);

-- Insert sample announcements
INSERT INTO announcements (title, content, scope, pinned, created_by) VALUES
    (
        'Welcome to New Semester',
        'Dear students, welcome to the new academic semester. Please check your timetables and ensure you have all required materials.',
        'college',
        true,
        NULL
    ),
    (
        'Library Timing Changes',
        'The central library will now be open from 8 AM to 10 PM on weekdays. Weekend timing remains unchanged.',
        'college',
        false,
        NULL
    ),
    (
        'Placement Drive Notice',
        'TCS is conducting a placement drive on January 25th. Eligible students should register through the placement cell.',
        'department',
        true,
        NULL
    );

-- Note: User profiles should be created through the authentication flow
-- This seed data provides the structural data needed for the application to function

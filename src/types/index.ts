// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'student' | 'teacher' | 'hod' | 'principal';

export interface Profile {
    id: string;
    register_no: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    department_id?: string;
    year?: number;
    section?: string;
    pin_hash?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    department?: Department;
}

export interface AuthState {
    user: Profile | null;
    loading: boolean;
    error: string | null;
}

// ============================================
// Organization Structure Types
// ============================================

export interface Department {
    id: string;
    name: string;
    code: string;
    hod_id?: string;
    created_at: string;
    // Joined data
    hod?: Profile;
    sections?: Section[];
}

export interface Section {
    id: string;
    department_id: string;
    year: number;
    section_name: string;
    class_teacher_id?: string;
    student_count: number;
    // Joined data
    class_teacher?: Profile;
    department?: Department;
}

// ============================================
// Attendance Types
// ============================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
    id: string;
    student_id: string;
    date: string;
    status: AttendanceStatus;
    subject?: string;
    marked_by: string;
    marked_at: string;
    // Joined data
    student?: Profile;
}

export interface AttendanceStats {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
}

export interface AttendanceSummary {
    student_id: string;
    student: Profile;
    stats: AttendanceStats;
}

// ============================================
// Results & Tests Types
// ============================================

export type ContentStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Subject {
    name: string;
    max_marks: number;
}

export interface Test {
    id: string;
    name: string;
    date: string;
    department_id: string;
    year: number;
    section: string;
    subjects: Subject[];
    total_marks: number;
    created_by: string;
    status: ContentStatus;
    created_at: string;
    // Joined data
    creator?: Profile;
    results?: Result[];
}

export interface SubjectMark {
    subject: string;
    marks: number;
    max_marks: number;
}

export interface Result {
    id: string;
    test_id: string;
    student_id: string;
    marks: Record<string, number>; // { "Mathematics": 45, "Physics": 38 }
    total: number;
    percentage: number;
    grade: string;
    created_at: string;
    // Joined data
    student?: Profile;
    test?: Test;
}

// ============================================
// Calendar Types
// ============================================

export type EventCategory = 'exam' | 'holiday' | 'event' | 'activity' | 'deadline';
export type EventScope = 'college' | 'department' | 'section';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    end_date?: string;
    category: EventCategory;
    scope: EventScope;
    scope_id?: string;
    color: string;
    created_by: string;
    created_at: string;
    // Joined data
    creator?: Profile;
}

export const EVENT_COLORS: Record<EventCategory, string> = {
    exam: '#ef4444',
    holiday: '#10b981',
    event: '#6366f1',
    activity: '#f59e0b',
    deadline: '#8b5cf6',
};

// ============================================
// Notes & Resources Types
// ============================================

export interface Note {
    id: string;
    title: string;
    subject: string;
    description?: string;
    file_url: string;
    file_type?: string;
    department_id: string;
    year: number;
    section: string;
    uploaded_by: string;
    approved_by?: string;
    status: ContentStatus;
    created_at: string;
    // Joined data
    uploader?: Profile;
    approver?: Profile;
}

export interface NoteChunk {
    id: string;
    note_id: string;
    content: string;
    page_number?: number;
    embedding?: number[];
}

// ============================================
// Chat & Messaging Types
// ============================================

export interface Chat {
    id: string;
    participants: string[];
    last_message_at?: string;
    created_at: string;
    // Joined data
    participants_profiles?: Profile[];
    last_message?: Message;
}

export interface MessageAttachment {
    type: 'image' | 'pdf' | 'video' | 'file';
    url: string;
    name: string;
    size?: number;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    attachments: MessageAttachment[];
    read_by: string[];
    created_at: string;
    // Joined data
    sender?: Profile;
}

// ============================================
// Announcements Types
// ============================================

export interface Announcement {
    id: string;
    title: string;
    content: string;
    attachments: MessageAttachment[];
    scope: EventScope;
    scope_id?: string;
    pinned: boolean;
    created_by: string;
    created_at: string;
    // Joined data
    creator?: Profile;
}

// ============================================
// Notifications Types
// ============================================

export type NotificationType =
    | 'attendance'
    | 'result'
    | 'note'
    | 'chat'
    | 'announcement'
    | 'approval'
    | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

// ============================================
// Analytics Types
// ============================================

export interface DashboardStats {
    total_students: number;
    total_teachers: number;
    total_departments: number;
    attendance_percentage: number;
    average_results: number;
}

export interface DepartmentStats {
    department: Department;
    student_count: number;
    teacher_count: number;
    attendance_percentage: number;
    at_risk_students: number;
}

export interface AtRiskStudent {
    student: Profile;
    attendance_percentage: number;
    average_marks: number;
    risk_score: number;
    risk_factors: string[];
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// ============================================
// Form Types
// ============================================

export interface LoginForm {
    register_no: string;
    password: string;
}

export interface SignupForm {
    register_no: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    department_id: string;
    year?: number;
    section?: string;
}

export interface AttendanceForm {
    date: string;
    subject?: string;
    records: Array<{
        student_id: string;
        status: AttendanceStatus;
    }>;
}

export interface TestForm {
    name: string;
    date: string;
    subjects: Subject[];
}

export interface MarksEntryForm {
    test_id: string;
    entries: Array<{
        student_id: string;
        marks: Record<string, number>;
    }>;
}

// ============================================
// UI Types
// ============================================

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles: UserRole[];
    badge?: number;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

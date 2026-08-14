/**
 * Centralized teacher-uploaded content for the AI context.
 * Mirrors exactly what appears on the Assignments, Announcements, Notes and
 * Events pages, so StudyGPT can answer using any material a teacher has
 * uploaded or posted.
 *
 * In the demo app this is mock data. When real sources are wired in, update
 * the exports here (single source of truth).
 */

import { UPCOMING_DEADLINES, type StudentDeadline } from '@/data/studentData';

export interface TeacherAssignment {
    id: string;
    title: string;
    subject: string;
    code: string;
    dueDate: string;
    marks: number;
    status: 'pending' | 'submitted' | 'graded';
    description: string;
    grade?: number;
    submittedAt?: string;
}

export interface TeacherAnnouncement {
    id: string;
    title: string;
    content: string;
    author: string;
    authorRole: string;
    priority: 'high' | 'medium' | 'low';
    date: string;
    department: string | null;
}

export interface TeacherNote {
    id: string;
    title: string;
    subject: string;
    code: string;
    author: string;
    date: string;
    status: 'approved' | 'pending';
    rating: number;
    type: 'pdf' | 'video' | 'doc';
}

export const TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
    {
        id: '1',
        title: 'Binary Tree Implementation',
        subject: 'Data Structures',
        code: 'CSE101',
        dueDate: '2024-01-20',
        marks: 20,
        status: 'pending',
        description:
            'Implement a binary search tree with insert, delete, and search operations.',
    },
    {
        id: '2',
        title: 'Sorting Algorithm Analysis',
        subject: 'Algorithms',
        code: 'CSE102',
        dueDate: '2024-01-22',
        marks: 15,
        status: 'submitted',
        submittedAt: '2024-01-19',
        description: 'Analyze time complexity of different sorting algorithms.',
    },
    {
        id: '3',
        title: 'Database Design Project',
        subject: 'DBMS',
        code: 'CSE103',
        dueDate: '2024-01-25',
        marks: 30,
        status: 'pending',
        description:
            'Design a complete database schema for an e-commerce application.',
    },
    {
        id: '4',
        title: 'Process Scheduling',
        subject: 'Operating Systems',
        code: 'CSE104',
        dueDate: '2024-01-18',
        marks: 20,
        status: 'graded',
        submittedAt: '2024-01-17',
        grade: 18,
        description: 'Implement CPU scheduling algorithms.',
    },
    {
        id: '5',
        title: 'Graph Theory Problems',
        subject: 'Discrete Math',
        code: 'MAT201',
        dueDate: '2024-01-28',
        marks: 25,
        status: 'pending',
        description:
            'Solve graph theory problems including DFS, BFS, and shortest path.',
    },
];

export const TEACHER_ANNOUNCEMENTS: TeacherAnnouncement[] = [
    {
        id: '1',
        title: 'Mid-term Examination Schedule',
        content:
            'Mid-term examinations will commence from February 1st, 2024. All students are required to check their exam schedule on the portal. Hall tickets will be available for download from January 25th.',
        author: 'Principal',
        authorRole: 'principal',
        priority: 'high',
        date: '2024-01-10',
        department: null,
    },
    {
        id: '2',
        title: 'Library Hours Extended',
        content:
            'Library will remain open until 10 PM during the examination period. Students can avail this facility from January 20th to February 15th.',
        author: 'Librarian',
        authorRole: 'admin',
        priority: 'medium',
        date: '2024-01-12',
        department: null,
    },
    {
        id: '3',
        title: 'CSE Department Seminar',
        content:
            'A seminar on "AI and Machine Learning in Industry" will be conducted on January 25th in Seminar Hall 1. All CSE students are encouraged to attend.',
        author: 'Dr. Smith',
        authorRole: 'hod',
        priority: 'low',
        date: '2024-01-14',
        department: 'CSE',
    },
    {
        id: '4',
        title: 'Fee Payment Deadline',
        content:
            'Last date for payment of semester fees is January 31st, 2024. Late payments will attract a fine of Rs. 500.',
        author: 'Accounts',
        authorRole: 'admin',
        priority: 'high',
        date: '2024-01-08',
        department: null,
    },
    {
        id: '5',
        title: 'Technical Fest Registration',
        content:
            'Registration for TechVista 2024 is now open. Early bird registration ends January 20th with special discounts for participants.',
        author: 'Student Council',
        authorRole: 'teacher',
        priority: 'medium',
        date: '2024-01-15',
        department: null,
    },
];

export const TEACHER_NOTES: TeacherNote[] = [
    {
        id: '1',
        title: 'Data Structures Complete Notes',
        subject: 'Data Structures',
        code: 'CSE101',
        author: 'Dr. Smith',
        date: '2024-01-10',
        status: 'approved',
        rating: 4.8,
        type: 'pdf',
    },
    {
        id: '2',
        title: 'Algorithm Analysis Guide',
        subject: 'Algorithms',
        code: 'CSE102',
        author: 'Prof. Johnson',
        date: '2024-01-08',
        status: 'approved',
        rating: 4.5,
        type: 'pdf',
    },
    {
        id: '3',
        title: 'SQL Fundamentals',
        subject: 'DBMS',
        code: 'CSE103',
        author: 'Dr. Williams',
        date: '2024-01-12',
        status: 'approved',
        rating: 4.2,
        type: 'pdf',
    },
    {
        id: '4',
        title: 'OS Process Management',
        subject: 'Operating Systems',
        code: 'CSE104',
        author: 'Dr. Brown',
        date: '2024-01-05',
        status: 'approved',
        rating: 4.6,
        type: 'pdf',
    },
    {
        id: '5',
        title: 'Graph Theory Basics',
        subject: 'Discrete Math',
        code: 'MAT201',
        author: 'Prof. Davis',
        date: '2024-01-14',
        status: 'pending',
        rating: 0,
        type: 'pdf',
    },
    {
        id: '6',
        title: 'Binary Trees Lecture',
        subject: 'Data Structures',
        code: 'CSE101',
        author: 'Dr. Smith',
        date: '2024-01-11',
        status: 'approved',
        rating: 4.7,
        type: 'video',
    },
];

/** Reference date the demo mock data is anchored to. */
export const MOCK_REFERENCE_DATE = new Date('2024-01-15T09:00:00');

export interface TeacherItem {
    source: 'assignment' | 'announcement' | 'note' | 'deadline';
    title: string;
    subject: string;
    detail: string;
    date: string;
    /** relevance keywords for matching a student query */
    keywords: string;
}

/**
 * Index of everything teachers have uploaded, with keywords so the AI can
 * pick the relevant items for any student question.
 */
export function getTeacherContentIndex(): TeacherItem[] {
    const items: TeacherItem[] = [];

    for (const a of TEACHER_ASSIGNMENTS) {
        items.push({
            source: 'assignment',
            title: a.title,
            subject: a.subject,
            detail: `${a.description} (${a.marks} marks${
                a.status === 'graded' ? `, your grade: ${a.grade}/${a.marks}` : ''
            }, due ${a.dueDate})`,
            date: a.dueDate,
            keywords: `${a.title} ${a.subject} ${a.description.toLowerCase()}`,
        });
    }
    for (const a of TEACHER_ANNOUNCEMENTS) {
        items.push({
            source: 'announcement',
            title: a.title,
            subject: a.department ?? 'all',
            detail: a.content,
            date: a.date,
            keywords: `${a.title} ${a.content.toLowerCase()}`,
        });
    }
    for (const n of TEACHER_NOTES) {
        if (n.status === 'approved') {
            items.push({
                source: 'note',
                title: n.title,
                subject: n.subject,
                detail: `Uploaded by ${n.author} (${n.type}, rating ${n.rating})`,
                date: n.date,
                keywords: `${n.title} ${n.subject}`,
            });
        }
    }
    for (const d of UPCOMING_DEADLINES as StudentDeadline[]) {
        items.push({
            source: 'deadline',
            title: d.title,
            subject: d.subject,
            detail: `${d.type} due ${d.dueDate}`,
            date: d.dueDate,
            keywords: `${d.title} ${d.subject} ${d.type}`,
        });
    }
    return items;
}

/**
 * Returns teacher items relevant to a query (simple keyword overlap), plus a
 * note if nothing matched.
 */
export function getRelevantTeacherContent(query: string): string {
    const q = query.toLowerCase();
    const items = getTeacherContentIndex();
    const scored = items
        .map((it) => {
            const kw = it.keywords.toLowerCase();
            let score = 0;
            for (const w of q.split(/\s+/)) {
                if (w.length > 3 && kw.includes(w)) score += 1;
            }
            return { it, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((x) => x.it);

    if (scored.length === 0) {
        const deadline = items.find((x) => x.source === 'deadline');
        return `## Teacher-Uploaded Content
Nothing specifically matches this question, but here is what your teachers have posted:
${items
    .slice(0, 3)
    .map(
        (x) =>
            `- [${x.source}] **${x.title}** (${x.subject}): ${x.detail.slice(0, 90)}`
    )
    .join('\n')}
${deadline ? `\nNearest deadline: ${deadline.title} — ${deadline.detail}` : ''}`;
    }

    return `## Teacher-Uploaded Content (matched to your question)
${scored
    .map(
        (x) =>
            `- [${x.source}] **${x.title}** (${x.subject}): ${x.detail}`
    )
    .join('\n')}
Answer using the above material where relevant; cite it explicitly.`;
}

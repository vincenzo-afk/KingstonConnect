import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Users, Search, Plus, X, Trash2 } from 'lucide-react';

// =============================================================================
// STUDENTS STORE — staff add students (no mock data)
// =============================================================================

export interface StudentItem {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    phone: string;
    department: string;
    section: string;
    semester: number;
    cgpa: number;
    attendance: number;
    status: 'active' | 'at-risk';
}

const createStudentsStore = () => {
    const KEY = 'kingston-students';
    const listeners = new Set<() => void>();

    const read = (): StudentItem[] => {
        try {
            return JSON.parse(
                localStorage.getItem(KEY) || '[]'
            ) as StudentItem[];
        } catch {
            return [];
        }
    };

    let state: StudentItem[] = read();

    const write = (next: StudentItem[]) => {
        state = next;
        localStorage.setItem(KEY, JSON.stringify(next));
        listeners.forEach((l) => l());
    };

    return {
        useStudents: () => {
            const [, forceUpdate] = useState(0);
            React.useEffect(() => {
                const listener = () => forceUpdate((t) => t + 1);
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            }, []);
            return {
                students: state,
                addStudent: (s: Omit<StudentItem, 'id'>) =>
                    write([...state, { ...s, id: `stu-${Date.now()}` }]),
                removeStudent: (id: string) =>
                    write(state.filter((s) => s.id !== id)),
            };
        },
    };
};

const studentsStore = createStudentsStore();

// =============================================================================
// STUDENTS PAGE
// =============================================================================

const StudentsPage: React.FC = () => {
    const { user } = useAuthStore();
    const { students, addStudent, removeStudent } = studentsStore.useStudents();
    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<StudentItem>>({});

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSection =
            sectionFilter === 'all' || student.section === sectionFilter;
        return matchesSearch && matchesSection;
    });

    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 75) return 'text-green-400';
        if (attendance >= 65) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getCgpaColor = (cgpa: number) => {
        if (cgpa >= 8) return 'text-green-400';
        if (cgpa >= 7) return 'text-blue-400';
        if (cgpa >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    const handleAdd = () => {
        if (!form.name?.trim() || !form.rollNumber?.trim()) return;
        addStudent({
            name: form.name.trim(),
            rollNumber: form.rollNumber.trim(),
            email: form.email?.trim() || '',
            phone: form.phone?.trim() || '',
            department: form.department?.trim() || 'CSE',
            section: form.section?.trim() || 'A',
            semester: Number(form.semester) || 1,
            cgpa: Number(form.cgpa) || 0,
            attendance: Number(form.attendance) || 0,
            status:
                Number(form.attendance) < 75 || Number(form.cgpa) < 7
                    ? 'at-risk'
                    : 'active',
        });
        setForm({});
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Students</h2>
                    <p className="text-slate-400">
                        {students.length} student{students.length === 1 ? '' : 's'} in your sections
                    </p>
                </div>
                {isStaff && (
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowForm((v) => !v)}
                    >
                        {showForm ? (
                            <>
                                <X className="w-4 h-4" /> Close
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Add Student
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Add student form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New student
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Name
                                </p>
                                <input
                                    type="text"
                                    value={form.name || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    placeholder="e.g. John Doe"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Roll number
                                </p>
                                <input
                                    type="text"
                                    value={form.rollNumber || ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            rollNumber: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 21BCE1234"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Email
                                </p>
                                <input
                                    type="email"
                                    value={form.email || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    placeholder="e.g. john@kec.edu"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Department
                                </p>
                                <input
                                    type="text"
                                    value={form.department || ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            department: e.target.value,
                                        })
                                    }
                                    placeholder="CSE"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Section
                                </p>
                                <input
                                    type="text"
                                    value={form.section || ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            section: e.target.value,
                                        })
                                    }
                                    placeholder="A"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Semester
                                </p>
                                <input
                                    type="number"
                                    value={form.semester !== undefined ? String(form.semester) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            semester: Number(e.target.value),
                                        })
                                    }
                                    placeholder="1"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Phone
                                </p>
                                <input
                                    type="tel"
                                    value={form.phone || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                    placeholder="+91 9876543210"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    CGPA (out of 10)
                                </p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.cgpa !== undefined ? String(form.cgpa) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cgpa: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Attendance %
                                </p>
                                <input
                                    type="number"
                                    value={form.attendance !== undefined ? String(form.attendance) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            attendance: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAdd}
                            disabled={!form.name?.trim() || !form.rollNumber?.trim()}
                        >
                            Add student
                        </Button>
                    </div>
                </Card>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                    <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="all">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                </div>
            </Card>

            {/* Students Table */}
            {students.length === 0 ? (
                <Card className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">
                        No students added yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {isStaff
                            ? 'Use the Add Student button to register students.'
                            : 'Staff can register students.'}
                    </p>
                </Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="text-left p-4 text-slate-400 font-medium">
                                        Student
                                    </th>
                                    <th className="text-left p-4 text-slate-400 font-medium">
                                        Roll Number
                                    </th>
                                    <th className="text-left p-4 text-slate-400 font-medium">
                                        Section
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        CGPA
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        Attendance
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        Status
                                    </th>
                                    {isStaff && (
                                        <th className="text-right p-4 text-slate-400 font-medium">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar alt={student.name} size="sm" />
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {student.name}
                                                    </p>
                                                    {student.email && (
                                                        <p className="text-sm text-slate-400">
                                                            {student.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {student.rollNumber}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" size="sm">
                                                Section {student.section}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`font-semibold ${getCgpaColor(student.cgpa)}`}
                                            >
                                                {student.cgpa}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`font-semibold ${getAttendanceColor(student.attendance)}`}
                                            >
                                                {student.attendance}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Badge
                                                variant={
                                                    student.status === 'active'
                                                        ? 'success'
                                                        : 'error'
                                                }
                                                size="sm"
                                                className="capitalize"
                                            >
                                                {student.status}
                                            </Badge>
                                        </td>
                                        {isStaff && (
                                            <td className="p-4">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeStudent(student.id)
                                                        }
                                                        className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                                        aria-label={`Remove ${student.name}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {filteredStudents.length === 0 && students.length > 0 && (
                <Card className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No students found</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Try a different name, roll number, or section
                    </p>
                </Card>
            )}
        </div>
    );
};

export default StudentsPage;

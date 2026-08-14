import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
    GraduationCap,
    Search,
    Plus,
    X,
    Trash2,
    Mail,
    Phone,
} from 'lucide-react';

// =============================================================================
// TEACHERS STORE — staff add faculty (no mock data)
// =============================================================================

export interface TeacherItem {
    id: string;
    name: string;
    empId: string;
    email: string;
    phone: string;
    department: string;
    designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | string;
    subjects: string[];
    experience: number;
    publications: number;
}

const createTeachersStore = () => {
    const KEY = 'kingston-teachers';
    const listeners = new Set<() => void>();

    const read = (): TeacherItem[] => {
        try {
            return JSON.parse(
                localStorage.getItem(KEY) || '[]'
            ) as TeacherItem[];
        } catch {
            return [];
        }
    };

    let state: TeacherItem[] = read();

    const write = (next: TeacherItem[]) => {
        state = next;
        localStorage.setItem(KEY, JSON.stringify(next));
        listeners.forEach((l) => l());
    };

    return {
        useTeachers: () => {
            const [, forceUpdate] = useState(0);
            React.useEffect(() => {
                const listener = () => forceUpdate((t) => t + 1);
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            }, []);
            return {
                teachers: state,
                addTeacher: (t: Omit<TeacherItem, 'id'>) =>
                    write([...state, { ...t, id: `tch-${Date.now()}` }]),
                removeTeacher: (id: string) =>
                    write(state.filter((t) => t.id !== id)),
            };
        },
    };
};

const teachersStore = createTeachersStore();

// =============================================================================
// TEACHERS PAGE
// =============================================================================

const TeachersPage: React.FC = () => {
    const { user } = useAuthStore();
    const { teachers, addTeacher, removeTeacher } = teachersStore.useTeachers();
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<TeacherItem>>({});
    const [subjectInput, setSubjectInput] = useState('');

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const filteredTeachers = teachers.filter(
        (teacher) =>
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDesignationColor = (designation: string) => {
        switch (designation) {
            case 'Professor':
                return 'bg-purple-500/20 text-purple-400';
            case 'Associate Professor':
                return 'bg-blue-500/20 text-blue-400';
            case 'Assistant Professor':
                return 'bg-green-500/20 text-green-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    };

    const handleAdd = () => {
        if (!form.name?.trim() || !form.email?.trim()) return;
        addTeacher({
            name: form.name.trim(),
            empId: form.empId?.trim() || `EMP${1000 + teachers.length + 1}`,
            email: form.email.trim(),
            phone: form.phone?.trim() || '',
            department: form.department?.trim() || 'CSE',
            designation: form.designation || 'Assistant Professor',
            subjects: (form.subjects ?? []) as string[],
            experience: Number(form.experience) || 0,
            publications: Number(form.publications) || 0,
        });
        setForm({});
        setSubjectInput('');
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Faculty</h2>
                    <p className="text-slate-400">
                        {teachers.length} teacher{teachers.length === 1 ? '' : 's'} in your department
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
                                <Plus className="w-4 h-4" /> Add Teacher
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Add teacher form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New faculty
                        member
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
                                    placeholder="e.g. Dr. Smith"
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
                                    placeholder="e.g. smith@kec.edu"
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Department
                                </p>
                                <input
                                    type="text"
                                    value={form.department || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, department: e.target.value })
                                    }
                                    placeholder="e.g. CSE"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Designation
                                </p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {(
                                        [
                                            'Professor',
                                            'Associate Professor',
                                            'Assistant Professor',
                                        ] as const
                                    ).map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() =>
                                                setForm({ ...form, designation: d })
                                            }
                                            className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                                form.designation === d
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Employee ID
                                </p>
                                <input
                                    type="text"
                                    value={form.empId || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, empId: e.target.value })
                                    }
                                    placeholder="e.g. EMP1001"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-1.5">
                                Subjects (press Enter to add)
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={subjectInput}
                                    onChange={(e) =>
                                        setSubjectInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            subjectInput.trim()
                                        ) {
                                            e.preventDefault();
                                            setForm({
                                                ...form,
                                                subjects: [
                                                    ...((form.subjects as string[]) ?? []),
                                                    subjectInput.trim(),
                                                ],
                                            });
                                            setSubjectInput('');
                                        }
                                    }}
                                    placeholder="e.g. Data Structures"
                                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            {form.subjects && form.subjects.length > 0 && (
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {form.subjects.map((s) => (
                                        <Badge key={s} variant="secondary" size="sm">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Years of experience
                                </p>
                                <input
                                    type="number"
                                    value={form.experience !== undefined ? String(form.experience) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            experience: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Publications
                                </p>
                                <input
                                    type="number"
                                    value={form.publications !== undefined ? String(form.publications) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            publications: Number(e.target.value),
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
                            disabled={!form.name?.trim() || !form.email?.trim()}
                        >
                            Add faculty
                        </Button>
                    </div>
                </Card>
            )}

            {/* Search */}
            <Card className="p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                </div>
            </Card>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => (
                    <Card
                        key={teacher.id}
                        className="hover:border-cyan-500/30 transition-colors"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar alt={teacher.name} size="lg" />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white">
                                    {teacher.name}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {teacher.empId}
                                </p>
                                <span
                                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getDesignationColor(teacher.designation)}`}
                                >
                                    {teacher.designation}
                                </span>
                            </div>
                            {isStaff && (
                                <button
                                    type="button"
                                    onClick={() => removeTeacher(teacher.id)}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                    aria-label={`Remove ${teacher.name}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{teacher.email}</span>
                            </div>
                            {teacher.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{teacher.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2">Subjects</p>
                            <div className="flex flex-wrap gap-1">
                                {teacher.subjects.map((subject, index) => (
                                    <Badge key={index} variant="secondary" size="sm">
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white/5 mb-4">
                            <div className="text-center">
                                <p className="text-lg font-bold text-cyan-400">
                                    {teacher.experience}
                                </p>
                                <p className="text-xs text-slate-400">Years Exp</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-purple-400">
                                    {teacher.publications}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Publications
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTeachers.length === 0 && (
                <Card className="text-center py-12">
                    <GraduationCap className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">
                        {teachers.length === 0
                            ? 'No teachers added yet'
                            : 'No teachers found'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {teachers.length === 0
                            ? isStaff
                                ? 'Use the Add Teacher button to publish the faculty list.'
                                : 'Staff can publish the faculty list.'
                            : 'Try a different name or employee ID'}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default TeachersPage;

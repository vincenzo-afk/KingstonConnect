import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Building2,
    Users,
    GraduationCap,
    Plus,
    X,
    Trash2,
    TrendingUp,
} from 'lucide-react';

// =============================================================================
// DEPARTMENTS STORE — staff add departments (no mock data)
// =============================================================================

export interface DepartmentItem {
    id: string;
    name: string;
    code: string;
    hod: string;
    students: number;
    faculty: number;
    avgCGPA: number;
    avgAttendance: number;
}

const createDepartmentsStore = () => {
    const KEY = 'kingston-departments';
    const listeners = new Set<() => void>();

    const read = (): DepartmentItem[] => {
        try {
            return JSON.parse(
                localStorage.getItem(KEY) || '[]'
            ) as DepartmentItem[];
        } catch {
            return [];
        }
    };

    let state: DepartmentItem[] = read();

    const write = (next: DepartmentItem[]) => {
        state = next;
        localStorage.setItem(KEY, JSON.stringify(next));
        listeners.forEach((l) => l());
    };

    return {
        useDepartments: () => {
            const [, forceUpdate] = useState(0);
            React.useEffect(() => {
                const listener = () => forceUpdate((t) => t + 1);
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            }, []);
            return {
                departments: state,
                addDepartment: (d: Omit<DepartmentItem, 'id'>) =>
                    write([...state, { ...d, id: `dept-${Date.now()}` }]),
                removeDepartment: (id: string) =>
                    write(state.filter((d) => d.id !== id)),
            };
        },
    };
};

const departmentsStore = createDepartmentsStore();

const departmentColors: Record<string, { bg: string; gradient: string; text: string }> = {
    CSE: { bg: 'from-cyan-500/20 to-blue-500/20', gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
    ECE: { bg: 'from-purple-500/20 to-pink-500/20', gradient: 'from-purple-500 to-pink-500', text: 'text-purple-400' },
    EEE: { bg: 'from-yellow-500/20 to-orange-500/20', gradient: 'from-yellow-500 to-orange-500', text: 'text-yellow-400' },
    MECH: { bg: 'from-green-500/20 to-emerald-500/20', gradient: 'from-green-500 to-emerald-500', text: 'text-green-400' },
};

const defaultColors = [
    { bg: 'from-cyan-500/20 to-blue-500/20', gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
    { bg: 'from-purple-500/20 to-pink-500/20', gradient: 'from-purple-500 to-pink-500', text: 'text-purple-400' },
    { bg: 'from-yellow-500/20 to-orange-500/20', gradient: 'from-yellow-500 to-orange-500', text: 'text-yellow-400' },
    { bg: 'from-green-500/20 to-emerald-500/20', gradient: 'from-green-500 to-emerald-500', text: 'text-green-400' },
];

// =============================================================================
// DEPARTMENTS PAGE
// =============================================================================

const DepartmentsPage: React.FC = () => {
    const { user } = useAuthStore();
    const { departments, addDepartment, removeDepartment } =
        departmentsStore.useDepartments();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<DepartmentItem>>({});

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const totalStudents = departments.reduce((acc, d) => acc + d.students, 0);
    const totalFaculty = departments.reduce((acc, d) => acc + d.faculty, 0);
    const avgCGPA =
        departments.length > 0
            ? (
                  departments.reduce((acc, d) => acc + d.avgCGPA, 0) /
                  departments.length
              ).toFixed(1)
            : '—';

    const getColors = (code: string, index: number) =>
        departmentColors[code] ||
        defaultColors[index % defaultColors.length];

    const handleAdd = () => {
        if (!form.name?.trim() || !form.code?.trim() || !form.hod?.trim()) return;
        addDepartment({
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            hod: form.hod.trim(),
            students: Number(form.students) || 0,
            faculty: Number(form.faculty) || 0,
            avgCGPA: Number(form.avgCGPA) || 0,
            avgAttendance: Number(form.avgAttendance) || 0,
        });
        setForm({});
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Departments
                    </h2>
                    <p className="text-slate-400">
                        {departments.length} department{departments.length === 1 ? '' : 's'}
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
                                <Plus className="w-4 h-4" /> Add Department
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Add department form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New
                        department
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Department name
                                </p>
                                <input
                                    type="text"
                                    value={form.name || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    placeholder="e.g. Computer Science & Engineering"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Code
                                </p>
                                <input
                                    type="text"
                                    value={form.code || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value })
                                    }
                                    placeholder="e.g. CSE"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Head of Department
                                </p>
                                <input
                                    type="text"
                                    value={form.hod || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, hod: e.target.value })
                                    }
                                    placeholder="e.g. Dr. Smith"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Students
                                </p>
                                <input
                                    type="number"
                                    value={form.students !== undefined ? String(form.students) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            students: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Faculty
                                </p>
                                <input
                                    type="number"
                                    value={form.faculty !== undefined ? String(form.faculty) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            faculty: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Avg CGPA (out of 10)
                                </p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.avgCGPA !== undefined ? String(form.avgCGPA) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            avgCGPA: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Avg Attendance %
                                </p>
                                <input
                                    type="number"
                                    value={form.avgAttendance !== undefined ? String(form.avgAttendance) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            avgAttendance: Number(e.target.value),
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
                            disabled={
                                !form.name?.trim() ||
                                !form.code?.trim() ||
                                !form.hod?.trim()
                            }
                        >
                            Add department
                        </Button>
                    </div>
                </Card>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {departments.length}
                            </p>
                            <p className="text-sm text-slate-400">Departments</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {totalStudents}
                            </p>
                            <p className="text-sm text-slate-400">Total Students</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <GraduationCap className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {totalFaculty}
                            </p>
                            <p className="text-sm text-slate-400">Total Faculty</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-yellow-500/20">
                            <TrendingUp className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{avgCGPA}</p>
                            <p className="text-sm text-slate-400">Avg CGPA</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Departments Grid */}
            {departments.length === 0 ? (
                <Card className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">
                        No departments added yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {isStaff
                            ? 'Use the Add Department button to set up your departments.'
                            : 'Staff can publish the department list.'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {departments.map((dept, index) => {
                        const colors = getColors(dept.code, index);

                        return (
                            <Card
                                key={dept.id}
                                className={`bg-gradient-to-br ${colors.bg} border-white/10 hover:border-white/20 transition-colors`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient}`}>
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {dept.code}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {dept.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isStaff && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDepartment(dept.id)
                                                }
                                                className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                                aria-label={`Remove ${dept.code}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-slate-400">
                                        Head of Department
                                    </p>
                                    <p className={`font-medium ${colors.text}`}>
                                        {dept.hod}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-black/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">
                                                Students
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {dept.students}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">
                                                Faculty
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {dept.faculty}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Average CGPA
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                                    style={{
                                                        width: `${Math.min((dept.avgCGPA / 10) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-sm font-medium ${colors.text}`}>
                                                {dept.avgCGPA}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Avg Attendance
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                                    style={{
                                                        width: `${Math.min(dept.avgAttendance, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-sm font-medium ${colors.text}`}>
                                                {dept.avgAttendance}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;

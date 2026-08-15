import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    ClipboardList,
    Clock,
    Check,
    Upload,
    Calendar,
    FileText,
    Plus,
    X,
    Trash2,
} from 'lucide-react';
import {
    getAssignmentsStore,
    subscribeAssignmentsStore,
    syncAssignmentsFromFirestore,
} from '@/stores/assignmentsStore';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';


// =============================================================================
// ASSIGNMENTS STORE — staff assign, students submit (no mock data)
// =============================================================================

export interface AssignmentItem {
    id: string;
    title: string;
    subject: string;
    code: string;
    dueDate: string; // ISO date
    marks: number;
    status: 'pending' | 'submitted' | 'graded';
    description?: string;
    submittedAt?: string;
    grade?: number;
    submittedFile?: string;
}

const useAssignments = () => {
    // Firestore mirror: realtime across all members; offline localStorage fallback.
    const [items, , { add, update, remove }] = useFirestoreCollection<AssignmentItem>('assignments');
    React.useEffect(() => {
        syncAssignmentsFromFirestore(items);
    }, [items]);
    const [assignments, setAssignments] = useState<AssignmentItem[]>(() =>
        getAssignmentsStore()
    );
    React.useEffect(() => {
        return subscribeAssignmentsStore(() => setAssignments(getAssignmentsStore()));
    }, []);

    // Mutations write to Firestore (authoritative) and the listener mirrors back.
    const doAdd = (a: Omit<AssignmentItem, 'id' | 'status'>) =>
        void add({ ...a, id: `assign-${Date.now()}`, status: 'pending' } as AssignmentItem);
    const doSubmit = (id: string, fileName?: string) => {
        const target = getAssignmentsStore().find((x) => x.id === id);
        if (!target) return;
        void update(id, {
            ...target,
            status: 'submitted' as const,
            submittedAt: new Date().toISOString(),
            submittedFile: fileName,
        });
    };
    const doGrade = (id: string, grade: number) => {
        const target = getAssignmentsStore().find((x) => x.id === id);
        if (!target) return;
        void update(id, { ...target, status: 'graded' as const, grade } as AssignmentItem);
    };
    const doRemove = (id: string) => void remove(id);

    return {
        assignments,
        addAssignment: doAdd,
        submitAssignment: doSubmit,
        gradeAssignment: doGrade,
        removeAssignment: doRemove,
    };
};

// =============================================================================
// ASSIGNMENTS PAGE
// =============================================================================

const AssignmentsPage: React.FC = () => {
    const { user } = useAuthStore();
    const {
        assignments,
        addAssignment,
        submitAssignment,
        gradeAssignment,
        removeAssignment,
    } = useAssignments();
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>(
        'all'
    );
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<AssignmentItem>>({});
    const [gradeInput, setGradeInput] = useState<Record<string, string>>({});

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const filteredAssignments =
        filter === 'all'
            ? assignments
            : assignments.filter((a) => a.status === filter);

    const stats = {
        total: assignments.length,
        pending: assignments.filter((a) => a.status === 'pending').length,
        submitted: assignments.filter((a) => a.status === 'submitted').length,
        graded: assignments.filter((a) => a.status === 'graded').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    bg: 'bg-orange-500/20',
                    text: 'text-orange-400',
                    variant: 'warning' as const,
                };
            case 'submitted':
                return {
                    bg: 'bg-blue-500/20',
                    text: 'text-blue-400',
                    variant: 'info' as const,
                };
            case 'graded':
                return {
                    bg: 'bg-green-500/20',
                    text: 'text-green-400',
                    variant: 'success' as const,
                };
            default:
                return {
                    bg: 'bg-slate-500/20',
                    text: 'text-slate-400',
                    variant: 'secondary' as const,
                };
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getDaysUntil = (dateStr: string) => {
        const dueDate = new Date(dateStr);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Due Tomorrow';
        return `${diffDays} days left`;
    };

    const handleAdd = () => {
        if (!form.title?.trim() || !form.subject?.trim() || !form.dueDate) return;
        addAssignment({
            title: form.title.trim(),
            subject: form.subject.trim(),
            code: (form.code || '').trim(),
            dueDate: form.dueDate,
            marks: Number(form.marks) || 0,
            description: form.description?.trim(),
        });
        setForm({});
        setShowForm(false);
    };

    const handleGrade = (id: string, marks: number) => {
        const grade = Number(gradeInput[id]);
        if (Number.isNaN(grade) || grade < 0 || grade > marks) return;
        gradeAssignment(id, grade);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Assignments
                    </h2>
                    <p className="text-slate-400">
                        {assignments.length} assignment{assignments.length === 1 ? '' : 's'}
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
                                <Plus className="w-4 h-4" /> Add Assignment
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total"
                    value={stats.total}
                    icon={<ClipboardList className="w-6 h-6" />}
                    variant="default"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<Clock className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Submitted"
                    value={stats.submitted}
                    icon={<Upload className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Graded"
                    value={stats.graded}
                    icon={<Check className="w-6 h-6" />}
                    variant="success"
                />
            </div>

            {/* Assign new assignment (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New
                        assignment
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Title
                                </p>
                                <input
                                    type="text"
                                    value={form.title || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    placeholder="e.g. Binary Tree Implementation"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Subject
                                </p>
                                <input
                                    type="text"
                                    value={form.subject || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, subject: e.target.value })
                                    }
                                    placeholder="e.g. Data Structures"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Subject code
                                </p>
                                <input
                                    type="text"
                                    value={form.code || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value })
                                    }
                                    placeholder="e.g. CSE101"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Due date
                                </p>
                                <input
                                    type="date"
                                    value={form.dueDate || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, dueDate: e.target.value })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Marks
                                </p>
                                <input
                                    type="number"
                                    value={form.marks !== undefined ? String(form.marks) : ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            marks: Number(e.target.value),
                                        })
                                    }
                                    placeholder="20"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-1.5">
                                Description
                            </p>
                            <textarea
                                value={form.description || ''}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                placeholder="Assignment details..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAdd}
                            disabled={
                                !form.title?.trim() ||
                                !form.subject?.trim() ||
                                !form.dueDate
                            }
                        >
                            Assign
                        </Button>
                    </div>
                </Card>
            )}

            {/* Filter Tabs */}
            <Card className="p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {(['all', 'pending', 'submitted', 'graded'] as const).map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors flex-shrink-0 ${
                                    filter === status
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {status} {status !== 'all' && `(${stats[status]})`}
                            </button>
                        )
                    )}
                </div>
            </Card>

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <Card className="text-center py-12">
                    <ClipboardList className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">
                        No assignments yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {isStaff
                            ? 'Use the Add Assignment button to assign the first task.'
                            : 'Teachers can assign tasks here.'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAssignments.map((assignment) => {
                        const statusColors = getStatusColor(assignment.status);
                        const isOverdue =
                            assignment.status === 'pending' &&
                            new Date(assignment.dueDate) < new Date();

                        return (
                            <Card
                                key={assignment.id}
                                className={isOverdue ? 'border-red-500/30' : ''}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                                                <FileText
                                                    className={`w-5 h-5 ${statusColors.text}`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-white">
                                                        {assignment.title}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            statusColors.variant
                                                        }
                                                        size="sm"
                                                        className="capitalize"
                                                    >
                                                        {assignment.status}
                                                    </Badge>
                                                    {isOverdue && (
                                                        <Badge
                                                            variant="error"
                                                            size="sm"
                                                        >
                                                            Overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    {assignment.subject}
                                                    {assignment.code &&
                                                        ` • ${assignment.code}`}
                                                </p>
                                                {assignment.description && (
                                                    <p className="text-sm text-slate-500 mt-2">
                                                        {assignment.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-2 md:w-48">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-300">
                                                {formatDate(assignment.dueDate)}
                                            </span>
                                        </div>

                                        {assignment.status === 'pending' && (
                                            <span
                                                className={`text-sm ${isOverdue ? 'text-red-400' : 'text-orange-400'}`}
                                            >
                                                {getDaysUntil(assignment.dueDate)}
                                            </span>
                                        )}

                                        {assignment.status === 'graded' && (
                                            <span className="text-lg font-bold text-green-400">
                                                {assignment.grade}/
                                                {assignment.marks}
                                            </span>
                                        )}

                                        {assignment.status === 'submitted' && (
                                            <span className="text-sm text-blue-400">
                                                Submitted{' '}
                                                {assignment.submittedAt
                                                    ? formatDate(
                                                          assignment.submittedAt
                                                      )
                                                    : ''}
                                            </span>
                                        )}

                                        {assignment.submittedFile && (
                                            <span className="text-xs text-slate-400">
                                                {assignment.submittedFile}
                                            </span>
                                        )}

                                        <div className="text-sm text-slate-400">
                                            {assignment.marks} marks
                                        </div>

                                        <div className="flex gap-2">
                                            {!isStaff &&
                                                assignment.status ===
                                                    'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        className="gap-2 mt-2"
                                                        onClick={() =>
                                                            submitAssignment(
                                                                assignment.id
                                                            )
                                                        }
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Submit
                                                    </Button>
                                                )}
                                            {isStaff && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeAssignment(
                                                            assignment.id
                                                        )
                                                    }
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-2 mt-2"
                                                    aria-label={`Remove ${assignment.title}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {isStaff &&
                                            assignment.status ===
                                                'submitted' && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={assignment.marks}
                                                        value={
                                                            gradeInput[
                                                                assignment.id
                                                            ] ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            setGradeInput({
                                                                ...gradeInput,
                                                                [assignment.id]:
                                                                    e.target.value,
                                                            })
                                                        }
                                                        placeholder={`0-${assignment.marks}`}
                                                        className="w-16 px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleGrade(
                                                                assignment.id,
                                                                assignment.marks
                                                            )
                                                        }
                                                        disabled={
                                                            !(gradeInput[
                                                                assignment.id
                                                            ] ?? '').trim()
                                                        }
                                                    >
                                                        Grade
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {filteredAssignments.length === 0 && assignments.length > 0 && (
                <Card className="text-center py-12">
                    <ClipboardList className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">
                        No {filter === 'all' ? '' : filter} assignments found
                    </p>
                </Card>
            )}
        </div>
    );
};

export default AssignmentsPage;

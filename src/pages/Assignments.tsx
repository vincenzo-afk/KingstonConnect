import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClipboardList, Clock, Check, Upload, Calendar, FileText } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockAssignments = [
    { id: '1', title: 'Binary Tree Implementation', subject: 'Data Structures', code: 'CSE101', dueDate: '2024-01-20', marks: 20, status: 'pending', description: 'Implement a binary search tree with insert, delete, and search operations.' },
    { id: '2', title: 'Sorting Algorithm Analysis', subject: 'Algorithms', code: 'CSE102', dueDate: '2024-01-22', marks: 15, status: 'submitted', submittedAt: '2024-01-19', description: 'Analyze time complexity of different sorting algorithms.' },
    { id: '3', title: 'Database Design Project', subject: 'DBMS', code: 'CSE103', dueDate: '2024-01-25', marks: 30, status: 'pending', description: 'Design a complete database schema for an e-commerce application.' },
    { id: '4', title: 'Process Scheduling', subject: 'Operating Systems', code: 'CSE104', dueDate: '2024-01-18', marks: 20, status: 'graded', submittedAt: '2024-01-17', grade: 18, description: 'Implement CPU scheduling algorithms.' },
    { id: '5', title: 'Graph Theory Problems', subject: 'Discrete Math', code: 'MAT201', dueDate: '2024-01-28', marks: 25, status: 'pending', description: 'Solve graph theory problems including DFS, BFS, and shortest path.' },
];

// =============================================================================
// ASSIGNMENTS PAGE
// =============================================================================

const AssignmentsPage: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

    const filteredAssignments = filter === 'all'
        ? mockAssignments
        : mockAssignments.filter(a => a.status === filter);

    const stats = {
        total: mockAssignments.length,
        pending: mockAssignments.filter(a => a.status === 'pending').length,
        submitted: mockAssignments.filter(a => a.status === 'submitted').length,
        graded: mockAssignments.filter(a => a.status === 'graded').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'bg-orange-500/20', text: 'text-orange-400', variant: 'warning' };
            case 'submitted': return { bg: 'bg-blue-500/20', text: 'text-blue-400', variant: 'info' };
            case 'graded': return { bg: 'bg-green-500/20', text: 'text-green-400', variant: 'success' };
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', variant: 'secondary' };
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

    return (
        <div className="space-y-6">
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

            {/* Filter Tabs */}
            <Card className="p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {(['all', 'pending', 'submitted', 'graded'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors flex-shrink-0 ${filter === status
                                ? 'bg-cyan-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {status} {status !== 'all' && `(${stats[status]})`}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Assignments List */}
            <div className="space-y-4">
                {filteredAssignments.map(assignment => {
                    const statusColors = getStatusColor(assignment.status);
                    const isOverdue = assignment.status === 'pending' && new Date(assignment.dueDate) < new Date();

                    return (
                        <Card key={assignment.id} className={isOverdue ? 'border-red-500/30' : ''}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                                            <FileText className={`w-5 h-5 ${statusColors.text}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-white">{assignment.title}</h3>
                                                <Badge variant={statusColors.variant as any} size="sm" className="capitalize">
                                                    {assignment.status}
                                                </Badge>
                                                {isOverdue && (
                                                    <Badge variant="error" size="sm">Overdue</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{assignment.subject} • {assignment.code}</p>
                                            <p className="text-sm text-slate-500 mt-2">{assignment.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-2 md:w-48">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{formatDate(assignment.dueDate)}</span>
                                    </div>

                                    {assignment.status === 'pending' && (
                                        <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-orange-400'}`}>
                                            {getDaysUntil(assignment.dueDate)}
                                        </span>
                                    )}

                                    {assignment.status === 'graded' && (
                                        <span className="text-lg font-bold text-green-400">
                                            {assignment.grade}/{assignment.marks}
                                        </span>
                                    )}

                                    <div className="text-sm text-slate-400">
                                        {assignment.marks} marks
                                    </div>

                                    {assignment.status === 'pending' && (
                                        <Button size="sm" variant="primary" className="gap-2 mt-2">
                                            <Upload className="w-4 h-4" />
                                            Submit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredAssignments.length === 0 && (
                <Card className="text-center py-12">
                    <ClipboardList className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No {filter === 'all' ? '' : filter} assignments found</p>
                </Card>
            )}
        </div>
    );
};

export default AssignmentsPage;

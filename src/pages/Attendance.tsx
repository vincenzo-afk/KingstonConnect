import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { Avatar } from '@/components/ui/Avatar';
import { UserCheck, X, Clock, Check, Calendar, Loader2 } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockSubjectAttendance = [
    { id: '1', code: 'CSE101', name: 'Data Structures', present: 34, total: 40, percentage: 85 },
    { id: '2', code: 'CSE102', name: 'Algorithms', present: 38, total: 42, percentage: 90 },
    { id: '3', code: 'CSE103', name: 'Database Systems', present: 28, total: 38, percentage: 74 },
    { id: '4', code: 'CSE104', name: 'Operating Systems', present: 35, total: 40, percentage: 88 },
    { id: '5', code: 'MAT201', name: 'Discrete Mathematics', present: 32, total: 36, percentage: 89 },
];

type AttendanceStatus = 'present' | 'absent' | 'late' | null;

interface StudentAttendance {
    id: string;
    name: string;
    rollNumber: string;
    status: AttendanceStatus;
}

const mockStudents: StudentAttendance[] = [
    { id: '1', name: 'John Doe', rollNumber: '21BCE1234', status: null },
    { id: '2', name: 'Jane Smith', rollNumber: '21BCE1235', status: null },
    { id: '3', name: 'Bob Johnson', rollNumber: '21BCE1236', status: null },
    { id: '4', name: 'Alice Williams', rollNumber: '21BCE1237', status: null },
    { id: '5', name: 'Charlie Brown', rollNumber: '21BCE1238', status: null },
];

// =============================================================================
// ATTENDANCE PAGE
// =============================================================================

const AttendancePage: React.FC = () => {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState(mockStudents);
    const [isSaving, setIsSaving] = useState(false);

    const getStatusColor = (percentage: number) => {
        if (percentage >= 75) return 'text-green-400';
        if (percentage >= 65) return 'text-yellow-400';
        return 'text-red-400';
    };



    const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status } : s
        ));
    };

    const markAllPresent = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
    };

    const saveAttendance = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        // Show success notification
    };

    // Student View
    if (user?.role === 'student') {
        const totalPresent = mockSubjectAttendance.reduce((acc, s) => acc + s.present, 0);
        const totalClasses = mockSubjectAttendance.reduce((acc, s) => acc + s.total, 0);
        const overallPercentage = Math.round((totalPresent / totalClasses) * 100);

        return (
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <StatCard
                        title="Overall Attendance"
                        value={`${overallPercentage}%`}
                        icon={<UserCheck className="w-6 h-6" />}
                        variant={overallPercentage >= 75 ? 'success' : overallPercentage >= 65 ? 'warning' : 'error'}
                    />
                    <StatCard
                        title="Present Days"
                        value={totalPresent}
                        icon={<Check className="w-6 h-6" />}
                        variant="primary"
                    />
                    <StatCard
                        title="Absent Days"
                        value={totalClasses - totalPresent}
                        icon={<X className="w-6 h-6" />}
                        variant="error"
                    />
                </div>

                {/* Subject-wise Attendance */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Subject-wise Attendance</h3>
                    <div className="space-y-3">
                        {mockSubjectAttendance.map(subject => (
                            <div key={subject.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-white">{subject.name}</p>
                                        <p className="text-sm text-slate-400">{subject.code}</p>
                                    </div>
                                    <span className={`text-2xl font-bold ${getStatusColor(subject.percentage)}`}>
                                        {subject.percentage}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${subject.percentage >= 75 ? 'bg-green-500' :
                                                subject.percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${subject.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {subject.present}/{subject.total} classes
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Attendance Warning */}
                {overallPercentage < 75 && (
                    <Card className="border-red-500/20 bg-red-500/5">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <X className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="font-medium text-red-400">Low Attendance Warning</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Your attendance is below 75%. You need to attend more classes to be eligible for exams.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    // Teacher/HOD View - Mark Attendance
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Mark Attendance</h3>
                        <p className="text-sm text-slate-400">Data Structures - CSE Section A</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Student List */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Students ({students.length})</h3>
                    <Button variant="outline" size="sm" onClick={markAllPresent}>
                        Mark All Present
                    </Button>
                </div>

                <div className="space-y-2">
                    {students.map(student => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar alt={student.name} size="sm" />
                                <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-sm text-slate-400">{student.rollNumber}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => markAttendance(student.id, 'present')}
                                    className={`p-2 rounded-lg transition-all ${student.status === 'present'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-green-500/20 hover:text-green-400'
                                        }`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => markAttendance(student.id, 'absent')}
                                    className={`p-2 rounded-lg transition-all ${student.status === 'absent'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                                        }`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => markAttendance(student.id, 'late')}
                                    className={`p-2 rounded-lg transition-all ${student.status === 'late'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                                        }`}
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                    <Button variant="outline">Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={saveAttendance}
                        disabled={isSaving}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Attendance'
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AttendancePage;

import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import {
    UserCheck,
    X,
    Clock,
    Check,
    Calendar,
    Loader2,
    Plus,
    Trash2,
    FileQuestion,
} from 'lucide-react';

// =============================================================================
// ATTENDANCE PAGE — fully real data (attendanceStore + teacher roster store)
// =============================================================================

type AttendanceStatus = 'present' | 'absent' | 'late' | null;

interface RosterStudent {
    id: string;
    name: string;
    rollNumber: string;
    status: AttendanceStatus;
}

const AttendancePage: React.FC = () => {
    const { user } = useAuthStore();
    const attendance = useAttendanceStore();
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [students, setStudents] = useState<RosterStudent[]>([]);
    const [newName, setNewName] = useState('');
    const [newRoll, setNewRoll] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveNotice, setSaveNotice] = useState(false);

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    const getStatusColor = (percentage: number) => {
        if (percentage >= 75) return 'text-green-400';
        if (percentage >= 65) return 'text-yellow-400';
        return 'text-red-400';
    };

    const addRosterStudent = () => {
        if (!newName.trim() || !newRoll.trim()) return;
        setStudents((prev) => [
            ...prev,
            {
                id: `${Date.now()}`,
                name: newName.trim(),
                rollNumber: newRoll.trim(),
                status: null,
            },
        ]);
        setNewName('');
        setNewRoll('');
    };

    const removeRosterStudent = (id: string) => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
    };

    const markAttendance = (
        studentId: string,
        status: 'present' | 'absent' | 'late'
    ) => {
        setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status } : s))
        );
    };

    const markAllPresent = () => {
        setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    };

    const saveAttendance = async () => {
        setIsSaving(true);
        // Persist today's roster statuses as each student's attendance record
        for (const s of students) {
            if (s.status) {
                attendance.addRecord(s.id, s.name, s.rollNumber, selectedDate, s.status);
            }
        }
        await new Promise((r) => setTimeout(r, 400));
        setIsSaving(false);
        setSaveNotice(true);
        setTimeout(() => setSaveNotice(false), 3000);
    };

    const addSubject = () => {
        if (!newSubjectName.trim()) return;
        attendance.addSubject(newSubjectName.trim(), newSubjectCode.trim());
        setNewSubjectName('');
        setNewSubjectCode('');
    };

    // ------------------------------- Student View -------------------------------
    if (user?.role === 'student') {
        const subjects = attendance.subjects;
        const overallPercentage = attendance.overallPercentage;
        const totalPresent = subjects.reduce((a, s) => a + s.present, 0);
        const totalClasses = subjects.reduce((a, s) => a + s.total, 0);

        return (
            <div className="space-y-6">
                {subjects.length === 0 && (
                    <Card className="border-white/10">
                        <div className="flex flex-col items-center text-center py-10 gap-3">
                            <FileQuestion className="w-10 h-10 text-slate-500" />
                            <p className="text-white font-medium">
                                No attendance recorded yet
                            </p>
                            <p className="text-sm text-slate-400 max-w-md">
                                Your subjects appear here as soon as attendance is
                                tracked. You can add a subject and log each class
                                below, or ask your teacher to mark attendance.
                            </p>
                            <Button variant="primary" size="sm" onClick={addSubject}>
                                <Plus className="w-4 h-4" /> Add first subject
                            </Button>
                        </div>
                    </Card>
                )}

                {subjects.length > 0 && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <StatCard
                                title="Overall Attendance"
                                value={totalClasses > 0 ? `${overallPercentage}%` : '—'}
                                icon={<UserCheck className="w-6 h-6" />}
                                variant={
                                    overallPercentage >= 75
                                        ? 'success'
                                        : overallPercentage >= 65
                                          ? 'warning'
                                          : 'error'
                                }
                            />
                            <StatCard
                                title="Present Days"
                                value={totalPresent}
                                icon={<Check className="w-6 h-6" />}
                                variant="primary"
                            />
                            <StatCard
                                title="Absent Days"
                                value={Math.max(0, totalClasses - totalPresent)}
                                icon={<X className="w-6 h-6" />}
                                variant="error"
                            />
                        </div>

                        {/* Subject-wise Attendance */}
                        <Card>
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Subject-wise Attendance
                            </h3>
                            <div className="space-y-3">
                                {subjects.map((subject) => {
                                    const pct =
                                        subject.total > 0
                                            ? Math.round(
                                                  (subject.present / subject.total) * 100
                                              )
                                            : 0;
                                    return (
                                        <div
                                            key={subject.id}
                                            className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {subject.name}
                                                        </p>
                                                        {subject.code && (
                                                            <p className="text-sm text-slate-400">
                                                                {subject.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-2xl font-bold ${getStatusColor(pct)}`}
                                                    >
                                                        {subject.total > 0
                                                            ? `${pct}%`
                                                            : '—'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${subject.name}`}
                                                        onClick={() =>
                                                            attendance.removeSubject(subject.id)
                                                        }
                                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            pct >= 75
                                                                ? 'bg-green-500'
                                                                : pct >= 65
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-red-500'
                                                        }`}
                                                        style={{
                                                            width: `${subject.total > 0 ? pct : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">
                                                    {subject.present}/{subject.total} classes
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        attendance.markClass(
                                                            subject.id,
                                                            'present'
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/30 text-sm transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Present
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        attendance.markClass(
                                                            subject.id,
                                                            'absent'
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Absent
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        attendance.markClass(
                                                            subject.id,
                                                            'late'
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/30 text-sm transition-colors"
                                                >
                                                    <Clock className="w-3.5 h-3.5" /> Late
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Add subject */}
                        <Card>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-cyan-400" /> Add a subject
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    placeholder="Subject name (e.g. Data Structures)"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="Code (optional)"
                                    value={newSubjectCode}
                                    onChange={(e) => setNewSubjectCode(e.target.value)}
                                    className="flex-1"
                                />
                                <Button variant="primary" onClick={addSubject}>
                                    Add
                                </Button>
                            </div>
                        </Card>
                    </>
                )}

                {/* Attendance Warning */}
                {totalClasses > 0 && overallPercentage < 75 && (
                    <Card className="border-red-500/20 bg-red-500/5">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <X className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="font-medium text-red-400">
                                    Low Attendance Warning
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Your attendance is below 75%. You need to attend
                                    more classes to be eligible for exams.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    // ------------------------------- Teacher/HOD View -------------------------------
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Mark Attendance
                        </h3>
                        <p className="text-sm text-slate-400">
                            {user?.department ?? 'Section'}
                            {user?.section ? ` · Section ${user.section}` : ''}
                        </p>
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

            {/* Add student to today's roster */}
            <Card>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-cyan-400" /> Add student
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Student name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Roll number"
                        value={newRoll}
                        onChange={(e) => setNewRoll(e.target.value)}
                        className="flex-1"
                    />
                    <Button variant="primary" onClick={addRosterStudent}>
                        Add
                    </Button>
                </div>
            </Card>

            {/* Student List */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">
                        Students ({students.length})
                    </h3>
                    <Button variant="outline" size="sm" onClick={markAllPresent}>
                        Mark All Present
                    </Button>
                </div>

                {students.length === 0 && (
                    <div className="flex flex-col items-center text-center py-8 gap-2 text-slate-400">
                        <UserCheck className="w-8 h-8" />
                        <p className="text-sm">
                            No students added yet. Add names above to start marking
                            attendance for the selected date.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar alt={student.name} size="sm" />
                                <div>
                                    <p className="font-medium text-white">
                                        {student.name}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {student.rollNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => markAttendance(student.id, 'present')}
                                    className={`p-2 rounded-lg transition-all ${
                                        student.status === 'present'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-green-500/20 hover:text-green-400'
                                    }`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => markAttendance(student.id, 'absent')}
                                    className={`p-2 rounded-lg transition-all ${
                                        student.status === 'absent'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                                    }`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => markAttendance(student.id, 'late')}
                                    className={`p-2 rounded-lg transition-all ${
                                        student.status === 'late'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                                    }`}
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeRosterStudent(student.id)}
                                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                    aria-label={`Remove ${student.name}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center gap-3">
                    {saveNotice && (
                        <p className="text-sm text-green-400">
                            Attendance saved for {selectedDate}.
                        </p>
                    )}
                    <div className="flex justify-end gap-3 ml-auto">
                        <Button
                            variant="outline"
                            onClick={() => setStudents([])}
                        >
                            Clear roster
                        </Button>
                        <Button
                            variant="primary"
                            onClick={saveAttendance}
                            disabled={isSaving || students.length === 0}
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
                </div>
            </Card>
        </div>
    );
};

export default AttendancePage;

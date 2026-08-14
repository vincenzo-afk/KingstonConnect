import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useAUResultsStore } from '@/stores/auResultsStore';
import { useAttendanceStore } from '@/stores/attendanceStore';
import {
    UPCOMING_DEADLINES,
} from '@/data/studentData';
import { getAssignmentsStore } from '@/stores/assignmentsStore';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Award, UserCheck, BookOpen, Target, Zap, BookMarked, Users,
    GraduationCap, ClipboardList, Building2, Clock, Check
} from 'lucide-react';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

// =============================================================================
// STUDENT DASHBOARD
// =============================================================================

const StudentDashboard: React.FC = () => {
    const auResults = useAUResultsStore();
    const attendance = useAttendanceStore();

    const cgpa = auResults.getCGPA();
    const credits = auResults.getTotalCredits();
    const overallAttendance = attendance.overallPercentage;
    const attendanceTotal = attendance.overallTotal;
    const attendancePresent = attendance.overallPresent;
    const trend =
        attendanceTotal >= 10
            ? attendancePresent - Math.round(attendanceTotal * 0.8)
            : 0;

    const weak = auResults.getWeakSubjects();

    // Real upcoming deadlines come from the Assignments page; the recent
    // activity feed is derived from submitted/graded assignments (no demo
    // data).
    const upcomingDeadlines = UPCOMING_DEADLINES;
    const recentActivity = getAssignmentsStore()
        .filter((a) => a.status === 'graded' || a.status === 'submitted')
        .slice(-5)
        .map((a, idx) => ({
            id: `${a.id}-${idx}`,
            type: 'graded' as const,
            title: a.title,
            description:
                a.status === 'graded'
                    ? `${a.subject}${a.grade !== undefined && a.marks ? ` — ${a.grade}/${a.marks}` : ''}`
                    : `${a.subject} — submitted${a.submittedAt ? ` on ${formatDate(a.submittedAt)}` : ''}`,
            time: a.submittedAt
                ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '',
        }))
        .reverse();

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="CGPA"
                    value={cgpa !== null ? String(cgpa) : '—'}
                    subtitle={cgpa === null ? 'Fetch from AU Portal' : undefined}
                    icon={<Award className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Attendance"
                    value={
                        attendanceTotal > 0
                            ? `${overallAttendance}%`
                            : '—'
                    }
                    subtitle={
                        attendanceTotal > 0
                            ? `${attendancePresent}/${attendanceTotal} classes`
                            : 'Start recording classes'
                    }
                    icon={<UserCheck className="w-6 h-6" />}
                    trend={
                        attendanceTotal >= 10
                            ? {
                                  value: trend,
                                  positive: trend >= 0,
                                  label: 'vs 80% baseline',
                              }
                            : undefined
                    }
                    variant="success"
                />
                <StatCard
                    title="Credits"
                    value={credits || 0}
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="default"
                />
                <StatCard
                    title="Weak Subjects"
                    value={weak.length || 0}
                    subtitle={weak.length ? 'B or below — review' : 'None detected'}
                    icon={<Target className="w-6 h-6" />}
                    variant="warning"
                />
            </div>

            {/* Quick Actions & Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/studygpt">
                            <Button variant="outline" className="w-full justify-start gap-3 py-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                </div>
                                <span>StudyGPT</span>
                            </Button>
                        </Link>
                        <Link to="/attendance">
                            <Button variant="outline" className="w-full justify-start gap-3 py-3">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <UserCheck className="w-4 h-4 text-green-400" />
                                </div>
                                <span>Attendance</span>
                            </Button>
                        </Link>
                        <Link to="/results">
                            <Button variant="outline" className="w-full justify-start gap-3 py-3">
                                <div className="p-2 rounded-lg bg-yellow-500/20">
                                    <Award className="w-4 h-4 text-yellow-400" />
                                </div>
                                <span>Results</span>
                            </Button>
                        </Link>
                        <Link to="/notes">
                            <Button variant="outline" className="w-full justify-start gap-3 py-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <BookMarked className="w-4 h-4 text-purple-400" />
                                </div>
                                <span>Notes</span>
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? (
                            upcomingDeadlines.map(deadline => (
                                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-500/20">
                                            <Clock className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{deadline.title}</p>
                                            <p className="text-sm text-slate-400">{deadline.subject}</p>
                                        </div>
                                    </div>
                                    <Badge variant="warning">{formatDate(deadline.dueDate)}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center text-center py-6 gap-2 text-slate-400">
                                <ClipboardList className="w-6 h-6" />
                                <p className="text-sm">No upcoming deadlines recorded.</p>
                                <Link to="/assignments">
                                    <Button variant="outline" size="sm">View assignments</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="p-2 rounded-lg bg-cyan-500/20">
                                    <Check className="w-4 h-4 text-cyan-400" />
                                </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{activity.title}</p>
                                        <p className="text-sm text-slate-400">{activity.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center text-center py-6 gap-2 text-slate-400">
                            <Users className="w-6 h-6" />
                            <p className="text-sm">No recent activity yet. Fetch your AU results, mark attendance, or upload notes to see your profile here.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

// =============================================================================
// TEACHER DASHBOARD
// =============================================================================

const TeacherDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Sections Managed"
                    value="—"
                    subtitle="Add sections below"
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Students"
                    value="0"
                    subtitle="Add students to roster"
                    icon={<Users className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Avg Attendance"
                    value="—"
                    subtitle="After marking attendance"
                    icon={<UserCheck className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Pending Tasks"
                    value="0"
                    subtitle="No pending items"
                    icon={<ClipboardList className="w-6 h-6" />}
                    variant="error"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-white/10">
                    <div className="flex flex-col items-center text-center py-8 gap-3 text-slate-400">
                        <Clock className="w-8 h-8" />
                        <p className="text-sm max-w-sm">
                            Today's schedule appears here once you add your classes
                            in the Timetable page.
                        </p>
                        <Link to="/timetable">
                            <Button variant="outline" size="sm">Manage timetable</Button>
                        </Link>
                    </div>
                </Card>
                <Card className="border-white/10">
                    <div className="flex flex-col items-center text-center py-8 gap-3 text-slate-400">
                        <Users className="w-8 h-8" />
                        <p className="text-sm max-w-sm">
                            At-risk students will be flagged automatically once
                            you start recording attendance in the Attendance
                            page.
                        </p>
                        <Link to="/attendance">
                            <Button variant="outline" size="sm">Mark attendance</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// =============================================================================
// HOD DASHBOARD
// =============================================================================

const HODDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Students"
                    value="—"
                    subtitle="No sections added yet"
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Faculty"
                    value="—"
                    subtitle="Add faculty in Teachers page"
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Avg Attendance"
                    value="—"
                    subtitle="After attendance is recorded"
                    icon={<UserCheck className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Avg CGPA"
                    value="—"
                    subtitle="After results are recorded"
                    icon={<Award className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Section Performance Chart */}
            <Card className="border-white/10">
                <div className="flex flex-col items-center text-center py-10 gap-3 text-slate-400">
                    <Building2 className="w-8 h-8" />
                    <p className="text-sm max-w-sm">
                        Section performance analytics appear here once teachers
                        record attendance and results for their sections.
                    </p>
                </div>
            </Card>
        </div>
    );
};

// =============================================================================
// PRINCIPAL DASHBOARD
// =============================================================================

const PrincipalDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Students"
                    value="—"
                    subtitle="No departments configured"
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Faculty"
                    value="—"
                    subtitle="Add faculty in Teachers page"
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Departments"
                    value="0"
                    subtitle="Add departments to start"
                    icon={<Building2 className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Avg CGPA"
                    value="—"
                    subtitle="After results are recorded"
                    icon={<Award className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Department Comparison Chart */}
            <Card className="border-white/10">
                <div className="flex flex-col items-center text-center py-10 gap-3 text-slate-400">
                    <Building2 className="w-8 h-8" />
                    <p className="text-sm max-w-sm">
                        Department-level analytics appear here once departments,
                        faculty, and student data are configured by HODs.
                    </p>
                </div>
            </Card>
        </div>
    );
};

// =============================================================================
// MAIN DASHBOARD PAGE
// =============================================================================

const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();

    const renderDashboard = () => {
        switch (user?.role) {
            case 'student':
                return <StudentDashboard />;
            case 'teacher':
                return <TeacherDashboard />;
            case 'hod':
                return <HODDashboard />;
            case 'principal':
                return <PrincipalDashboard />;
            default:
                return <StudentDashboard />;
        }
    };

    return renderDashboard();
};

export default DashboardPage;

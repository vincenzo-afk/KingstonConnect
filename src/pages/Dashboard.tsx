import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
    Award, UserCheck, BookOpen, Target, Zap, BookMarked, Users,
    GraduationCap, ClipboardList, Building2, Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 65) return 'text-yellow-400';
    return 'text-red-400';
};

// =============================================================================
// STUDENT DASHBOARD
// =============================================================================

const StudentDashboard: React.FC = () => {
    const { user } = useAuthStore();

    const upcomingDeadlines = [
        { id: '1', title: 'DS Assignment 1', subject: 'Data Structures', dueDate: '2024-01-20', type: 'assignment' },
        { id: '2', title: 'Algorithms Quiz', subject: 'Algorithms', dueDate: '2024-01-22', type: 'quiz' },
        { id: '3', title: 'DBMS Project', subject: 'Database Systems', dueDate: '2024-01-25', type: 'project' },
    ];

    const recentActivity = [
        { id: '1', title: 'New notes uploaded', description: 'Data Structures - Chapter 5', time: '2 hours ago', icon: BookMarked },
        { id: '2', title: 'Assignment graded', description: 'Algorithms Assignment 2 - 18/20', time: '5 hours ago', icon: Award },
        { id: '3', title: 'Attendance marked', description: 'Present in DBMS class', time: '1 day ago', icon: UserCheck },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="CGPA"
                    value={user?.cgpa?.toFixed(1) || '0.0'}
                    icon={<Award className="w-6 h-6" />}
                    trend={{ value: 5, positive: true, label: 'from last sem' }}
                    variant="primary"
                />
                <StatCard
                    title="Attendance"
                    value="85%"
                    icon={<UserCheck className="w-6 h-6" />}
                    trend={{ value: 2, positive: true, label: 'this month' }}
                    variant="success"
                />
                <StatCard
                    title="Credits"
                    value={user?.credits || 0}
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="default"
                />
                <StatCard
                    title="Rank"
                    value={`#${user?.rank || 0}`}
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
                        {upcomingDeadlines.map(deadline => (
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
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.map(activity => {
                        const Icon = activity.icon;
                        return (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="p-2 rounded-lg bg-cyan-500/20">
                                    <Icon className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{activity.title}</p>
                                    <p className="text-sm text-slate-400">{activity.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

// =============================================================================
// TEACHER DASHBOARD
// =============================================================================

const TeacherDashboard: React.FC = () => {
    const todaySchedule = [
        { id: '1', time: '09:00 - 10:00', subject: 'Data Structures', section: 'CSE-A', room: 'A101' },
        { id: '2', time: '11:00 - 12:00', subject: 'Algorithms', section: 'CSE-B', room: 'A102' },
        { id: '3', time: '14:00 - 15:00', subject: 'DBMS', section: 'CSE-A', room: 'A103' },
    ];

    const atRiskStudents = [
        { id: '1', name: 'John Doe', rollNumber: '21BCE1234', attendance: 62, cgpa: 6.2 },
        { id: '2', name: 'Jane Smith', rollNumber: '21BCE1235', attendance: 58, cgpa: 5.8 },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Classes"
                    value="24"
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Students"
                    value="180"
                    icon={<Users className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Avg Attendance"
                    value="82%"
                    icon={<UserCheck className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Pending Tasks"
                    value="8"
                    icon={<ClipboardList className="w-6 h-6" />}
                    variant="error"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Today's Schedule</h3>
                    <div className="space-y-3">
                        {todaySchedule.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <div>
                                    <p className="font-medium text-white">{slot.subject}</p>
                                    <p className="text-sm text-slate-400">{slot.section} • {slot.room}</p>
                                </div>
                                <Badge>{slot.time}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* At-Risk Students */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">At-Risk Students</h3>
                    <div className="space-y-3">
                        {atRiskStudents.map(student => (
                            <div key={student.id} className="p-3 rounded-xl bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar alt={student.name} size="sm" />
                                        <div>
                                            <p className="font-medium text-white">{student.name}</p>
                                            <p className="text-sm text-slate-400">{student.rollNumber}</p>
                                        </div>
                                    </div>
                                    <Badge variant="error">At Risk</Badge>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <span className={getAttendanceColor(student.attendance)}>
                                        Attendance: {student.attendance}%
                                    </span>
                                    <span className="text-yellow-400">
                                        CGPA: {student.cgpa}
                                    </span>
                                </div>
                            </div>
                        ))}
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
    const departmentMetrics = [
        { name: 'Section A', students: 60, avgAttendance: 85, avgCGPA: 8.2 },
        { name: 'Section B', students: 58, avgAttendance: 82, avgCGPA: 7.9 },
        { name: 'Section C', students: 62, avgAttendance: 88, avgCGPA: 8.5 },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Students"
                    value="180"
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Faculty"
                    value="12"
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Avg Attendance"
                    value="85%"
                    icon={<UserCheck className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Avg CGPA"
                    value="8.2"
                    icon={<Award className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Section Performance Chart */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Section Performance</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a2332',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="avgAttendance" fill="#22d3ee" name="Avg Attendance %" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgCGPA" fill="#a855f7" name="Avg CGPA" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

// =============================================================================
// PRINCIPAL DASHBOARD
// =============================================================================

const PrincipalDashboard: React.FC = () => {
    const collegeStats = [
        { department: 'CSE', students: 180, faculty: 12, avgCGPA: 8.2 },
        { department: 'ECE', students: 160, faculty: 10, avgCGPA: 7.9 },
        { department: 'EEE', students: 140, faculty: 9, avgCGPA: 7.8 },
        { department: 'MECH', students: 150, faculty: 11, avgCGPA: 7.6 },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Students"
                    value="630"
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Faculty"
                    value="42"
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Departments"
                    value="4"
                    icon={<Building2 className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Avg CGPA"
                    value="7.9"
                    icon={<Award className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Department Comparison Chart */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Department Comparison</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={collegeStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="department" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a2332',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="students" fill="#22d3ee" name="Students" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="faculty" fill="#10b981" name="Faculty" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
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

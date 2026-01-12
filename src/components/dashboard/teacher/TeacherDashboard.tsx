import React from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import {
    Users,
    ClipboardCheck,
    FileText,
    Calendar,
    Upload,
    CheckSquare,
    PenTool,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const mockStats = {
    totalStudents: 68,
    presentToday: 62,
    absentToday: 6,
    pendingAssignments: 3,
};

const quickActions = [
    { id: 1, label: 'Mark Attendance', icon: CheckSquare, color: 'cyan', href: '/attendance' },
    { id: 2, label: 'Upload Notes', icon: Upload, color: 'sky', href: '/notes' },
    { id: 3, label: 'Enter Marks', icon: PenTool, color: 'teal', href: '/results' },
    { id: 4, label: 'Add Event', icon: Calendar, color: 'cyan', href: '/calendar' },
];

const recentStudents = [
    { id: 1, name: 'Arun Kumar', regNo: 'KIT192001', attendance: 92, status: 'present' },
    { id: 2, name: 'Priya Sharma', regNo: 'KIT192002', attendance: 88, status: 'present' },
    { id: 3, name: 'Raj Patel', regNo: 'KIT192003', attendance: 65, status: 'absent' },
    { id: 4, name: 'Sneha Reddy', regNo: 'KIT192004', attendance: 95, status: 'present' },
    { id: 5, name: 'Vikram Singh', regNo: 'KIT192005', attendance: 72, status: 'late' },
];

const upcomingEvents = [
    { id: 1, title: 'Unit Test 2', date: 'Jan 15', type: 'exam' },
    { id: 2, title: 'Lab Assignment Due', date: 'Jan 18', type: 'deadline' },
    { id: 3, title: 'Department Meeting', date: 'Jan 20', type: 'event' },
];

export const TeacherDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const sectionName = user?.section ? `${user.department?.code || ''}-${user.year}${user.section}` : 'Your Class';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Class: <span className="text-cyan-400 font-medium">{sectionName}</span> • {mockStats.totalStudents} Students
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
                        View Reports
                    </Button>
                    <Button glow icon={<ClipboardCheck className="w-4 h-4" />}>
                        Mark Attendance
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Card
                        key={action.id}
                        hover
                        className="cursor-pointer group bg-white/5 border-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center p-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all border border-white/5">
                                <action.icon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{action.label}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Students"
                    value={mockStats.totalStudents}
                    subtitle="In your class"
                    icon={<Users className="w-6 h-6" />}
                    color="primary"
                />
                <StatCard
                    title="Present Today"
                    value={mockStats.presentToday}
                    subtitle={`${Math.round((mockStats.presentToday / mockStats.totalStudents) * 100)}% attendance`}
                    icon={<CheckSquare className="w-6 h-6" />}
                    color="success"
                />
                <StatCard
                    title="Absent Today"
                    value={mockStats.absentToday}
                    subtitle="Students not present"
                    icon={<ClipboardCheck className="w-6 h-6" />}
                    color="error"
                />
                <StatCard
                    title="Pending Tasks"
                    value={mockStats.pendingAssignments}
                    subtitle="Assignments to grade"
                    icon={<PenTool className="w-6 h-6" />}
                    color="warning"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students List */}
                <Card variant="glass" className="lg:col-span-2 p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">Today's Attendance</h2>
                        <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                            View All
                        </Button>
                    </div>
                    <div className="p-6 space-y-3">
                        {recentStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Avatar name={student.name} size="md" glow />
                                    <div>
                                        <p className="font-medium text-white">{student.name}</p>
                                        <p className="text-sm text-slate-400">{student.regNo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-white">{student.attendance}%</p>
                                        <p className="text-xs text-slate-500">Attendance</p>
                                    </div>
                                    <Badge
                                        variant={
                                            student.status === 'present'
                                                ? 'success'
                                                : student.status === 'absent'
                                                    ? 'error'
                                                    : 'warning'
                                        }
                                    >
                                        {student.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Attendance Overview */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-semibold text-white">Today's Overview</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Present</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                            style={{ width: `${(mockStats.presentToday / mockStats.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-white">{mockStats.presentToday}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Absent</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{ width: `${(mockStats.absentToday / mockStats.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-white">{mockStats.absentToday}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Upcoming Events */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="font-semibold text-white">Upcoming Events</h3>
                            <Calendar className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="p-6 space-y-3">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-center min-w-[48px] p-2 bg-white/5 rounded-lg">
                                        <p className="text-xs text-slate-400 uppercase">{event.date.split(' ')[0]}</p>
                                        <p className="text-lg font-bold text-white">{event.date.split(' ')[1]}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                        <div className="mt-1">
                                            <Badge
                                                size="sm"
                                                variant={
                                                    event.type === 'exam'
                                                        ? 'error'
                                                        : event.type === 'deadline'
                                                            ? 'warning'
                                                            : 'info'
                                                }
                                            >
                                                {event.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* StudyGPT for Teachers */}
                    <Card variant="gradient" className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20" glow>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">StudyGPT for Teachers</h3>
                            <p className="text-xs text-slate-400 mb-4">
                                Generate quizzes, rubrics, and teaching plans instantly.
                            </p>
                            <Button size="sm" glow className="w-full">
                                Open StudyGPT
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

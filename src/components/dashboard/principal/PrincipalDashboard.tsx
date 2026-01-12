import React from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Users,
    GraduationCap,
    Building2,
    BarChart3,
    AlertTriangle,
    HardDrive,
    Bell,
    ArrowRight,
    Activity,
    Sparkles,
} from 'lucide-react';

// Mock data - will be replaced with real data from Firebase
const mockStats = {
    totalStudents: 5000,
    totalTeachers: 250,
    totalDepartments: 18,
    avgAttendance: 87.5,
    storageUsed: 876,
    storageTotal: 1024,
    atRiskStudents: 45,
};

const recentActivity = [
    { id: 1, type: 'announcement', message: 'New semester schedule published', time: '10m ago' },
    { id: 2, type: 'attendance', message: 'CSE-2A attendance marked by Prof. Kumar', time: '25m ago' },
    { id: 3, type: 'result', message: 'Unit Test 1 results published for ECE-3B', time: '1h ago' },
    { id: 4, type: 'note', message: 'New study material uploaded for Physics', time: '2h ago' },
];

const departmentStats = [
    { name: 'CSE', students: 850, attendance: 91 },
    { name: 'ECE', students: 720, attendance: 88 },
    { name: 'EEE', students: 580, attendance: 85 },
    { name: 'MECH', students: 650, attendance: 82 },
    { name: 'CIVIL', students: 420, attendance: 79 },
];

export const PrincipalDashboard: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Principal Dashboard</h1>
                    <p className="text-cyan-200/60 mt-1">Welcome back! Here's an overview of your institution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" icon={<Bell className="w-4 h-4" />}>
                        Send Announcement
                    </Button>
                    <Button glow icon={<BarChart3 className="w-4 h-4" />}>
                        View Reports
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Students"
                    value={mockStats.totalStudents.toLocaleString()}
                    subtitle="Across all departments"
                    icon={<GraduationCap className="w-6 h-6" />}
                    color="primary"
                    trend={{ value: 5.2, positive: true, label: 'vs last year' }}
                />
                <StatCard
                    title="Total Teachers"
                    value={mockStats.totalTeachers}
                    subtitle="Active faculty members"
                    icon={<Users className="w-6 h-6" />}
                    color="accent"
                />
                <StatCard
                    title="Departments"
                    value={mockStats.totalDepartments}
                    subtitle="Active departments"
                    icon={<Building2 className="w-6 h-6" />}
                    color="success"
                />
                <StatCard
                    title="Avg Attendance"
                    value={`${mockStats.avgAttendance}%`}
                    subtitle="This month"
                    icon={<Activity className="w-6 h-6" />}
                    color="warning"
                    trend={{ value: 2.1, positive: true, label: 'vs last month' }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Overview */}
                <Card variant="glass" className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Department Overview</h2>
                        <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {departmentStats.map((dept) => (
                            <div key={dept.name} className="flex items-center gap-4 p-4 bg-cyan-500/5 rounded-xl hover:bg-cyan-500/10 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">{dept.name}</span>
                                        <span className="text-sm text-cyan-200/50">{dept.students} students</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-cyan-500/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full transition-all duration-500"
                                                style={{ width: `${dept.attendance}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-white">{dept.attendance}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Storage Monitor */}
                    <Card variant="glass">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Storage Usage</h3>
                            <HardDrive className="w-5 h-5 text-cyan-300/50" />
                        </div>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-cyan-200/50">
                                    {mockStats.storageUsed}MB / {mockStats.storageTotal}MB
                                </span>
                                <span className="text-sm font-medium text-[#36B7D9]">
                                    {Math.round((mockStats.storageUsed / mockStats.storageTotal) * 100)}%
                                </span>
                            </div>
                            <div className="h-3 bg-cyan-500/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#36B7D9] to-cyan-500 rounded-full transition-all duration-500 relative"
                                    style={{ width: `${(mockStats.storageUsed / mockStats.storageTotal) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                </div>
                            </div>
                            <p className="text-xs text-cyan-300/40 mt-2">
                                Last cleanup: 2 hours ago
                            </p>
                        </div>
                    </Card>

                    {/* At-Risk Students Alert */}
                    <Card variant="glass" className="border-[#0369A1]/30 bg-[#0369A1]/5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#0369A1]/20 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-[#0369A1]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">At-Risk Students</h3>
                                <p className="text-sm text-cyan-200/50 mt-1">
                                    {mockStats.atRiskStudents} students need attention
                                </p>
                                <Button variant="outline" size="sm" className="mt-3 border-[#0369A1]/40 text-[#0369A1] hover:bg-[#0369A1]/10">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card variant="glass">
                        <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-cyan-500/5 rounded-xl">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
                                    <div className="flex-1">
                                        <p className="text-sm text-cyan-100">{activity.message}</p>
                                        <p className="text-xs text-cyan-300/40 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* StudyGPT Analytics */}
                    <Card variant="glass" className="bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border-cyan-500/30" glow>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">Institution Analytics</h3>
                            <p className="text-xs text-cyan-200/50 mb-3">
                                AI-powered performance insights
                            </p>
                            <Button size="sm" glow className="w-full">
                                View Analytics
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

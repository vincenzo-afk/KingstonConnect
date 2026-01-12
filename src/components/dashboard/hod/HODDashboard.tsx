import React from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import {
    Users,
    GraduationCap,
    ClipboardCheck,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowRight,
    UserPlus,
    Sparkles,
} from 'lucide-react';

const mockStats = {
    totalStudents: 450,
    totalTeachers: 24,
    sections: 12,
    avgAttendance: 89.2,
    pendingApprovals: 8,
    atRiskStudents: 12,
};

const pendingApprovals = [
    { id: 1, type: 'note', teacher: 'Prof. Sharma', subject: 'Thermodynamics Notes Ch-5', time: '1h ago' },
    { id: 2, type: 'result', teacher: 'Prof. Kumar', subject: 'Unit Test 1 Results - 2A', time: '2h ago' },
    { id: 3, type: 'note', teacher: 'Prof. Raj', subject: 'Data Structures Lab Manual', time: '3h ago' },
];

const riskyStudents = [
    { id: 1, name: 'Ravi K', regNo: 'KIT192045', section: '2A', attendance: 62, avgMarks: 38 },
    { id: 2, name: 'Priya M', regNo: 'KIT192078', section: '2B', attendance: 58, avgMarks: 42 },
    { id: 3, name: 'Arun S', regNo: 'KIT192112', section: '3A', attendance: 55, avgMarks: 35 },
];

const teachers = [
    { id: 1, name: 'Prof. Sharma', section: '2A', students: 68, status: 'online' },
    { id: 2, name: 'Prof. Kumar', section: '2B', students: 65, status: 'online' },
    { id: 3, name: 'Prof. Raj', section: '3A', students: 72, status: 'offline' },
    { id: 4, name: 'Prof. Singh', section: '3B', students: 70, status: 'away' },
];

export const HODDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const departmentName = user?.department?.name || 'Department';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">HOD Dashboard</h1>
                    <p className="text-cyan-200/60 mt-1">
                        Managing <span className="text-cyan-400 font-medium">{departmentName}</span> Department
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" icon={<UserPlus className="w-4 h-4" />}>
                        Add Teacher
                    </Button>
                    <Button glow icon={<Users className="w-4 h-4" />}>
                        Manage Students
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Department Students"
                    value={mockStats.totalStudents}
                    subtitle="Active students"
                    icon={<GraduationCap className="w-6 h-6" />}
                    color="primary"
                />
                <StatCard
                    title="Teachers"
                    value={mockStats.totalTeachers}
                    subtitle="Faculty members"
                    icon={<Users className="w-6 h-6" />}
                    color="accent"
                />
                <StatCard
                    title="Pending Approvals"
                    value={mockStats.pendingApprovals}
                    subtitle="Notes & Results"
                    icon={<Clock className="w-6 h-6" />}
                    color="warning"
                />
                <StatCard
                    title="At-Risk Students"
                    value={mockStats.atRiskStudents}
                    subtitle="Need attention"
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="error"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Approvals */}
                    <Card variant="glass">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
                            <Badge variant="warning" glow>{mockStats.pendingApprovals} pending</Badge>
                        </div>
                        <div className="space-y-3">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-xl hover:bg-cyan-500/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'note' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#0891B2]/20 text-[#0891B2]'
                                            }`}>
                                            {item.type === 'note' ? <FileText className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{item.subject}</p>
                                            <p className="text-sm text-cyan-200/50">{item.teacher} • {item.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="text-[#0369A1] hover:text-[#024e85] hover:bg-[#0369A1]/10">
                                            Reject
                                        </Button>
                                        <Button size="sm" glow icon={<CheckCircle className="w-4 h-4" />}>
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* At-Risk Students */}
                    <Card variant="glass">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">At-Risk Students</h2>
                            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-cyan-200/50 border-b border-cyan-500/20">
                                        <th className="pb-3 font-medium">Student</th>
                                        <th className="pb-3 font-medium">Section</th>
                                        <th className="pb-3 font-medium">Attendance</th>
                                        <th className="pb-3 font-medium">Avg Marks</th>
                                        <th className="pb-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {riskyStudents.map((student) => (
                                        <tr key={student.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={student.name} size="sm" glow />
                                                    <div>
                                                        <p className="font-medium text-white">{student.name}</p>
                                                        <p className="text-xs text-cyan-300/50">{student.regNo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-cyan-100">{student.section}</td>
                                            <td className="py-4">
                                                <Badge variant="error">{student.attendance}%</Badge>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant="warning">{student.avgMarks}%</Badge>
                                            </td>
                                            <td className="py-4">
                                                <Button variant="ghost" size="sm">
                                                    Contact
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Teachers */}
                <div className="space-y-6">
                    <Card variant="glass">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Teachers</h2>
                            <Badge variant="info" glow>{mockStats.totalTeachers} total</Badge>
                        </div>
                        <div className="space-y-3">
                            {teachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-center gap-3 p-3 bg-cyan-500/5 rounded-xl hover:bg-cyan-500/10 transition-colors cursor-pointer">
                                    <Avatar
                                        name={teacher.name}
                                        size="md"
                                        status={teacher.status as 'online' | 'offline' | 'away'}
                                        glow
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{teacher.name}</p>
                                        <p className="text-xs text-cyan-200/50">
                                            Section {teacher.section} • {teacher.students} students
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" className="w-full mt-4">
                            View All Teachers
                        </Button>
                    </Card>

                    {/* StudyGPT for HOD */}
                    <Card variant="glass" className="bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border-cyan-500/30" glow>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white mb-1">Department Analytics</h3>
                            <p className="text-xs text-cyan-200/50 mb-3">
                                AI-powered insights for your department
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

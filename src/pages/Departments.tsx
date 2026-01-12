import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Users, GraduationCap, Plus, MoreVertical, TrendingUp } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockDepartments = [
    { id: '1', name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Smith', students: 180, faculty: 12, avgCGPA: 8.2, avgAttendance: 85 },
    { id: '2', name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Johnson', students: 160, faculty: 10, avgCGPA: 7.9, avgAttendance: 82 },
    { id: '3', name: 'Electrical & Electronics', code: 'EEE', hod: 'Dr. Williams', students: 140, faculty: 9, avgCGPA: 7.8, avgAttendance: 80 },
    { id: '4', name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Brown', students: 150, faculty: 11, avgCGPA: 7.6, avgAttendance: 78 },
];

const departmentColors: Record<string, { bg: string; gradient: string; text: string }> = {
    'CSE': { bg: 'from-cyan-500/20 to-blue-500/20', gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
    'ECE': { bg: 'from-purple-500/20 to-pink-500/20', gradient: 'from-purple-500 to-pink-500', text: 'text-purple-400' },
    'EEE': { bg: 'from-yellow-500/20 to-orange-500/20', gradient: 'from-yellow-500 to-orange-500', text: 'text-yellow-400' },
    'MECH': { bg: 'from-green-500/20 to-emerald-500/20', gradient: 'from-green-500 to-emerald-500', text: 'text-green-400' },
};

// =============================================================================
// DEPARTMENTS PAGE
// =============================================================================

const DepartmentsPage: React.FC = () => {
    const totalStudents = mockDepartments.reduce((acc, d) => acc + d.students, 0);
    const totalFaculty = mockDepartments.reduce((acc, d) => acc + d.faculty, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Departments</h2>
                    <p className="text-slate-400">{mockDepartments.length} departments</p>
                </div>
                <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Department
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{mockDepartments.length}</p>
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
                            <p className="text-2xl font-bold text-white">{totalStudents}</p>
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
                            <p className="text-2xl font-bold text-white">{totalFaculty}</p>
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
                            <p className="text-2xl font-bold text-white">7.9</p>
                            <p className="text-sm text-slate-400">Avg CGPA</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockDepartments.map(dept => {
                    const colors = departmentColors[dept.code] || departmentColors['CSE'];

                    return (
                        <Card key={dept.id} className={`bg-gradient-to-br ${colors.bg} border-white/10 hover:border-white/20 transition-colors`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient}`}>
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{dept.code}</h3>
                                        <p className="text-sm text-slate-400">{dept.name}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="p-2">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-slate-400">Head of Department</p>
                                <p className={`font-medium ${colors.text}`}>{dept.hod}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-black/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-400">Students</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{dept.students}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-black/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <GraduationCap className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-400">Faculty</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{dept.faculty}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Average CGPA</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                                style={{ width: `${(dept.avgCGPA / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium ${colors.text}`}>{dept.avgCGPA}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Avg Attendance</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                                style={{ width: `${dept.avgAttendance}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium ${colors.text}`}>{dept.avgAttendance}%</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default DepartmentsPage;

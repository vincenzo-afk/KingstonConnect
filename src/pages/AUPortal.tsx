import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, RefreshCw, Calendar, Award, BookOpen, FileText, Clock } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockStudentData = {
    profile: {
        name: 'John Doe',
        registerNumber: '21BCE1234',
        department: 'Computer Science and Engineering',
        college: 'Kingston Engineering College',
        batch: '2021-2025',
        semester: 6,
    },
    results: [
        { semester: 5, sgpa: 8.5, credits: 24, grade: 'First Class with Distinction' },
        { semester: 4, sgpa: 8.3, credits: 24, grade: 'First Class with Distinction' },
        { semester: 3, sgpa: 8.2, credits: 24, grade: 'First Class with Distinction' },
        { semester: 2, sgpa: 8.0, credits: 24, grade: 'First Class with Distinction' },
        { semester: 1, sgpa: 7.8, credits: 24, grade: 'First Class' },
    ],
    examSchedule: [
        { code: 'CSE501', name: 'Data Structures', date: '2024-02-01', time: '09:00 AM - 12:00 PM', venue: 'Hall A' },
        { code: 'CSE502', name: 'Algorithms', date: '2024-02-03', time: '09:00 AM - 12:00 PM', venue: 'Hall B' },
        { code: 'CSE503', name: 'Database Systems', date: '2024-02-05', time: '09:00 AM - 12:00 PM', venue: 'Hall A' },
    ],
    internals: [
        { code: 'CSE501', name: 'Data Structures', internal1: 22, internal2: 24, internal3: 23, assignment: 9, total: 78 },
        { code: 'CSE502', name: 'Algorithms', internal1: 24, internal2: 23, internal3: 25, assignment: 10, total: 82 },
        { code: 'CSE503', name: 'Database Systems', internal1: 21, internal2: 22, internal3: 24, assignment: 8, total: 75 },
    ],
};

// =============================================================================
// AU PORTAL PAGE
// =============================================================================

const AUPortalPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'results' | 'exams' | 'internals'>('profile');

    const handleRefresh = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateCGPA = () => {
        const totalCredits = mockStudentData.results.reduce((acc, r) => acc + r.credits, 0);
        const totalPoints = mockStudentData.results.reduce((acc, r) => acc + (r.sgpa * r.credits), 0);
        return (totalPoints / totalCredits).toFixed(2);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25">
                            <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Anna University Portal</h2>
                            <p className="text-slate-400">Synced data from coe1.annauniv.edu</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={isConnected ? 'success' : 'error'}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Syncing...' : 'Refresh Data'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="CGPA"
                    value={calculateCGPA()}
                    icon={<Award className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Semester"
                    value={mockStudentData.profile.semester}
                    icon={<Calendar className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Total Credits"
                    value={mockStudentData.results.reduce((acc, r) => acc + r.credits, 0)}
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Exams"
                    value={mockStudentData.examSchedule.length}
                    icon={<FileText className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Tabs */}
            <Card className="p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {(['profile', 'results', 'exams', 'internals'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors flex-shrink-0 ${activeTab === tab
                                ? 'bg-cyan-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Student Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">Full Name</p>
                                <p className="text-white font-medium">{mockStudentData.profile.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Register Number</p>
                                <p className="text-white font-medium">{mockStudentData.profile.registerNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Department</p>
                                <p className="text-white font-medium">{mockStudentData.profile.department}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">College</p>
                                <p className="text-white font-medium">{mockStudentData.profile.college}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Batch</p>
                                <p className="text-white font-medium">{mockStudentData.profile.batch}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Current Semester</p>
                                <p className="text-white font-medium">Semester {mockStudentData.profile.semester}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'results' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Semester Results</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-slate-400 font-medium">Semester</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">SGPA</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Credits</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockStudentData.results.map(result => (
                                    <tr key={result.semester} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 text-white font-medium">Semester {result.semester}</td>
                                        <td className="p-4 text-center">
                                            <span className="text-lg font-bold text-cyan-400">{result.sgpa}</span>
                                        </td>
                                        <td className="p-4 text-center text-slate-300">{result.credits}</td>
                                        <td className="p-4">
                                            <Badge variant="success" size="sm">{result.grade}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'exams' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Exam Schedule</h3>
                    <div className="space-y-3">
                        {mockStudentData.examSchedule.map(exam => (
                            <div key={exam.code} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{exam.name}</p>
                                        <p className="text-sm text-slate-400">{exam.code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-cyan-400 font-medium">{formatDate(exam.date)}</p>
                                        <p className="text-sm text-slate-400 flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" />
                                            {exam.time}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-slate-500">
                                    Venue: {exam.venue}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'internals' && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Internal Marks</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-slate-400 font-medium">Subject</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Int 1</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Int 2</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Int 3</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Assign</th>
                                    <th className="text-center p-4 text-slate-400 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockStudentData.internals.map(subject => (
                                    <tr key={subject.code} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <p className="font-medium text-white">{subject.name}</p>
                                            <p className="text-sm text-slate-400">{subject.code}</p>
                                        </td>
                                        <td className="p-4 text-center text-slate-300">{subject.internal1}/25</td>
                                        <td className="p-4 text-center text-slate-300">{subject.internal2}/25</td>
                                        <td className="p-4 text-center text-slate-300">{subject.internal3}/25</td>
                                        <td className="p-4 text-center text-slate-300">{subject.assignment}/10</td>
                                        <td className="p-4 text-center">
                                            <span className="text-lg font-bold text-cyan-400">{subject.total}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AUPortalPage;

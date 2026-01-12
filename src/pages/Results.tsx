import React from 'react';
import { Card, StatCard } from '@/components/ui/Card';

import { Award, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockResults = [
    { id: '1', code: 'CSE101', name: 'Data Structures', credits: 4, grade: 'A', gradePoints: 9, marks: 85 },
    { id: '2', code: 'CSE102', name: 'Algorithms', credits: 4, grade: 'A+', gradePoints: 10, marks: 92 },
    { id: '3', code: 'CSE103', name: 'Database Systems', credits: 3, grade: 'A', gradePoints: 9, marks: 88 },
    { id: '4', code: 'CSE104', name: 'Operating Systems', credits: 3, grade: 'B+', gradePoints: 8, marks: 76 },
    { id: '5', code: 'MAT201', name: 'Discrete Mathematics', credits: 3, grade: 'A', gradePoints: 9, marks: 84 },
];

const semesterProgress = [
    { semester: 'Sem 1', cgpa: 7.8 },
    { semester: 'Sem 2', cgpa: 8.0 },
    { semester: 'Sem 3', cgpa: 8.2 },
    { semester: 'Sem 4', cgpa: 8.3 },
    { semester: 'Sem 5', cgpa: 8.5 },
];

// =============================================================================
// RESULTS PAGE
// =============================================================================

const ResultsPage: React.FC = () => {
    const totalCredits = mockResults.reduce((acc, r) => acc + r.credits, 0);
    const totalGradePoints = mockResults.reduce((acc, r) => acc + (r.gradePoints * r.credits), 0);
    const sgpa = (totalGradePoints / totalCredits).toFixed(2);

    const getGradeColor = (grade: string) => {
        if (['A+', 'A'].includes(grade)) return 'text-green-400';
        if (['B+', 'B'].includes(grade)) return 'text-blue-400';
        if (['C+', 'C'].includes(grade)) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getGradeBg = (grade: string) => {
        if (['A+', 'A'].includes(grade)) return 'bg-green-500/20';
        if (['B+', 'B'].includes(grade)) return 'bg-blue-500/20';
        if (['C+', 'C'].includes(grade)) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Current CGPA"
                    value="8.5"
                    icon={<Award className="w-6 h-6" />}
                    trend={{ value: 3, positive: true, label: 'from last sem' }}
                    variant="primary"
                />
                <StatCard
                    title="Current SGPA"
                    value={sgpa}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Total Credits"
                    value="120"
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="default"
                />
                <StatCard
                    title="Semester"
                    value="6"
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="warning"
                />
            </div>

            {/* CGPA Progress Chart */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">CGPA Progress</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={semesterProgress}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="semester" stroke="#94a3b8" />
                            <YAxis domain={[6, 10]} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a2332',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cgpa"
                                stroke="#22d3ee"
                                strokeWidth={3}
                                dot={{ fill: '#22d3ee', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, fill: '#22d3ee' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Semester Results Table */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Semester 5 Results</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-slate-400 font-medium">Subject</th>
                                <th className="text-left p-4 text-slate-400 font-medium">Code</th>
                                <th className="text-center p-4 text-slate-400 font-medium">Credits</th>
                                <th className="text-center p-4 text-slate-400 font-medium">Marks</th>
                                <th className="text-center p-4 text-slate-400 font-medium">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockResults.map(result => (
                                <tr key={result.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">{result.name}</td>
                                    <td className="p-4 text-slate-400">{result.code}</td>
                                    <td className="p-4 text-center text-slate-300">{result.credits}</td>
                                    <td className="p-4 text-center text-slate-300">{result.marks}/100</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold ${getGradeBg(result.grade)} ${getGradeColor(result.grade)}`}>
                                            {result.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-white/10">
                                <td colSpan={2} className="p-4 text-white font-semibold">Total</td>
                                <td className="p-4 text-center text-cyan-400 font-semibold">{totalCredits}</td>
                                <td className="p-4 text-center text-cyan-400 font-semibold">
                                    {Math.round(mockResults.reduce((acc, r) => acc + r.marks, 0) / mockResults.length)}/100 Avg
                                </td>
                                <td className="p-4 text-center text-cyan-400 font-semibold">SGPA: {sgpa}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* Grade Distribution */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Grade Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['A+', 'A', 'B+', 'B', 'C'].map(grade => {
                        const count = mockResults.filter(r => r.grade === grade).length;
                        return (
                            <div key={grade} className={`p-4 rounded-xl text-center ${getGradeBg(grade)}`}>
                                <p className={`text-3xl font-bold ${getGradeColor(grade)}`}>{count}</p>
                                <p className="text-sm text-slate-400">Grade {grade}</p>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ResultsPage;

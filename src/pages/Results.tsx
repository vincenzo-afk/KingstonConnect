import React from 'react';
import { Link } from 'react-router-dom';
import { useAUResultsStore, AU_GRADE_POINTS } from '@/stores/auResultsStore';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    Award,
    BookOpen,
    GraduationCap,
    TrendingUp,
    FileQuestion,
    Plus,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// =============================================================================
// RESULTS PAGE — real data from the AU portal fetch / manual entry store
// =============================================================================

const ResultsPage: React.FC = () => {
    const store = useAUResultsStore();
    const cgpa = store.getCGPA();
    const totalCredits = store.getTotalCredits();
    const totalSubjects = store.semesters.reduce(
        (sum, s) => sum + s.subjects.length,
        0
    );

    // CGPA trajectory from recorded semesters (real data only)
    const trajectory = store.semesters
        .map((sem) => {
            const credits = sem.subjects.reduce(
                (a, s) => a + (s.credits || 0),
                0
            );
            const points = sem.subjects.reduce(
                (a, s) => a + s.credits * (AU_GRADE_POINTS[s.grade] ?? 0),
                0
            );
            return {
                semester: `Sem ${sem.semester}`,
                cgpa: credits > 0 ? parseFloat((points / credits).toFixed(2)) : 0,
            };
        })
        .filter((t) => t.cgpa > 0)
        .sort((a, b) => a.semester.localeCompare(b.semester));

    // All subjects from all recorded semesters
    const allResults = store.semesters.flatMap((sem) =>
        sem.subjects.map((s) => ({ ...s, semester: sem.semester }))
    );
    const latestSemester = store.semesters[store.semesters.length - 1];

    const getGradeColor = (grade: string) => {
        if (['O', 'A+', 'A'].includes(grade)) return 'text-green-400';
        if (['B+', 'B'].includes(grade)) return 'text-blue-400';
        if (['C', 'P'].includes(grade)) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getGradeBg = (grade: string) => {
        if (['O', 'A+', 'A'].includes(grade)) return 'bg-green-500/20';
        if (['B+', 'B'].includes(grade)) return 'bg-blue-500/20';
        if (['C', 'P'].includes(grade)) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };

    if (allResults.length === 0) {
        return (
            <div className="space-y-6">
                <Card className="border-white/10">
                    <div className="flex flex-col items-center text-center py-12 gap-4">
                        <FileQuestion className="w-12 h-12 text-slate-500" />
                        <p className="text-white font-semibold text-lg">
                            No results recorded yet
                        </p>
                        <p className="text-sm text-slate-400 max-w-md">
                            Fetch your mark sheet live from the Anna University
                            portal (register number + DOB), or enter your semester
                            results manually. Your grades will appear here and feed
                            your CGPA and StudyGPT automatically.
                        </p>
                        <Link to="/au-portal">
                            <Button variant="primary" className="gap-2">
                                <Plus className="w-4 h-4" /> Go to AU Portal to fetch
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Cumulative CGPA"
                    value={cgpa !== null ? String(cgpa) : '—'}
                    icon={<Award className="w-6 h-6" />}
                    trend={
                        trajectory.length >= 2
                            ? {
                                  value: parseFloat(
                                      (
                                          trajectory[trajectory.length - 1].cgpa -
                                          trajectory[0].cgpa
                                      ).toFixed(2)
                                  ),
                                  positive: true,
                                  label: 'over recorded semesters',
                              }
                            : undefined
                    }
                    variant="primary"
                />
                <StatCard
                    title="Total Credits"
                    value={totalCredits}
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="default"
                />
                <StatCard
                    title="Subjects Recorded"
                    value={totalSubjects}
                    icon={<GraduationCap className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Semesters on Record"
                    value={store.semesters.length}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="success"
                />
            </div>

            {/* CGPA Progress Chart */}
            {trajectory.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        CGPA Progress
                    </h3>
                    <div className="h-64 min-h-0">
                        <ResponsiveContainer width="100%" height={224}>
                            <LineChart
                                data={trajectory}
                                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis dataKey="semester" stroke="#94a3b8" />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" />
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
                                    dot={{
                                        fill: '#22d3ee',
                                        strokeWidth: 2,
                                        r: 6,
                                    }}
                                    activeDot={{ r: 8, fill: '#22d3ee' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Latest Semester Results Table */}
            {latestSemester && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Semester {latestSemester.semester} Results
                        {latestSemester.examSession && (
                            <span className="ml-2 text-sm font-normal text-slate-400">
                                ({latestSemester.examSession})
                            </span>
                        )}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-slate-400 font-medium">
                                        Subject
                                    </th>
                                    <th className="text-left p-4 text-slate-400 font-medium">
                                        Code
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        Credits
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        Internal
                                    </th>
                                    <th className="text-center p-4 text-slate-400 font-medium">
                                        Grade
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestSemester.subjects.map((result) => (
                                    <tr
                                        key={result.code}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 text-white font-medium">
                                            {result.name}
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {result.code}
                                        </td>
                                        <td className="p-4 text-center text-slate-300">
                                            {result.credits}
                                        </td>
                                        <td className="p-4 text-center text-slate-300">
                                            {result.internalMarks ?? '—'}/50
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold ${getGradeBg(result.grade)} ${getGradeColor(result.grade)}`}
                                            >
                                                {result.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* All Recorded Semesters */}
            {store.semesters.length > 1 && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        All Recorded Semesters
                    </h3>
                    <div className="space-y-4">
                        {store.semesters.map((sem) => {
                            const computed =
                                store.computeSemesterGPA(sem);
                            const credits = computed?.creditsEarned ?? 0;
                            const sgpa = computed?.gpa ?? '—';
                            return (
                                <div
                                    key={sem.semester}
                                    className="p-4 rounded-xl bg-white/5 flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            Semester {sem.semester}
                                            {sem.examSession && (
                                                <span className="ml-2 text-sm text-slate-400">
                                                    ({sem.examSession})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {sem.subjects.length} subjects ·{' '}
                                            {credits} credits
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            Number(sgpa) >= 8
                                                ? 'success'
                                                : Number(sgpa) >= 6
                                                  ? 'warning'
                                                  : 'error'
                                        }
                                        size="lg"
                                    >
                                        SGPA {sgpa}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Grade Distribution */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">
                    Grade Distribution
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
                    {['O', 'A+', 'A', 'B+', 'B', 'C', 'P'].map((grade) => {
                        const count = allResults.filter(
                            (r) => r.grade === grade
                        ).length;
                        return (
                            <div
                                key={grade}
                                className={`p-4 rounded-xl text-center ${getGradeBg(grade)}`}
                            >
                                <p
                                    className={`text-3xl font-bold ${getGradeColor(grade)}`}
                                >
                                    {count}
                                </p>
                                <p className="text-sm text-slate-400">
                                    Grade {grade}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ResultsPage;

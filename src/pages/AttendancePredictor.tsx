import React, { useMemo, useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from 'recharts';
import { Calculator, AlertTriangle, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';

// =============================================================================
// ATTENDANCE PREDICTOR — how many classes needed to stay eligible
// =============================================================================
// Anna University: minimum 75% attendance required for exam eligibility.

const ELIGIBILITY_THRESHOLD = 75;

interface SubjectData {
    name: string;
    total: number;
    present: number;
}

// Mock subject-wise attendance (mirrors the Attendance page demo data)
const initialSubjects: SubjectData[] = [
    { name: 'Data Structures', total: 60, present: 51 },
    { name: 'Algorithms', total: 58, present: 52 },
    { name: 'Database Systems', total: 62, present: 46 },
    { name: 'Operating Systems', total: 55, present: 48 },
    { name: 'Discrete Mathematics', total: 60, present: 53 },
];

/**
 * Number of consecutive classes to attend (all present) until percentage >= 75%
 * Returns null when already eligible.
 */
const classesToAttend = (total: number, present: number): number | null => {
    const current = (present / total) * 100;
    if (current >= ELIGIBILITY_THRESHOLD) return null;
    let t = total;
    let p = present;
    let classes = 0;
    while ((p / t) * 100 < ELIGIBILITY_THRESHOLD && classes < 200) {
        t += 1;
        p += 1;
        classes += 1;
    }
    return classes;
};

/**
 * Number of classes a student may miss from now and still stay >= 75%.
 */
const canMiss = (total: number, present: number): number | null => {
    if ((present / total) * 100 < ELIGIBILITY_THRESHOLD) return 0;
    let t = total;
    const p = present;
    let missed = 0;
    while ((p / (t + 1)) * 100 >= ELIGIBILITY_THRESHOLD && missed < 200) {
        t += 1;
        missed += 1;
    }
    return missed;
};

const AttendancePredictorPage: React.FC = () => {
    const [subjects] = useState<SubjectData[]>(initialSubjects);
    const [customPresent, setCustomPresent] = useState('');
    const [customTotal, setCustomTotal] = useState('');

    const overall = useMemo(() => {
        const total = subjects.reduce((s, x) => s + x.total, 0);
        const present = subjects.reduce((s, x) => s + x.present, 0);
        return { total, present, percentage: total > 0 ? (present / total) * 100 : 0 };
    }, [subjects]);

    const subjectRows = subjects.map((s) => ({
        ...s,
        percentage: (s.present / s.total) * 100,
        toAttend: classesToAttend(s.total, s.present),
        canMiss: canMiss(s.total, s.present),
    }));

    const critical = subjectRows.filter((r) => r.percentage < ELIGIBILITY_THRESHOLD);
    const atRisk = subjectRows.filter((r) => r.percentage >= ELIGIBILITY_THRESHOLD && r.percentage < 80);

    // Simulator chart
    const simClasses = 15;
    const simPoint = (attended: number) => {
        const p = overall.present + attended;
        const t = overall.total + simClasses;
        return (p / t) * 100;
    };
    const chartData = Array.from({ length: simClasses + 1 }, (_, i) => ({
        classes: `${i}/${simClasses}`,
        percentage: parseFloat(simPoint(i).toFixed(1)),
    }));

    // Custom calculator
    const custom = useMemo(() => {
        const p = parseInt(customPresent, 10);
        const t = parseInt(customTotal, 10);
        if (!customPresent.trim() || !customTotal.trim() || Number.isNaN(p) || Number.isNaN(t) || t <= 0) return null;
        const pct = (p / t) * 100;
        return { p, t, pct, toAttend: classesToAttend(t, p), canMiss: canMiss(t, p) };
    }, [customPresent, customTotal]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-cyan-400" /> Attendance Predictor
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Anna University requires at least 75% attendance for exam eligibility.
                    Track where you stand and see exactly how many classes you need to attend.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Overall Attendance"
                    value={`${overall.percentage.toFixed(1)}%`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant={overall.percentage >= 75 ? 'success' : 'error'}
                />
                <StatCard
                    title="Classes Attended"
                    value={`${overall.present}/${overall.total}`}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Subjects at Risk"
                    value={atRisk.length}
                    subtitle="Between 75% and 80%"
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Subjects Ineligible"
                    value={critical.length}
                    subtitle="Below 75% — act now"
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant="error"
                />
            </div>

            {critical.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">You are ineligible in {critical.length} subject{critical.length > 1 ? 's' : ''}</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                        {critical.map((c) => `${c.name} (${c.toAttend} consecutive classes needed)`).join(' · ')}
                    </p>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject breakdown */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" /> Subject-wise Analysis
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400">
                                    <th className="text-left p-3 font-medium">Subject</th>
                                    <th className="text-center p-3 font-medium">Present</th>
                                    <th className="text-center p-3 font-medium">%</th>
                                    <th className="text-center p-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectRows.map((r) => (
                                    <tr key={r.name} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3 text-white">{r.name}</td>
                                        <td className="p-3 text-center text-slate-300">{r.present}/{r.total}</td>
                                        <td className="p-3 text-center">
                                            <Badge variant={r.percentage >= 75 ? 'success' : 'error'} size="sm">
                                                {r.percentage.toFixed(1)}%
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            {r.toAttend !== null ? (
                                                <span className="text-xs text-red-300">Attend {r.toAttend} more</span>
                                            ) : (
                                                <span className="text-xs text-emerald-300">Can miss {r.canMiss}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Simulator */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" /> Projection Simulator
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        If you attend every class for the next {simClasses} classes, your overall attendance would become:
                    </p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="classes" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={2} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#131b24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12,
                                        color: '#fff',
                                    }}

formatter={((value?: number) => [`${(value ?? 0).toFixed(1)}%`, 'Attendance']) as (value?: number) => [string, string]}
                                />
                                <ReferenceLine y={75} stroke="#facc15" strokeDasharray="4 4" />
                                <Line type="monotone" dataKey="percentage" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Final: {simPoint(simClasses).toFixed(1)}% vs current {overall.percentage.toFixed(1)}%
                    </p>
                </Card>
            </div>

            {/* Custom calculator */}
            <Card className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Calculator</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Enter your own attendance numbers to calculate eligibility for any subject.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Classes Attended"
                        type="number"
                        min={0}
                        placeholder="e.g. 42"
                        value={customPresent}
                        onChange={(e) => setCustomPresent(e.target.value)}
                    />
                    <Input
                        label="Total Classes"
                        type="number"
                        min={1}
                        placeholder="e.g. 60"
                        value={customTotal}
                        onChange={(e) => setCustomTotal(e.target.value)}
                    />
                    <div>
                        <p className="text-sm font-medium text-cyan-100 mb-2">Result</p>
                        {custom ? (
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 h-full">
                                <p className="text-2xl font-bold text-white">
                                    {custom.pct.toFixed(1)}%{' '}
                                    <span className="text-xs font-normal text-slate-400">
                                        ({custom.p}/{custom.t})
                                    </span>
                                </p>
                                <p className="text-sm mt-1">
                                    {custom.toAttend !== null ? (
                                        <span className="text-red-300">
                                            Attend <strong>{custom.toAttend}</strong> consecutive classes to reach 75%
                                        </span>
                                    ) : (
                                        <span className="text-emerald-300">
                                            Eligible ✓ — you can miss up to <strong>{custom.canMiss}</strong> classes
                                        </span>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 rounded-xl bg-white/5 border border-white/10 p-4">
                                Enter values to see the result
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttendancePredictorPage;

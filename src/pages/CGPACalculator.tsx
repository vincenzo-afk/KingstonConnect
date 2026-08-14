import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Cell,
} from 'recharts';
import { Calculator, GraduationCap, Plus, Trash2, RotateCcw } from 'lucide-react';

// =============================================================================
// CGPA CALCULATOR — Anna University grading system
// =============================================================================

// AU grade points (R2017/R2021)
const GRADE_POINTS: Record<string, number> = {
    O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, U: 0, W: 0, SA: 0, RA: 0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

const classFromCGPA = (cgpa: number): string => {
    if (cgpa >= 9) return 'Outstanding (O)';
    if (cgpa >= 8) return 'First Class with Distinction';
    if (cgpa >= 6.5) return 'First Class';
    if (cgpa >= 5) return 'Second Class';
    if (cgpa >= 4) return 'Pass';
    return 'No Degree';
};

interface SubjectRow {
    id: number;
    code: string;
    name: string;
    credits: string;
    grade: string;
}

let rowId = 1;

const newRow = (code = '', name = '', credits = '3', grade = 'B+'): SubjectRow => ({
    id: rowId++,
    code,
    name,
    credits,
    grade,
});

const CGPACalculatorPage: React.FC = () => {
    const [semesters, setSemesters] = useState<SubjectRow[][]>([
        [newRow('CS8391', 'Data Structures', '4', 'A'), newRow('CS8392', 'Object Oriented Programming', '4', 'B+'), newRow('MA8391', 'Probability & Statistics', '4', 'A+'), newRow('EC8391', 'Electronics', '3', 'B'), newRow('GE8291', 'Professional English', '3', 'A')],
    ]);

    const sgpaList = semesters.map((rows) => {
        const items = rows
            .map((r) => {
                const credits = parseInt(r.credits, 10) || 0;
                const points = GRADE_POINTS[r.grade] ?? 0;
                return { credits, points };
            })
            .filter((x) => x.credits > 0);
        const totalCredits = items.reduce((s, x) => s + x.credits, 0);
        const totalPoints = items.reduce((s, x) => s + x.points * x.credits, 0);
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    });

    const totalCreditsAll = semesters.reduce(
        (s, rows) => s + rows.reduce((t, r) => t + (parseInt(r.credits, 10) || 0), 0),
        0
    );
    const cgpa = useMemo(() => {
        if (totalCreditsAll === 0) return null;
        let total = 0;
        let credits = 0;
        void totalCreditsAll;
        semesters.forEach((rows) => {
            rows.forEach((r) => {
                const c = parseInt(r.credits, 10) || 0;
                if (c === 0) return;
                total += (GRADE_POINTS[r.grade] ?? 0) * c;
                credits += c;
            });
        });
        return credits > 0 ? total / credits : null;
    }, [semesters, totalCreditsAll]);

    const chartData = semesters.map((_rows, i) => ({
        name: `Sem ${i + 1}`,
        GPA: parseFloat(sgpaList[i].toFixed(2)),
    }));

    const setRows = (sem: number, rows: SubjectRow[]) =>
        setSemesters((prev) => prev.map((s, i) => (i === sem ? rows : s)));

    const addSemester = () => setSemesters((prev) => [...prev, [newRow()]]);
    const removeSemester = (sem: number) =>
        setSemesters((prev) => prev.filter((_, i) => i !== sem));

    const addRow = (sem: number) => {
        if (semesters[sem].length >= 12) return;
        setRows(sem, [...semesters[sem], newRow()]);
    };

    const removeRow = (sem: number, id: number) =>
        setRows(sem, semesters[sem].filter((r) => r.id !== id));

    const updateRow = (sem: number, id: number, patch: Partial<SubjectRow>) =>
        setRows(sem, semesters[sem].map((r) => (r.id === id ? { ...r, ...patch } : r)));

    const resetAll = () => setSemesters([[newRow()]]);

    const gradePointOptions = GRADE_OPTIONS.map((g) => ({ value: g, label: `${g} (${GRADE_POINTS[g]} pts)` }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-cyan-400" /> CGPA Calculator
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Anna University grading — O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, U/W/SA/RA=0
                    </p>
                </div>
                <Button variant="outline" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={resetAll}>
                    Reset All
                </Button>
            </div>

            {/* CGPA summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Cumulative CGPA</p>
                    <p className="text-3xl font-bold text-white mt-1">{cgpa !== null ? cgpa.toFixed(2) : '—'}</p>
                    {cgpa !== null && (
                        <p className="text-xs text-cyan-300 mt-1">{classFromCGPA(cgpa)}</p>
                    )}
                </Card>
                <Card>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Credits</p>
                    <p className="text-3xl font-bold text-white mt-1">{totalCreditsAll}</p>
                </Card>
                <Card>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Semesters</p>
                    <p className="text-3xl font-bold text-white mt-1">{semesters.length}</p>
                </Card>
                <Card>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Degree Progress</p>
                    <p className="text-3xl font-bold text-white mt-1">{Math.min(100, Math.round((totalCreditsAll / 160) * 100))}%</p>
                    <p className="text-[11px] text-slate-500 mt-1">of 160 credit UG program</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Semester tables */}
                <div className="lg:col-span-2 space-y-4">
                    {semesters.map((rows, sem) => (
                        <Card key={sem}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">Semester {sem + 1}</h3>
                                <div className="flex items-center gap-3">
                                    <Badge variant="success">
                                        SGPA {sgpaList[sem].toFixed(2)}
                                    </Badge>
                                    {semesters.length > 1 && (
                                        <button
                                            onClick={() => removeSemester(sem)}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                            aria-label="Remove semester"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {rows.map((r) => (
                                    <div key={r.id} className="flex flex-wrap items-center gap-2">
                                        <Input
                                            placeholder="Code"
                                            value={r.code}
                                            onChange={(e) => updateRow(sem, r.id, { code: e.target.value })}
                                            className="py-2 text-sm sm:w-28 w-full"
                                        />
                                        <Input
                                            placeholder="Subject name"
                                            value={r.name}
                                            onChange={(e) => updateRow(sem, r.id, { name: e.target.value })}
                                            className="py-2 text-sm flex-1 min-w-[120px]"
                                        />
                                        <Input
                                            placeholder="Credits"
                                            type="number"
                                            min={1}
                                            max={6}
                                            value={r.credits}
                                            onChange={(e) => updateRow(sem, r.id, { credits: e.target.value })}
                                            className="py-2 text-sm w-20"
                                        />
                                        <Select
                                            options={gradePointOptions}
                                            value={r.grade}
                                            onChange={(e) => updateRow(sem, r.id, { grade: e.target.value })}
                                            className="py-1 text-sm w-28"
                                        />
                                        <button
                                            onClick={() => removeRow(sem, r.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                            aria-label="Remove subject"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => addRow(sem)}
                                disabled={rows.length >= 12}
                            >
                                Add Subject
                            </Button>
                        </Card>
                    ))}

                    <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={addSemester}>
                        Add Semester
                    </Button>
                </div>

                {/* Chart */}
                <Card className="h-full">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-cyan-400" /> Semester Trend
                    </h3>
                    <div className="h-64 min-h-0">
                        <ResponsiveContainer width="100%" height={224}>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#131b24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12,
                                        color: '#fff',
                                    }}

formatter={((value?: number) => [(value ?? 0).toFixed(2), 'GPA']) as (value?: number) => [string, string]}
                                />
                                <ReferenceLine y={6.5} stroke="#facc15" strokeDasharray="4 4" />
                                <Bar dataKey="GPA" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                    {chartData.map((d, i) => (
                                        <Cell key={i} fill={d.GPA >= 8.5 ? '#22d3ee' : d.GPA >= 6.5 ? '#38bdf8' : '#94a3b8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-400">
                        <p>• Yellow dashed line = 6.5 (First Class threshold)</p>
                        <p>• Cyan = 8.5+ (Distinction zone) · Blue = First Class · Grey = Below</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CGPACalculatorPage;

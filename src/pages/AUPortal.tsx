import React, { useState } from 'react';
import { useAUResultsStore, ALL_AU_GRADES, type AUSubject } from '@/stores/auResultsStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    Calendar,
    Award,
    BookOpen,
    ExternalLink,
    ShieldCheck,
    AlertTriangle,
    Plus,
    Trash2,
    TrendingDown,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Lock,
    User,
} from 'lucide-react';

// =============================================================================
// AU PORTAL PAGE — official portal deep-link + manual results recording
// =============================================================================

const AU_PORTAL_URL = 'https://coe.annauniv.edu/home/';

interface DraftSubject {
    code: string;
    name: string;
    credits: string;
    grade: string;
    internalMarks: string;
}

const emptyDraft = (): DraftSubject => ({
    code: '',
    name: '',
    credits: '',
    grade: 'B+',
    internalMarks: '',
});

const EXAM_SESSIONS = [
    'Apr/May 2026',
    'Nov/Dec 2025',
    'Apr/May 2025',
    'Nov/Dec 2024',
    'Apr/May 2024',
    'Nov/Dec 2023',
];

const gradeColor = (grade: string): 'success' | 'warning' | 'error' => {
    if (['O', 'A+', 'A', 'B+'].includes(grade)) return 'success';
    if (['B', 'C', 'P'].includes(grade)) return 'warning';
    return 'error';
};

const AUPortalPage: React.FC = () => {
    const store = useAUResultsStore();
    const { user } = useAuthStore();
    const [selectedSemester, setSelectedSemester] = useState(
        (user?.semester ?? 5) - 1 || 1
    );
    const [drafts, setDrafts] = useState<DraftSubject[]>([emptyDraft()]);
    const [session, setSession] = useState(EXAM_SESSIONS[0]);
    const [regNo, setRegNo] = useState(store.registerNo || user?.rollNumber || '');
    const [dob, setDob] = useState(store.dateOfBirth || '');
    const [identitySaved, setIdentitySaved] = useState(false);

    const cgpa = store.getCGPA();
    const weakSubjects = store.getWeakSubjects();
    const totalCredits = store.getTotalCredits();
    const totalSubjects = store.semesters.reduce((sum, s) => sum + s.subjects.length, 0);

    // ---------- Identity (register number + DOB) ----------
    const saveIdentity = () => {
        if (!regNo.trim() || !dob.trim()) return;
        store.setStudentIdentity(regNo.trim(), dob.trim());
        setIdentitySaved(true);
        setTimeout(() => setIdentitySaved(false), 3000);
    };

    // ---------- Draft handling ----------
    const updateDraft = (index: number, patch: Partial<DraftSubject>) => {
        setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    };

    const addDraftRow = () => {
        if (drafts.length >= 10) return;
        setDrafts((prev) => [...prev, emptyDraft()]);
    };

    const removeDraftRow = (index: number) => {
        setDrafts((prev) => prev.filter((_, i) => i !== index));
    };

    const saveSemesterResults = () => {
        const subjects: AUSubject[] = drafts
            .filter((d) => d.code.trim() && d.name.trim() && d.credits.trim() && d.grade)
            .map((d) => ({
                code: d.code.trim(),
                name: d.name.trim(),
                credits: Math.max(1, Math.min(6, parseInt(d.credits, 10) || 3)),
                grade: d.grade as AUSubject['grade'],
                internalMarks: d.internalMarks.trim()
                    ? Math.max(0, Math.min(50, parseInt(d.internalMarks, 10) || 0))
                    : undefined,
            }));
        if (subjects.length === 0) return;

        const existing = store.semesters.find((s) => s.semester === selectedSemester);
        if (existing) {
            store.updateSemester(selectedSemester, {
                examSession: session,
                subjects: [...existing.subjects, ...subjects],
            });
        } else {
            store.addSemester({ semester: selectedSemester, examSession: session, subjects });
        }
        setDrafts([emptyDraft()]);
    };

    const removeSubject = (semester: number, code: string) => {
        store.removeSubject(semester, code);
    };

    const semesterGPA = (semester: number) => {
        const s = store.semesters.find((m) => m.semester === semester);
        if (!s) return null;
        return store.computeSemesterGPA(s);
    };

    return (
        <div className="space-y-6">
            {/* Official portal card */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-7 h-7 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                Anna University Portal
                                <Badge variant="success" className="gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </Badge>
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Official Centre for Examinations — coe.annauniv.edu
                            </p>
                        </div>
                    </div>
                    <a
                        href={AU_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="primary" glow className="gap-2 whitespace-nowrap">
                            <ExternalLink className="w-4 h-4" /> Open Official Portal
                        </Button>
                    </a>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-yellow-400" />
                    <span>
                        The official portal uses a captcha, so results cannot be auto-fetched from this app.
                        Log in at the official portal when results are published, then record them here so
                        StudyGPT can track your CGPA, weak subjects and attendance eligibility automatically.
                    </span>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Cumulative CGPA"
                    value={cgpa !== null ? cgpa : '—'}
                    subtitle={cgpa !== null ? 'Recorded semesters' : 'Add your results below'}
                    icon={<Award className="w-6 h-6" />}
                    variant="primary"
                />
                <StatCard
                    title="Credits Earned"
                    value={totalCredits}
                    icon={<BookOpen className="w-6 h-6" />}
                    variant="success"
                />
                <StatCard
                    title="Subjects Recorded"
                    value={totalSubjects}
                    icon={<ClipboardList className="w-6 h-6" />}
                    variant="warning"
                />
                <StatCard
                    title="Weak Subjects"
                    value={weakSubjects.length}
                    subtitle={weakSubjects.length > 0 ? 'Need revision priority' : 'All clear'}
                    icon={<TrendingDown className="w-6 h-6" />}
                    variant="default"
                />
            </div>

            {/* Weak subjects alert */}
            {weakSubjects.length > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Subjects needing revision</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {weakSubjects.map((w, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-yellow-500/20"
                            >
                                <span className="text-sm font-medium text-white">{w.subject.name}</span>
                                <span className="text-xs text-slate-400">Sem {w.semester}</span>
                                <Badge variant={gradeColor(w.subject.grade)} size="sm">
                                    {w.subject.grade}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                        StudyGPT will prioritize these subjects when you ask for study plans. Ask it
                        "Create a study plan for my weak subjects" to get a personalized schedule.
                    </p>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student identity */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-400" /> Student Identity
                    </h3>
                    <div className="space-y-4">
                        <Input
                            label="Register Number"
                            placeholder="e.g. 21BCE1234"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                        />
                        <Input
                            label="Date of Birth"
                            placeholder="DD-MM-YYYY (e.g. 15-08-2003)"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                                Used as your ID on this app only — nothing is sent to the official portal.
                            </p>
                            <Button
                                variant="primary"
                                onClick={saveIdentity}
                                disabled={!regNo.trim() || !dob.trim()}
                            >
                                {identitySaved ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Saved
                                    </>
                                ) : (
                                    'Save Identity'
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Manual results entry */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-cyan-400" /> Record Semester Results
                    </h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                label="Semester"
                                options={Array.from({ length: 8 }, (_, i) => ({
                                    value: String(i + 1),
                                    label: `Semester ${i + 1}`,
                                }))}
                                value={String(selectedSemester)}
                                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                            />
                            <Select
                                label="Exam Session"
                                options={EXAM_SESSIONS.map((s) => ({ value: s, label: s }))}
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                            />
                        </div>

                        {drafts.map((draft, index) => (
                            <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">
                                        Subject {index + 1}
                                    </span>
                                    {drafts.length > 1 && (
                                        <button
                                            onClick={() => removeDraftRow(index)}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                            aria-label="Remove subject row"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <Input
                                        placeholder="Code (CS8391)"
                                        value={draft.code}
                                        onChange={(e) => updateDraft(index, { code: e.target.value })}
                                        className="py-2 text-sm"
                                    />
                                    <Input
                                        placeholder="Subject name"
                                        value={draft.name}
                                        onChange={(e) => updateDraft(index, { name: e.target.value })}
                                        className="py-2 text-sm col-span-2 md:col-span-1"
                                    />
                                    <Input
                                        placeholder="Credits"
                                        type="number"
                                        min={1}
                                        max={6}
                                        value={draft.credits}
                                        onChange={(e) => updateDraft(index, { credits: e.target.value })}
                                        className="py-2 text-sm"
                                    />
                                    <Select
                                        label=""
                                        options={ALL_AU_GRADES.map((g) => ({ value: g, label: g }))}
                                        value={draft.grade}
                                        onChange={(e) => updateDraft(index, { grade: e.target.value })}
                                        className="py-1 text-sm"
                                    />
                                </div>
                                <Input
                                    placeholder="Internal marks out of 50 (optional)"
                                    type="number"
                                    min={0}
                                    max={50}
                                    value={draft.internalMarks}
                                    onChange={(e) => updateDraft(index, { internalMarks: e.target.value })}
                                    className="py-2 text-sm"
                                />
                            </div>
                        ))}

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addDraftRow} disabled={drafts.length >= 10}>
                                Add Subject
                            </Button>
                            <Button variant="primary" glow onClick={saveSemesterResults} disabled={drafts.every((d) => !d.code.trim() || !d.name.trim())}>
                                Save Semester Results
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Results history */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" /> Results History
                    <Badge variant="default" className="ml-1">{store.semesters.length} semesters</Badge>
                </h3>
                {store.semesters.length === 0 ? (
                    <div className="text-center py-10">
                        <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No results recorded yet.</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Add your semester results above, or view them on the official portal.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {store.semesters
                            .slice()
                            .reverse()
                            .map((sem) => {
                                const gpa = semesterGPA(sem.semester);
                                return (
                                    <div key={sem.semester} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-white/5">
                                            <div>
                                                <p className="font-medium text-white">
                                                    Semester {sem.semester}
                                                </p>
                                                <p className="text-xs text-slate-400">{sem.examSession}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-cyan-400">
                                                        {gpa?.gpa ?? '—'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">GPA</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                                    onClick={() => store.removeSemester(sem.semester)}
                                                    className="text-slate-500 hover:text-red-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-slate-400">
                                                        <th className="text-left p-3 font-medium">Code</th>
                                                        <th className="text-left p-3 font-medium">Subject</th>
                                                        <th className="text-center p-3 font-medium">Credits</th>
                                                        <th className="text-center p-3 font-medium">Grade</th>
                                                        <th className="text-center p-3 font-medium">Internals</th>
                                                        <th className="p-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sem.subjects.map((sub) => (
                                                        <tr key={sub.code} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                                            <td className="p-3 text-cyan-300 font-mono text-xs">{sub.code}</td>
                                                            <td className="p-3 text-white">{sub.name}</td>
                                                            <td className="p-3 text-center text-slate-300">{sub.credits}</td>
                                                            <td className="p-3 text-center">
                                                                <Badge variant={gradeColor(sub.grade)} size="sm">
                                                                    {sub.grade}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3 text-center text-slate-300">
                                                                {typeof sub.internalMarks === 'number'
                                                                    ? `${sub.internalMarks}/50`
                                                                    : '—'}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <button
                                                                    onClick={() => removeSubject(sem.semester, sub.code)}
                                                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                                                    aria-label={`Remove ${sub.name}`}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </Card>

            {/* Info strip */}
            <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-white">Quick facts — Anna University grading</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            O=10 · A+=9 · A=8 · B+=7 · B=6 · C=5 · P=4 · U/W/SA/RA=0 · Pass ≥ 40% per subject · Exam eligibility ≥ 75% attendance
                        </p>
                    </div>
                    <a href={AU_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-2 text-cyan-400 hover:text-cyan-300">
                            <ExternalLink className="w-4 h-4" /> coe.annauniv.edu
                        </Button>
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default AUPortalPage;

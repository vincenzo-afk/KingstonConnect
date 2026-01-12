import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    BookOpen,
    Calendar,
    Clock,
    TrendingUp,
    Award,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    GraduationCap,
    Activity,
    Bell
} from 'lucide-react';
import { getCachedStudentData, AUStudentData, calculateCGPA } from '@/services/auportal.service';
import { calculateAttendanceMetrics } from '@/utils/attendanceUtils';
import { cn } from '@/lib/utils';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [auData, setAuData] = useState<AUStudentData | null>(null);
    const [_loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.register_no) {
            fetchStudentData();
        }
    }, [user]);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            if (user?.id) {
                const cached = await getCachedStudentData(user.id);
                if (cached) {
                    setAuData(cached.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch AU data", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Stats
    const attendanceMetrics = calculateAttendanceMetrics(auData);
    const attendancePercentage = attendanceMetrics?.overallPercentage || 0;

    // Calculate CGPA and SGPA
    const cgpaData = auData?.exam_result?.results ? calculateCGPA(auData.exam_result.results) : null;
    const cgpa = cgpaData?.cgpa || 'N/A';
    const semesterGPAs = cgpaData?.sgpa.map((gpa, index) => ({
        semester: index + 1,
        gpa
    })).reverse() || [];

    const pendingAssignments = 3; // Mock data

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-white/5 p-8 md:p-10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-30" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-400 max-w-xl text-lg">
                            You have <span className="text-cyan-400 font-semibold">{pendingAssignments} pending assignments</span> and an upcoming exam in <span className="text-cyan-400 font-semibold">2 days</span>.
                        </p>
                    </div>
                    <Button
                        glow
                        className="px-6 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20"
                        icon={<Sparkles className="w-5 h-5" />}
                        onClick={() => navigate('/studygpt')}
                    >
                        Ask StudyGPT
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" className="p-6 flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform border border-cyan-500/20">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-lg border",
                            attendancePercentage >= 75
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            {attendancePercentage >= 75 ? 'Good' : 'Low'}
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Attendance</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{attendancePercentage}%</h3>
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform border border-purple-500/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Overall
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">CGPA</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{cgpa}</h3>
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform border border-orange-500/20">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Due Soon
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Assignments</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{pendingAssignments}</h3>
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform border border-blue-500/20">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Active
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Study Streak</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">5 Days</h3>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Schedule & Assignments */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Today's Schedule */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-cyan-400" />
                                Today's Schedule
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/timetable')}>
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { time: '09:00 AM', subject: 'Database Management Systems', type: 'Lecture', room: 'CS-201' },
                                { time: '10:30 AM', subject: 'Operating Systems', type: 'Lab', room: 'Lab-3' },
                                { time: '02:00 PM', subject: 'Computer Networks', type: 'Lecture', room: 'CS-201' },
                            ].map((cls, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="w-20 text-center flex-shrink-0">
                                        <p className="text-sm font-bold text-white">{cls.time.split(' ')[0]}</p>
                                        <p className="text-xs text-slate-500">{cls.time.split(' ')[1]}</p>
                                    </div>
                                    <div className="w-1 h-10 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">{cls.subject}</h4>
                                        <p className="text-xs text-slate-400">{cls.type} • {cls.room}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-4 h-4" />} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Results */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-400" />
                                Recent Results
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/results')}>
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="p-6">
                            {semesterGPAs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {semesterGPAs.slice(0, 4).map((sem, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex justify-between items-center hover:bg-purple-500/10 transition-colors">
                                            <div>
                                                <p className="text-sm text-slate-400">Semester {sem.semester}</p>
                                                <p className="text-lg font-bold text-white">{sem.gpa} GPA</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                                {sem.semester}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    No results available yet.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Announcements & Quick Actions */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card variant="glass" className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate('/studygpt')} className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-center group">
                                <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-cyan-100">StudyGPT</span>
                            </button>
                            <button onClick={() => navigate('/notes')} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-center group">
                                <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-blue-100">Notes</span>
                            </button>
                            <button onClick={() => navigate('/calendar')} className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-center group">
                                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-purple-100">Calendar</span>
                            </button>
                            <button onClick={() => navigate('/results')} className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all text-center group">
                                <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-orange-100">Results</span>
                            </button>
                        </div>
                    </Card>

                    {/* Announcements */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-yellow-400" />
                                Announcements
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>
                                View All
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { title: 'Exam Schedule Released', date: '2h ago', type: 'important' },
                                { title: 'Holiday on Friday', date: '1d ago', type: 'general' },
                                { title: 'New Library Books', date: '2d ago', type: 'general' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0 group cursor-pointer hover:bg-white/5 -mx-6 px-6 py-3 transition-colors">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                        item.type === 'important' ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-cyan-500"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

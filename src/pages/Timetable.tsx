import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, MapPin, User } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTimetable = [
    {
        id: '1', day: 'Monday', slots: [
            { time: '09:00 - 10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'A101', code: 'CSE101' },
            { time: '10:00 - 11:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'A102', code: 'CSE102' },
            { time: '11:15 - 12:15', subject: 'Database Systems', teacher: 'Dr. Williams', room: 'A103', code: 'CSE103' },
        ]
    },
    {
        id: '2', day: 'Tuesday', slots: [
            { time: '09:00 - 10:00', subject: 'Operating Systems', teacher: 'Dr. Brown', room: 'B101', code: 'CSE104' },
            { time: '10:00 - 11:00', subject: 'Discrete Mathematics', teacher: 'Prof. Davis', room: 'B102', code: 'MAT201' },
            { time: '14:00 - 16:00', subject: 'DS Lab', teacher: 'Dr. Smith', room: 'Lab 1', code: 'CSE101L' },
        ]
    },
    {
        id: '3', day: 'Wednesday', slots: [
            { time: '09:00 - 10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'A101', code: 'CSE101' },
            { time: '11:00 - 12:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'A102', code: 'CSE102' },
            { time: '14:00 - 16:00', subject: 'DBMS Lab', teacher: 'Dr. Williams', room: 'Lab 2', code: 'CSE103L' },
        ]
    },
    {
        id: '4', day: 'Thursday', slots: [
            { time: '09:00 - 10:00', subject: 'Operating Systems', teacher: 'Dr. Brown', room: 'B101', code: 'CSE104' },
            { time: '10:00 - 11:00', subject: 'Discrete Mathematics', teacher: 'Prof. Davis', room: 'B102', code: 'MAT201' },
            { time: '11:15 - 12:15', subject: 'Database Systems', teacher: 'Dr. Williams', room: 'A103', code: 'CSE103' },
        ]
    },
    {
        id: '5', day: 'Friday', slots: [
            { time: '09:00 - 10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'A101', code: 'CSE101' },
            { time: '10:00 - 11:00', subject: 'Algorithms', teacher: 'Prof. Johnson', room: 'A102', code: 'CSE102' },
            { time: '14:00 - 16:00', subject: 'OS Lab', teacher: 'Dr. Brown', room: 'Lab 3', code: 'CSE104L' },
        ]
    },
];

const dayColors: Record<string, { bg: string; border: string; text: string }> = {
    'Monday': { bg: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    'Tuesday': { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    'Wednesday': { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    'Thursday': { bg: 'from-orange-500/10 to-yellow-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
    'Friday': { bg: 'from-red-500/10 to-pink-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

// =============================================================================
// TIMETABLE PAGE
// =============================================================================

const TimetablePage: React.FC = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = mockTimetable.find(d => d.day === today);

    return (
        <div className="space-y-6">
            {/* Today's Schedule */}
            {todaySchedule && (
                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                            <Clock className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
                            <p className="text-sm text-slate-400">{today}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {todaySchedule.slots.map((slot, index) => (
                            <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-cyan-400 font-medium mb-1">{slot.time}</p>
                                <p className="text-white font-semibold">{slot.subject}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>{slot.room}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Weekly Timetable */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Timetable</h3>
                <div className="space-y-4">
                    {mockTimetable.map(daySchedule => {
                        const colors = dayColors[daySchedule.day];
                        const isToday = daySchedule.day === today;

                        return (
                            <div
                                key={daySchedule.id}
                                className={`rounded-xl border ${colors.border} ${isToday ? 'ring-2 ring-cyan-500/50' : ''}`}
                            >
                                {/* Day Header */}
                                <div className={`p-4 bg-gradient-to-r ${colors.bg} rounded-t-xl border-b ${colors.border}`}>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-semibold ${colors.text}`}>{daySchedule.day}</h4>
                                        {isToday && (
                                            <Badge variant="primary" size="sm">Today</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Slots */}
                                <div className="p-4 space-y-3">
                                    {daySchedule.slots.map((slot, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-28">
                                                <p className="text-sm font-medium text-white">{slot.time}</p>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{slot.subject}</p>
                                                <p className="text-sm text-slate-400">{slot.code}</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {slot.teacher}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {slot.room}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default TimetablePage;

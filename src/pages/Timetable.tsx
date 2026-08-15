import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Clock, MapPin, User, Plus, Trash2 } from 'lucide-react';

// =============================================================================
// TIMETABLE STORE — staff build the weekly schedule (no mock data)
// =============================================================================

export interface TimetableSlot {
    id: string;
    day: string;
    time: string;
    subject: string;
    teacher: string;
    room: string;
    code: string;
}

export interface DaySchedule {
    day: string;
    slots: TimetableSlot[];
}

interface TimetableStoreState {
    days: DaySchedule[];
    addSlot: (day: string, slot: Omit<TimetableSlot, 'id' | 'day'>) => void;
    removeSlot: (day: string, slotId: string) => void;
}


// Firestore-backed timetable: slots are stored flat with a day field and
// grouped locally by day. Realtime across all members; offline localStorage
// fallback when Firebase is unreachable.
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const groupByDay = (slots: TimetableSlot[]): DaySchedule[] => {
    const byDay = new Map<string, TimetableSlot[]>();
    for (const s of slots) {
        if (!byDay.has(s.day)) byDay.set(s.day, []);
        byDay.get(s.day)!.push(s);
    }
    const days: DaySchedule[] = [];
    for (const day of DAY_ORDER) {
        const slots = byDay.get(day);
        if (slots && slots.length > 0) days.push({ day, slots });
    }
    return days;
};

const useTimetable = (): TimetableStoreState => {
    const [slots, , { add, remove }] = useFirestoreCollection<TimetableSlot>('timetable-slots');

    const days = groupByDay(slots);

    const doAddSlot = (day: string, slot: Omit<TimetableSlot, 'id' | 'day'>) => {
        const id = `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        void add({ ...slot, id, day } as TimetableSlot);
    };
    const doRemoveSlot = (day: string, slotId: string) => {
        void day;
        void remove(slotId);
    };
    return { days, addSlot: doAddSlot, removeSlot: doRemoveSlot };
};

const dayColors: Record<string, { bg: string; border: string; text: string }> = {
    Monday: { bg: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    Tuesday: { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    Wednesday: { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    Thursday: { bg: 'from-orange-500/10 to-yellow-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
    Friday: { bg: 'from-red-500/10 to-pink-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

// =============================================================================
// TIMETABLE PAGE
// =============================================================================

const TimetablePage: React.FC = () => {
    const { user } = useAuthStore();
    const { days, addSlot, removeSlot } = useTimetable();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = days.find((d) => d.day === today);
    const [openDay, setOpenDay] = useState<string | null>(null);
    const [time, setTime] = useState('');
    const [subject, setSubject] = useState('');
    const [teacher, setTeacher] = useState('');
    const [room, setRoom] = useState('');
    const [code, setCode] = useState('');

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const handleAddSlot = (day: string) => {
        if (!time || !subject.trim() || !teacher.trim() || !room.trim()) return;
        addSlot(day, { time, subject: subject.trim(), teacher: teacher.trim(), room: room.trim(), code: code.trim() } as Omit<TimetableSlot, 'id' | 'day'>);
        setTime('');
        setSubject('');
        setTeacher('');
        setRoom('');
        setCode('');
        setOpenDay(null);
    };

    const daysToShow = days.length > 0 ? days : [];

    return (
        <div className="space-y-6">
            {/* Today's Schedule */}
            {todaySchedule && todaySchedule.slots.length > 0 && (
                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                            <Clock className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Today's Schedule
                            </h3>
                            <p className="text-sm text-slate-400">{today}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {todaySchedule.slots.map((slot) => (
                            <div key={slot.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
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
                <h3 className="text-lg font-semibold text-white mb-4">
                    Weekly Timetable
                </h3>
                {daysToShow.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-white font-medium">
                            No timetable set yet
                        </p>
                        <p className="text-sm mt-1">
                            {isStaff
                                ? 'Open any day below to publish the first class slots.'
                                : 'Teachers and staff can publish the weekly schedule.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {daysToShow.map((daySchedule) => {
                            const colors =
                                dayColors[daySchedule.day] ||
                                dayColors.Monday;
                            const isToday = daySchedule.day === today;

                            return (
                                <div
                                    key={daySchedule.day}
                                    className={`rounded-xl border ${colors.border} ${
                                        isToday ? 'ring-2 ring-cyan-500/50' : ''
                                    }`}
                                >
                                    {/* Day Header */}
                                    <div
                                        className={`p-4 bg-gradient-to-r ${colors.bg} rounded-t-xl border-b ${colors.border}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className={`font-semibold ${colors.text}`}>
                                                {daySchedule.day}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {isToday && (
                                                    <Badge variant="primary" size="sm">
                                                        Today
                                                    </Badge>
                                                )}
                                                {isStaff && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-sm"
                                                        onClick={() =>
                                                            setOpenDay(
                                                                openDay === daySchedule.day
                                                                    ? null
                                                                    : daySchedule.day
                                                            )
                                                        }
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Add slot
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add slot form (staff) */}
                                    {isStaff && openDay === daySchedule.day && (
                                        <div className="p-4 border-b border-white/10 bg-white/[0.03]">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400 mb-1">Time</p>
                                                    <div className="flex gap-1">
                                                        <input
                                                            type="time"
                                                            value={time}
                                                            onChange={(e) => setTime(e.target.value)}
                                                            className="flex-1 px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400 mb-1">Subject</p>
                                                    <input
                                                        type="text"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                        placeholder="e.g. Data Structures"
                                                        className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400 mb-1">Teacher</p>
                                                    <input
                                                        type="text"
                                                        value={teacher}
                                                        onChange={(e) => setTeacher(e.target.value)}
                                                        placeholder="e.g. Dr. Smith"
                                                        className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-400 mb-1">Room</p>
                                                    <input
                                                        type="text"
                                                        value={room}
                                                        onChange={(e) => setRoom(e.target.value)}
                                                        placeholder="e.g. A101"
                                                        className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleAddSlot(daySchedule.day)}
                                                        disabled={
                                                            !time ||
                                                            !subject.trim() ||
                                                            !teacher.trim() ||
                                                            !room.trim()
                                                        }
                                                        className="w-full"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2 max-w-[30%]">
                                                <input
                                                    type="text"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value)}
                                                    placeholder="Subject code (optional)"
                                                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Slots */}
                                    <div className="p-4 space-y-3">
                                        {daySchedule.slots.map((slot) => (
                                            <div
                                                key={slot.id}
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
                                                    {isStaff && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSlot(
                                                                    daySchedule.day,
                                                                    slot.id
                                                                )
                                                            }
                                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                                            aria-label={`Delete ${slot.subject}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TimetablePage;

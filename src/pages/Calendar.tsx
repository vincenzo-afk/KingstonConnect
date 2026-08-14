import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Calendar,
    Clock,
    FileText,
    GraduationCap,
    Gift,
    AlertTriangle,
    Plus,
    Trash2,
} from 'lucide-react';

// =============================================================================
// CALENDAR STORE — staff add events locally (no mock data)
// =============================================================================

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'exam' | 'holiday' | 'deadline' | 'event';
    description: string;
    allDay: boolean;
}

interface CalendarStoreState {
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    removeEvent: (id: string) => void;
}

const createCalendarStore = () => {
    const KEY = 'kingston-calendar-events';
    const listeners = new Set<() => void>();

    const read = (): CalendarEvent[] => {
        try {
            return JSON.parse(
                localStorage.getItem(KEY) || '[]'
            ) as CalendarEvent[];
        } catch {
            return [];
        }
    };

    let state: CalendarEvent[] = read();

    const write = (next: CalendarEvent[]) => {
        state = next;
        localStorage.setItem(KEY, JSON.stringify(next));
        listeners.forEach((l) => l());
    };

    return {
        useEvents: (): CalendarStoreState => {
            const [, forceUpdate] = useState(0);
            React.useEffect(() => {
                const listener = () => forceUpdate((t) => t + 1);
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            }, []);
            return {
                events: state,
                addEvent: (event: Omit<CalendarEvent, 'id'>) =>
                    write([
                        { ...event, id: `cal-${Date.now()}` },
                        ...state,
                    ]),
                removeEvent: (id: string) =>
                    write(state.filter((e) => e.id !== id)),
            };
        },
    };
};

const calendarStore = createCalendarStore();

// =============================================================================
// CALENDAR PAGE
// =============================================================================

const CalendarPage: React.FC = () => {
    const { user } = useAuthStore();
    const { events, addEvent, removeEvent } = calendarStore.useEvents();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState<CalendarEvent['type']>('event');
    const [description, setDescription] = useState('');
    const [allDay, setAllDay] = useState(true);

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'exam':
                return <FileText className="w-4 h-4" />;
            case 'holiday':
                return <Gift className="w-4 h-4" />;
            case 'deadline':
                return <AlertTriangle className="w-4 h-4" />;
            case 'event':
                return <GraduationCap className="w-4 h-4" />;
            default:
                return <Calendar className="w-4 h-4" />;
        }
    };

    const getTypeBadgeVariant = (t: string) => {
        switch (t) {
            case 'exam':
                return 'error' as const;
            case 'holiday':
                return 'success' as const;
            case 'deadline':
                return 'warning' as const;
            case 'event':
                return 'primary' as const;
            default:
                return 'secondary' as const;
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'exam':
                return {
                    bg: 'bg-red-500/20',
                    text: 'text-red-400',
                    border: 'border-red-500/30',
                };
            case 'holiday':
                return {
                    bg: 'bg-green-500/20',
                    text: 'text-green-400',
                    border: 'border-green-500/30',
                };
            case 'deadline':
                return {
                    bg: 'bg-orange-500/20',
                    text: 'text-orange-400',
                    border: 'border-orange-500/30',
                };
            case 'event':
                return {
                    bg: 'bg-cyan-500/20',
                    text: 'text-cyan-400',
                    border: 'border-cyan-500/30',
                };
            default:
                return {
                    bg: 'bg-slate-500/20',
                    text: 'text-slate-400',
                    border: 'border-slate-500/30',
                };
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDaysUntil = (dateStr: string) => {
        const eventDate = new Date(dateStr);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        return `In ${diffDays} days`;
    };

    const sortedEvents = [...events].sort(
        (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const upcomingEvents = sortedEvents.filter(
        (e) => new Date(e.date) >= new Date(new Date().toDateString())
    );
    const pastEvents = sortedEvents.filter(
        (e) => new Date(e.date) < new Date(new Date().toDateString())
    );

    const handleAdd = () => {
        if (!title.trim() || !date) return;
        addEvent({
            title: title.trim(),
            date,
            type,
            description: description.trim(),
            allDay,
        });
        setTitle('');
        setDate('');
        setType('event');
        setDescription('');
        setAllDay(true);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-cyan-400" /> College
                        Calendar
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {events.length} event{events.length === 1 ? '' : 's'}
                    </p>
                </div>
                {isStaff && (
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowForm((v) => !v)}
                    >
                        {showForm ? (
                            <>
                                <Trash2 className="w-4 h-4" /> Close
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Add Event
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Create event form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New
                        calendar event
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Title
                                </p>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. End Semester Exam"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Date
                                </p>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Type
                                </p>
                                <div className="flex gap-1.5">
                                    {(['exam', 'holiday', 'deadline', 'event'] as const).map(
                                        (t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                                                    type === t
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-1.5">
                                Description
                            </p>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. DBMS Project Due"
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allDay}
                                    onChange={(e) => setAllDay(e.target.checked)}
                                    className="accent-cyan-500"
                                />
                                All day
                            </label>
                            <Button
                                variant="primary"
                                onClick={handleAdd}
                                disabled={!title.trim() || !date}
                            >
                                Publish event
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Event Type Legend */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4">
                    {['exam', 'holiday', 'deadline', 'event'].map((t) => {
                        const colors = getTypeColor(t);
                        return (
                            <div key={t} className="flex items-center gap-2">
                                <div
                                    className={`p-1.5 rounded ${colors.bg} ${colors.text}`}
                                >
                                    {getTypeIcon(t)}
                                </div>
                                <span className="text-sm text-slate-300 capitalize">
                                    {t}s
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Upcoming Events */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">
                    Upcoming Events
                </h3>
                <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-white">
                                {events.length === 0
                                    ? 'No events yet'
                                    : 'No upcoming events'}
                            </p>
                            <p className="text-sm mt-1">
                                {events.length === 0
                                    ? 'Staff can publish the first event using the Add Event button.'
                                    : 'Events added here will appear above as their dates approach.'}
                            </p>
                        </div>
                    ) : (
                        upcomingEvents.map((event) => {
                            const colors = getTypeColor(event.type);
                            return (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-xl border ${colors.border} ${colors.bg} hover:opacity-90 transition-opacity`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}
                                            >
                                                {getTypeIcon(event.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {event.title}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {event.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-sm text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(
                                                            event.date
                                                        )}
                                                    </span>
                                                    {!event.allDay && (
                                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            11:59 PM
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex items-start gap-2">
                                            <div>
                                                <Badge
                                                    variant={getTypeBadgeVariant(
                                                        event.type
                                                    )}
                                                    className="capitalize"
                                                >
                                                    {event.type}
                                                </Badge>
                                                <p
                                                    className={`text-sm mt-1 ${colors.text}`}
                                                >
                                                    {getDaysUntil(
                                                        event.date
                                                    )}
                                                </p>
                                            </div>
                                            {isStaff && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeEvent(event.id)
                                                    }
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                    aria-label={`Delete ${event.title}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Past Events
                    </h3>
                    <div className="space-y-2">
                        {pastEvents.slice(0, 5).map((event) => (
                            <div
                                key={event.id}
                                className="p-3 rounded-xl bg-white/5 opacity-60"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded bg-slate-500/20 text-slate-400">
                                            {getTypeIcon(event.type)}
                                        </div>
                                        <div>
                                            <p className="text-slate-300">
                                                {event.title}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatDate(event.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            size="sm"
                                            className="capitalize"
                                        >
                                            {event.type}
                                        </Badge>
                                        {isStaff && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeEvent(event.id)
                                                }
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                                aria-label={`Delete ${event.title}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CalendarPage;

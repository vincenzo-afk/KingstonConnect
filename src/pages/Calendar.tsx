import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, FileText, GraduationCap, Gift, AlertTriangle } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockEvents = [
    { id: '1', title: 'Mid-term Examination', date: '2024-02-01', type: 'exam', description: 'Data Structures Mid-term', allDay: true },
    { id: '2', title: 'Republic Day Holiday', date: '2024-01-26', type: 'holiday', description: 'National Holiday', allDay: true },
    { id: '3', title: 'Project Submission', date: '2024-02-05', type: 'deadline', description: 'DBMS Project Due', allDay: false },
    { id: '4', title: 'Tech Fest', date: '2024-02-10', type: 'event', description: 'Annual Technical Festival', allDay: true },
    { id: '5', title: 'End Semester Exam', date: '2024-04-15', type: 'exam', description: 'Final Examinations Begin', allDay: true },
    { id: '6', title: 'Assignment Deadline', date: '2024-01-30', type: 'deadline', description: 'Algorithm Assignment 3', allDay: false },
];

// =============================================================================
// CALENDAR PAGE
// =============================================================================

const CalendarPage: React.FC = () => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'exam': return <FileText className="w-4 h-4" />;
            case 'holiday': return <Gift className="w-4 h-4" />;
            case 'deadline': return <AlertTriangle className="w-4 h-4" />;
            case 'event': return <GraduationCap className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'exam': return 'error';
            case 'holiday': return 'success';
            case 'deadline': return 'warning';
            case 'event': return 'primary';
            default: return 'secondary';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
            case 'holiday': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
            case 'deadline': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
            case 'event': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' };
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

    const sortedEvents = [...mockEvents].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const upcomingEvents = sortedEvents.filter(e => new Date(e.date) >= new Date());
    const pastEvents = sortedEvents.filter(e => new Date(e.date) < new Date());

    return (
        <div className="space-y-6">
            {/* Event Type Legend */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4">
                    {['exam', 'holiday', 'deadline', 'event'].map(type => {
                        const colors = getTypeColor(type);
                        return (
                            <div key={type} className="flex items-center gap-2">
                                <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>
                                    {getTypeIcon(type)}
                                </div>
                                <span className="text-sm text-slate-300 capitalize">{type}s</span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Upcoming Events */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No upcoming events</p>
                        </div>
                    ) : (
                        upcomingEvents.map(event => {
                            const colors = getTypeColor(event.type);
                            return (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-xl border ${colors.border} ${colors.bg} hover:opacity-90 transition-opacity`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                                                {getTypeIcon(event.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{event.title}</p>
                                                <p className="text-sm text-slate-400">{event.description}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-sm text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(event.date)}
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
                                        <div className="text-right flex-shrink-0">
                                            <Badge variant={getTypeBadgeVariant(event.type) as any} className="capitalize">
                                                {event.type}
                                            </Badge>
                                            <p className={`text-sm mt-1 ${colors.text}`}>
                                                {getDaysUntil(event.date)}
                                            </p>
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
                    <h3 className="text-lg font-semibold text-white mb-4">Past Events</h3>
                    <div className="space-y-2">
                        {pastEvents.slice(0, 5).map(event => (
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
                                            <p className="text-slate-300">{event.title}</p>
                                            <p className="text-sm text-slate-500">{formatDate(event.date)}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" size="sm" className="capitalize">
                                        {event.type}
                                    </Badge>
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

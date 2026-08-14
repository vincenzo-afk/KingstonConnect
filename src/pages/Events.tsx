import React, { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
    CalendarDays,
    MapPin,
    Clock,
    Users,
    Search,
    Ticket,
    Star,
    ExternalLink,
    X,
    Plus,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// EVENTS FEED — college events, hackathons, fests & placements
// =============================================================================

type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Placement' | 'Workshop' | 'Seminar';

interface CollegeEvent {
    id: string;
    title: string;
    category: EventCategory;
    organizer: string;
    date: string;           // YYYY-MM-DD
    time: string;
    venue: string;
    description: string;
    seats: number;
    registered: number;
    registrationOpen: boolean;
    registrationLink?: string;
    fee: string;
    featured: boolean;
}

// Events are created by staff in the Events page and stored locally
// (no mock/demo data — the list starts empty until someone adds an event).

const categoryColors: Record<EventCategory, string> = {
    Technical: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    Cultural: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    Sports: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Placement: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Workshop: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    Seminar: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
};

const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const isUpcoming = (d: string) => new Date(d + 'T00:00:00') >= new Date(new Date().toDateString());

// =============================================================================
// EVENTS PAGE
// =============================================================================

const EventsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [events, setEvents] = useState<CollegeEvent[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<EventCategory | 'All'>('All');
    const [selected, setSelected] = useState<CollegeEvent | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<CollegeEvent>>({
        category: 'Technical',
    });

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const filtered = useMemo(() => {
        return [...events]
            .filter((e) => (category === 'All' || e.category === category))
            .filter((e) =>
                e.title.toLowerCase().includes(search.toLowerCase()) ||
                e.organizer.toLowerCase().includes(search.toLowerCase()) ||
                e.venue.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [events, search, category]);

    const upcomingCount = events.filter((e) => isUpcoming(e.date)).length;

    const addEvent = () => {
        if (
            !form.title?.trim() ||
            !form.date ||
            !form.venue?.trim() ||
            !form.description?.trim()
        )
            return;
        const event: CollegeEvent = {
            id: `ev-${Date.now()}`,
            title: form.title.trim(),
            category: (form.category as EventCategory) || 'Technical',
            organizer: form.organizer?.trim() || user?.role || 'Staff',
            date: form.date!,
            time: form.time || 'All day',
            venue: form.venue.trim(),
            description: form.description.trim(),
            seats: Number(form.seats) || 0,
            registered: 0,
            registrationOpen: form.registrationOpen ?? true,
            registrationLink: form.registrationLink,
            fee: form.fee?.trim() || 'Free',
            featured: form.featured ?? false,
        };
        setEvents((prev) => [event, ...prev]);
        setForm({ category: 'Technical' });
        setShowForm(false);
    };

    const removeEvent = (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setSelected((prev) => (prev?.id === id ? null : prev));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-cyan-400" /> Events & Happenings
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {upcomingCount} upcoming events · technical, cultural, sports & placements
                    </p>
                </div>
                {isStaff && (
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowForm((v) => !v)}
                    >
                        <Plus className="w-4 h-4" />
                        {showForm ? 'Close' : 'Add Event'}
                    </Button>
                )}
            </div>

            {/* Create event form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New event
                    </h3>
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            placeholder="e.g. TechFest 2026"
                            value={form.title || ''}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Date"
                                type="date"
                                value={form.date || ''}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                            <Input
                                label="Time"
                                placeholder="e.g. 09:00 AM - 06:00 PM"
                                value={form.time || ''}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                            />
                            <Input
                                label="Venue"
                                placeholder="e.g. Main Auditorium"
                                value={form.venue || ''}
                                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">Category</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {(['Technical', 'Cultural', 'Sports', 'Placement', 'Workshop', 'Seminar'] as const).map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setForm({ ...form, category: c })}
                                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${form.category === c ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input
                                label="Organizer"
                                placeholder="e.g. Student Council"
                                value={form.organizer || ''}
                                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                            />
                            <Input
                                label="Fee"
                                placeholder="e.g. Free / ₹100"
                                value={form.fee || ''}
                                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-1.5">Description</p>
                            <textarea
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                placeholder="Event details..."
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Seats"
                                type="number"
                                placeholder="0"
                                value={form.seats !== undefined ? String(form.seats) : ''}
                                onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                            />
                            <Input
                                label="Registration link (optional)"
                                placeholder="https://..."
                                value={form.registrationLink || ''}
                                onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                            />
                            <div className="flex items-center gap-3 pt-6">
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.registrationOpen ?? true}
                                        onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
                                        className="accent-cyan-500"
                                    />
                                    Registration open
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.featured ?? false}
                                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                        className="accent-cyan-500"
                                    />
                                    Featured
                                </label>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={addEvent}
                            disabled={!form.title?.trim() || !form.date || !form.venue?.trim() || !form.description?.trim()}
                        >
                            Publish event
                        </Button>
                    </div>
                </Card>
            )}

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <Input
                        placeholder="Search events, organizers, venues..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                        className="max-w-md"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {(['All', 'Technical', 'Cultural', 'Sports', 'Placement', 'Workshop', 'Seminar'] as const).map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                                    category === c
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Featured event */}
            {filtered.some((e) => e.featured) && (
                <Card className="relative overflow-hidden border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex flex-col items-center justify-center w-20 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                            <span className="text-2xl font-bold text-cyan-400">
                                {new Date(filtered.find((e) => e.featured)!.date + 'T00:00:00').getDate()}
                            </span>
                            <span className="text-[10px] uppercase text-slate-400">
                                {new Date(filtered.find((e) => e.featured)!.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={categoryColors[filtered.find((e) => e.featured)!.category]}>
                                    {filtered.find((e) => e.featured)!.category}
                                </Badge>
                                <span className="text-[11px] text-yellow-400 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400" /> Featured
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {filtered.find((e) => e.featured)!.title}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400 mb-3">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {filtered.find((e) => e.featured)!.time}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {filtered.find((e) => e.featured)!.venue}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-cyan-400" /> {filtered.find((e) => e.featured)!.registered}/{filtered.find((e) => e.featured)!.seats} seats
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Ticket className="w-3.5 h-3.5 text-cyan-400" /> {filtered.find((e) => e.featured)!.fee}
                                </span>
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setSelected(filtered.find((e) => e.featured)!)}>
                                View Details & Register
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Event grid */}
            {filtered.length === 0 ? (
                <Card variant="glass" className="p-10 text-center">
                    <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">
                        {events.length === 0 ? 'No events yet' : 'No events match your filters'}
                    </p>
                    <p className="text-sm text-slate-400">
                        {events.length === 0
                            ? 'Staff can publish the first event using the Add Event button.'
                            : 'Try a different category or search term'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered
                        .filter((e) => !e.featured)
                        .map((e) => (
                            <Card key={e.id} className="hover:border-cyan-500/30 transition-colors cursor-pointer group" onClick={() => setSelected(e)}>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <Badge className={categoryColors[e.category]}>{e.category}</Badge>
                                    <span className="text-xs text-cyan-400 font-medium whitespace-nowrap">
                                        {formatDate(e.date)}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
                                    {e.title}
                                </h3>
                                <p className="text-xs text-slate-500 mb-3">{e.organizer}</p>
                                <div className="space-y-1.5 text-xs text-slate-400">
                                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" />{e.time}</p>
                                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" />{e.venue}</p>
                                    <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-400" />{e.registered}/{e.seats} registered</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-300">{e.fee}</span>
                                    {e.registrationOpen ? (
                                        <Badge variant="success" size="sm">Registration Open</Badge>
                                    ) : (
                                        <Badge variant="default" size="sm">Registration Closed</Badge>
                                    )}
                                </div>
                            </Card>
                        ))}
                </div>
            )}

            {/* Detail modal */}
            {selected && (
                <Modal isOpen onClose={() => setSelected(null)} size="md" title={selected.title}>
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <Badge className={categoryColors[selected.category]}>{selected.category}</Badge>
                            {isStaff && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => removeEvent(selected.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-slate-300">{selected.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-slate-400">Date</p>
                                <p className="text-white font-medium">{formatDate(selected.date)}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-slate-400">Time</p>
                                <p className="text-white font-medium">{selected.time}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-slate-400">Venue</p>
                                <p className="text-white font-medium">{selected.venue}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-slate-400">Fee</p>
                                <p className="text-white font-medium">{selected.fee}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3 col-span-2">
                                <p className="text-xs text-slate-400">Organizer</p>
                                <p className="text-white font-medium">{selected.organizer}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Seats filled</p>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (selected.registered / selected.seats) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {selected.registered} of {selected.seats} seats ({((selected.registered / selected.seats) * 100).toFixed(0)}%)
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {selected.registrationOpen ? (
                                selected.registrationLink ? (
                                    <a href={selected.registrationLink} target="_blank" rel="noopener noreferrer" className="contents">
                                        <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} className="justify-center">
                                            Register Now
                                        </Button>
                                    </a>
                                ) : (
                                    <Button variant="primary" icon={<Ticket className="w-4 h-4" />} className="justify-center">
                                        Register at Department Office
                                    </Button>
                                )
                            ) : (
                                <Button variant="secondary" disabled icon={<Ticket className="w-4 h-4" />} className="justify-center col-span-2">
                                    Registration Closed
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={() => setSelected(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default EventsPage;

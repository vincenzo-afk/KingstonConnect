import React, { useMemo, useState } from 'react';
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

const events: CollegeEvent[] = [
    {
        id: 'ev-1',
        title: 'TechFest 2026 — Kingston Engineering Expo',
        category: 'Technical',
        organizer: 'Student Council & CSE Department',
        date: '2026-09-12',
        time: '09:00 AM - 06:00 PM',
        venue: 'Main Auditorium & Labs',
        description: 'The flagship 3-day technical festival featuring project exhibitions, robotics wars, coding sprints, circuit debugging contests and keynote sessions by industry experts from Zoho, Freshworks and Cognizant.',
        seats: 500,
        registered: 312,
        registrationOpen: true,
        fee: '₹100 (with college ID)',
        featured: true,
    },
    {
        id: 'ev-2',
        title: 'Hackathon 4.0 — Build for Bharat',
        category: 'Technical',
        organizer: 'IEEE Student Branch',
        date: '2026-09-20',
        time: '08:00 AM - 08:00 PM',
        venue: 'CSE Block, Innovation Lab',
        description: '24-hour hackathon focused on solving real problems in healthcare, agriculture and civic tech. Teams of up to 4. Mentors from alumni at TCS, Infosys and Wipro. Prizes worth ₹1.5 lakh.',
        seats: 120,
        registered: 84,
        registrationOpen: true,
        fee: 'Free',
        featured: true,
    },
    {
        id: 'ev-3',
        title: 'Campus Drive — Zoho Recruitment',
        category: 'Placement',
        organizer: 'Training & Placement Cell',
        date: '2026-09-05',
        time: '09:30 AM',
        venue: 'Placement Hall, Admin Block',
        description: 'On-campus recruitment for 2026 pass-out batches. Roles: Software Developer, Product Analyst. Package: ₹4.5 - 8.5 LPA. Bring resume, mark sheets and ID card. Shortlisting based on CGPA 6.5+.',
        seats: 200,
        registered: 147,
        registrationOpen: true,
        fee: 'Free',
        featured: true,
    },
    {
        id: 'ev-4',
        title: 'Cultural Fest — Arts & Music Night',
        category: 'Cultural',
        organizer: 'Cultural Club',
        date: '2026-10-02',
        time: '05:30 PM - 10:00 PM',
        venue: 'College Grounds',
        description: 'Annual cultural night with solo/group singing, dance battle, stand-up comedy open mic and band performances. Food stalls and carnival games throughout.',
        seats: 1000,
        registered: 423,
        registrationOpen: true,
        fee: '₹50',
        featured: false,
    },
    {
        id: 'ev-5',
        title: 'Workshop — Machine Learning with Python',
        category: 'Workshop',
        organizer: 'AI & Data Science Club',
        date: '2026-09-25',
        time: '10:00 AM - 04:00 PM',
        venue: 'AI Lab, ECE Block',
        description: 'Hands-on 2-day workshop covering pandas, scikit-learn and building a mini ML project. Laptops required. Certificates for all participants.',
        seats: 60,
        registered: 51,
        registrationOpen: true,
        fee: '₹150 (with kit)',
        featured: false,
    },
    {
        id: 'ev-6',
        title: 'Inter-College Cricket Tournament',
        category: 'Sports',
        organizer: 'Sports Committee',
        date: '2026-10-10',
        time: '07:00 AM onwards',
        venue: 'College Sports Ground',
        description: 'T20 format tournament with 8 colleges participating. Department team selections open till 1st October. Spectator entry free.',
        seats: 300,
        registered: 96,
        registrationOpen: true,
        fee: 'Free for spectators',
        featured: false,
    },
    {
        id: 'ev-7',
        title: 'Seminar — Industry 4.0 & Smart Manufacturing',
        category: 'Seminar',
        organizer: 'Mechanical Engineering Dept.',
        date: '2026-09-28',
        time: '02:00 PM - 05:00 PM',
        venue: 'Seminar Hall, MECH Block',
        description: 'Guest lecture by Mr. Senthil Kumar (Plant Head, Ashok Leyland) on IoT in manufacturing, digital twins and career opportunities in Industry 4.0.',
        seats: 150,
        registered: 102,
        registrationOpen: false,
        fee: 'Free',
        featured: false,
    },
    {
        id: 'ev-8',
        title: 'Fresher\'s Day — Welcome 2026 Batch',
        category: 'Cultural',
        organizer: 'Student Council',
        date: '2026-10-18',
        time: '10:00 AM - 01:00 PM',
        venue: 'Main Auditorium',
        description: 'A fun-filled day to welcome the 2026 batch with games, talent showcase, ice-breaking sessions and a surprise performance by senior batch students.',
        seats: 800,
        registered: 612,
        registrationOpen: false,
        fee: 'Free',
        featured: false,
    },
];

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
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<EventCategory | 'All'>('All');
    const [selected, setSelected] = useState<CollegeEvent | null>(null);

    const filtered = useMemo(() => {
        return events
            .filter((e) => (category === 'All' || e.category === category))
            .filter((e) =>
                e.title.toLowerCase().includes(search.toLowerCase()) ||
                e.organizer.toLowerCase().includes(search.toLowerCase()) ||
                e.venue.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [search, category]);

    const upcomingCount = events.filter((e) => isUpcoming(e.date)).length;

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
            </div>

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
                    <p className="text-white font-medium mb-1">No events match your filters</p>
                    <p className="text-sm text-slate-400">Try a different category or search term</p>
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
                        <Badge className={categoryColors[selected.category]}>{selected.category}</Badge>
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

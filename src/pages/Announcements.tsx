import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Bell, Plus, AlertTriangle, Info, CheckCircle, Megaphone } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockAnnouncements = [
    { id: '1', title: 'Mid-term Examination Schedule', content: 'Mid-term examinations will commence from February 1st, 2024. All students are required to check their exam schedule on the portal. Hall tickets will be available for download from January 25th.', author: 'Principal', authorRole: 'principal', priority: 'high', date: '2024-01-10', department: null },
    { id: '2', title: 'Library Hours Extended', content: 'Library will remain open until 10 PM during the examination period. Students can avail this facility from January 20th to February 15th.', author: 'Librarian', authorRole: 'admin', priority: 'medium', date: '2024-01-12', department: null },
    { id: '3', title: 'CSE Department Seminar', content: 'A seminar on "AI and Machine Learning in Industry" will be conducted on January 25th in Seminar Hall 1. All CSE students are encouraged to attend.', author: 'Dr. Smith', authorRole: 'hod', priority: 'low', date: '2024-01-14', department: 'CSE' },
    { id: '4', title: 'Fee Payment Deadline', content: 'Last date for payment of semester fees is January 31st, 2024. Late payments will attract a fine of Rs. 500.', author: 'Accounts', authorRole: 'admin', priority: 'high', date: '2024-01-08', department: null },
    { id: '5', title: 'Technical Fest Registration', content: 'Registration for TechVista 2024 is now open. Early bird registration ends January 20th with special discounts for participants.', author: 'Student Council', authorRole: 'teacher', priority: 'medium', date: '2024-01-15', department: null },
];

// =============================================================================
// ANNOUNCEMENTS PAGE
// =============================================================================

const AnnouncementsPage: React.FC = () => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'high':
                return { icon: AlertTriangle, bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', badge: 'error' };
            case 'medium':
                return { icon: Info, bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', badge: 'warning' };
            default:
                return { icon: CheckCircle, bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'info' };
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'principal': return 'text-purple-400';
            case 'hod': return 'text-cyan-400';
            case 'teacher': return 'text-green-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Announcements</h2>
                    <p className="text-slate-400">{mockAnnouncements.length} announcements</p>
                </div>
                <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Announcement
                </Button>
            </div>

            {/* High Priority Banner */}
            {mockAnnouncements.filter(a => a.priority === 'high').length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                        <Megaphone className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="font-medium text-red-400">
                            {mockAnnouncements.filter(a => a.priority === 'high').length} high priority announcements
                        </p>
                        <p className="text-sm text-slate-400">Please review important announcements immediately</p>
                    </div>
                </div>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
                {mockAnnouncements.map(announcement => {
                    const config = getPriorityConfig(announcement.priority);
                    const Icon = config.icon;

                    return (
                        <Card key={announcement.id} className={`border ${config.border} hover:border-opacity-60 transition-colors`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}>
                                    <Icon className={`w-6 h-6 ${config.text}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                                                <Badge variant={config.badge as any} size="sm" className="capitalize">
                                                    {announcement.priority} Priority
                                                </Badge>
                                                {announcement.department && (
                                                    <Badge variant="secondary" size="sm">
                                                        {announcement.department}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-sm font-medium ${getRoleColor(announcement.authorRole)}`}>
                                                    {announcement.author}
                                                </span>
                                                <span className="text-slate-500">•</span>
                                                <span className="text-sm text-slate-400">
                                                    {formatDate(announcement.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed">{announcement.content}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {mockAnnouncements.length === 0 && (
                <Card className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No announcements</p>
                </Card>
            )}
        </div>
    );
};

export default AnnouncementsPage;

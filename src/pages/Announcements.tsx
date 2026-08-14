import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { useAnnouncementsStore } from '@/stores/announcementsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    Bell,
    Plus,
    AlertTriangle,
    Info,
    CheckCircle,
    Megaphone,
    Trash2,
    X,
} from 'lucide-react';

// =============================================================================
// ANNOUNCEMENTS PAGE — real data created in-app (no mock data)
// =============================================================================

const AnnouncementsPage: React.FC = () => {
    const { user } = useAuthStore();
    const store = useAnnouncementsStore();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [department, setDepartment] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPriorityConfig = (p: string) => {
        switch (p) {
            case 'high':
                return {
                    icon: AlertTriangle,
                    bg: 'bg-red-500/20',
                    text: 'text-red-400',
                    border: 'border-red-500/30',
                    badge: 'error' as const,
                };
            case 'medium':
                return {
                    icon: Info,
                    bg: 'bg-yellow-500/20',
                    text: 'text-yellow-400',
                    border: 'border-yellow-500/30',
                    badge: 'warning' as const,
                };
            default:
                return {
                    icon: CheckCircle,
                    bg: 'bg-blue-500/20',
                    text: 'text-blue-400',
                    border: 'border-blue-500/30',
                    badge: 'info' as const,
                };
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'principal':
                return 'text-purple-400';
            case 'hod':
                return 'text-cyan-400';
            case 'teacher':
                return 'text-green-400';
            default:
                return 'text-slate-400';
        }
    };

    const submit = () => {
        if (!title.trim() || !content.trim()) return;
        store.addAnnouncement({
            title: title.trim(),
            content: content.trim(),
            author:
                user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.role ?? 'Staff',
            authorRole: user?.role ?? 'staff',
            priority,
            department: department.trim() || null,
        });
        setTitle('');
        setContent('');
        setPriority('medium');
        setDepartment('');
        setShowForm(false);
    };

    const visible =
        filterPriority === 'all'
            ? store.announcements
            : store.announcements.filter((a) => a.priority === filterPriority);
    const highCount = store.announcements.filter(
        (a) => a.priority === 'high'
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Announcements
                    </h2>
                    <p className="text-slate-400">
                        {store.announcements.length} announcement
                        {store.announcements.length === 1 ? '' : 's'}
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
                                <X className="w-4 h-4" /> Close
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> New Announcement
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Create form (staff only) */}
            {isStaff && showForm && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" /> New
                        announcement
                    </h3>
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            placeholder="e.g. Mid-term Examination Schedule"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div>
                            <p className="text-sm font-medium text-slate-300 mb-1.5">
                                Content
                            </p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="Announcement details..."
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Priority
                                </p>
                                <div className="flex gap-2">
                                    {(
                                        ['high', 'medium', 'low'] as const
                                    ).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                                                priority === p
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input
                                label="Department (optional)"
                                placeholder="e.g. CSE"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={submit}
                            disabled={!title.trim() || !content.trim()}
                        >
                            Publish announcement
                        </Button>
                    </div>
                </Card>
            )}

            {/* High Priority Banner */}
            {highCount > 0 && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                        <Megaphone className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="font-medium text-red-400">
                            {highCount} high priority announcement
                            {highCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-slate-400">
                            Please review important announcements immediately
                        </p>
                    </div>
                </div>
            )}

            {/* Priority filter */}
            {store.announcements.length > 0 && (
                <div className="flex gap-2">
                    {['all', 'high', 'medium', 'low'].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setFilterPriority(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                                filterPriority === p
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            {p === 'all' ? 'All' : p}
                        </button>
                    ))}
                </div>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
                {visible.map((announcement) => {
                    const config = getPriorityConfig(announcement.priority);
                    const Icon = config.icon;

                    return (
                        <Card
                            key={announcement.id}
                            className={`border ${config.border} hover:border-opacity-60 transition-colors`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-3 rounded-xl ${config.bg} flex-shrink-0`}
                                >
                                    <Icon className={`w-6 h-6 ${config.text}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {announcement.title}
                                                </h3>
                                                <Badge
                                                    variant={config.badge}
                                                    size="sm"
                                                    className="capitalize"
                                                >
                                                    {announcement.priority}{' '}
                                                    Priority
                                                </Badge>
                                                {announcement.department && (
                                                    <Badge
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        {
                                                            announcement.department
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`text-sm font-medium ${getRoleColor(announcement.authorRole)}`}
                                                >
                                                    {announcement.author}
                                                </span>
                                                <span className="text-slate-500">
                                                    •
                                                </span>
                                                <span className="text-sm text-slate-400">
                                                    {formatDate(
                                                        announcement.date
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        {isStaff && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    store.removeAnnouncement(
                                                        announcement.id
                                                    )
                                                }
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                                aria-label={`Delete ${announcement.title}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-slate-300 leading-relaxed">
                                        {announcement.content}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {store.announcements.length === 0 && (
                <Card className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">No announcements</p>
                    {isStaff && (
                        <p className="text-sm text-slate-400 mt-2">
                            Publish the first announcement using the button
                            above.
                        </p>
                    )}
                </Card>
            )}
        </div>
    );
};

export default AnnouncementsPage;

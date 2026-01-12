import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Bell,
    X,
    CheckCheck,
    Trash2,
    Settings,
    MessageSquare,
    ClipboardCheck,
    FileText,
    Calendar,
    AlertCircle,
    Megaphone,
} from 'lucide-react';

export interface Notification {
    id: string;
    type: 'attendance' | 'result' | 'assignment' | 'announcement' | 'chat' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
    attendance: <ClipboardCheck className="w-5 h-5 text-cyan-400" />,
    result: <FileText className="w-5 h-5 text-[#0284C7]" />,
    assignment: <Calendar className="w-5 h-5 text-[#0891B2]" />,
    announcement: <Megaphone className="w-5 h-5 text-cyan-400" />,
    chat: <MessageSquare className="w-5 h-5 text-sky-400" />,
    system: <AlertCircle className="w-5 h-5 text-[#0369A1]" />,
};

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClearAll,
}) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const getTimeAgo = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Notification Panel */}
            <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-[#0d1419]/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden z-50 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="info" glow size="sm">{unreadCount}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="p-2 text-cyan-200/60 hover:text-white hover:bg-cyan-500/10 rounded-lg transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-4 h-4" />
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="p-2 text-cyan-200/60 hover:text-[#0369A1] hover:bg-[#0369A1]/10 rounded-lg transition-colors"
                                title="Clear all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-cyan-200/60 hover:text-white hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
                            <p className="text-cyan-200/50">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-cyan-500/10">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'p-4 hover:bg-cyan-500/5 transition-colors cursor-pointer group',
                                        !notification.read && 'bg-cyan-500/5'
                                    )}
                                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                            {notificationIcons[notification.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    'text-sm font-medium truncate',
                                                    notification.read ? 'text-cyan-100' : 'text-white'
                                                )}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-sm text-cyan-200/50 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-cyan-200/40 mt-1">
                                                {getTimeAgo(notification.timestamp)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(notification.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-cyan-200/40 hover:text-[#0369A1] hover:bg-[#0369A1]/10 rounded-lg transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-cyan-500/20 bg-cyan-500/5">
                        <Button variant="ghost" size="sm" className="w-full" icon={<Settings className="w-4 h-4" />}>
                            Notification Settings
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

// Custom hook for managing notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'announcement',
            title: 'Holiday Notice',
            message: 'Republic Day holiday on January 26. College will remain closed.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: false,
        },
        {
            id: '2',
            type: 'attendance',
            title: 'Low Attendance Warning',
            message: 'Your attendance in DBMS is below 75%. Please attend regularly.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            read: false,
        },
        {
            id: '3',
            type: 'result',
            title: 'Unit Test Results Published',
            message: 'Unit Test 1 results for Database Management are now available.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            read: true,
        },
        {
            id: '4',
            type: 'assignment',
            title: 'Assignment Due Tomorrow',
            message: 'Database ER Diagram Design is due tomorrow at 11:59 PM.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            read: true,
        },
        {
            id: '5',
            type: 'chat',
            title: 'New Message from Prof. Kumar',
            message: 'Regarding the project submission...',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            read: true,
        },
    ]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
    };
};

export default NotificationCenter;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
    Menu, Sun, Moon, Bell, Search, ChevronDown, User,
    Settings as SettingsIcon, LogOut, CheckCircle2, XCircle,
    AlertTriangle, Info
} from 'lucide-react';

// =============================================================================
// NOTIFICATION CENTER
// =============================================================================

const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationRead, clearNotifications } = useUIStore();
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg shadow-red-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a2332] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map(notification => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors',
                                            !notification.read && 'bg-cyan-500/5'
                                        )}
                                        onClick={() => markNotificationRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                'p-2 rounded-lg',
                                                notification.type === 'success' && 'bg-green-500/10 text-green-400',
                                                notification.type === 'error' && 'bg-red-500/10 text-red-400',
                                                notification.type === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                                                notification.type === 'info' && 'bg-blue-500/10 text-blue-400'
                                            )}>
                                                {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                                {notification.type === 'error' && <XCircle className="w-4 h-4" />}
                                                {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                                {notification.type === 'info' && <Info className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-white">{notification.title}</p>
                                                <p className="text-sm text-slate-400 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export const Header: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme, sidebarCollapsed, setSidebarMobileOpen } = useUIStore();
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getPageTitle = () => {
        const path = location.pathname;
        const titles: Record<string, string> = {
            '/dashboard': 'Dashboard',
            '/studygpt': 'StudyGPT',
            '/attendance': 'Attendance',
            '/results': 'Results',
            '/calendar': 'Calendar',
            '/timetable': 'Timetable',
            '/assignments': 'Assignments',
            '/notes': 'Notes',
            '/chat': 'Chat',
            '/announcements': 'Announcements',
            '/au-portal': 'AU Portal',
            '/profile': 'Profile',
            '/settings': 'Settings',
            '/students': 'Students',
            '/teachers': 'Teachers',
            '/departments': 'Departments',
        };
        return titles[path] || 'KingstonConnect';
    };

    return (
        <header
            className={cn(
                'fixed top-0 right-0 h-16 z-30 transition-all duration-300',
                'bg-[#0a0f14]/80 backdrop-blur-xl border-b border-white/10',
                sidebarCollapsed ? 'md:left-20' : 'md:left-64',
                'left-0'
            )}
        >
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarMobileOpen(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Page Title */}
                <div className="flex-1">
                    <h1 className="text-lg md:text-xl font-semibold text-white">{getPageTitle()}</h1>
                    <p className="text-xs md:text-sm text-slate-400 hidden sm:block">
                        Welcome back, {user?.firstName}!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search - Desktop Only */}
                    <div className="hidden lg:block relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-64 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <Avatar
                                src={user?.avatar}
                                alt={`${user?.firstName} ${user?.lastName}`}
                                size="sm"
                            />
                            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                        </button>

                        {profileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a2332] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-4 border-b border-white/10">
                                        <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3 text-slate-300"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/settings');
                                                setProfileOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3 text-slate-300"
                                        >
                                            <SettingsIcon className="w-4 h-4" />
                                            Settings
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate('/login');
                                            }}
                                            className="w-full px-4 py-2.5 text-left rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

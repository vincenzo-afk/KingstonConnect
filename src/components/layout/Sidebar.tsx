import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
    Menu, ChevronRight, LogOut, Home, Zap, UserCheck, Award,
    Calendar, Clock, ClipboardList, BookMarked, MessageSquare,
    Bell, ExternalLink, Users, GraduationCap, Building2
} from 'lucide-react';

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = useMemo(() => {
        const baseItems = [
            { path: '/dashboard', icon: Home, label: 'Dashboard' },
            { path: '/studygpt', icon: Zap, label: 'StudyGPT' },
            { path: '/attendance', icon: UserCheck, label: 'Attendance' },
            { path: '/results', icon: Award, label: 'Results' },
            { path: '/calendar', icon: Calendar, label: 'Calendar' },
            { path: '/timetable', icon: Clock, label: 'Timetable' },
            { path: '/assignments', icon: ClipboardList, label: 'Assignments' },
            { path: '/notes', icon: BookMarked, label: 'Notes' },
            { path: '/chat', icon: MessageSquare, label: 'Chat' },
            { path: '/announcements', icon: Bell, label: 'Announcements' },
            { path: '/au-portal', icon: ExternalLink, label: 'AU Portal' },
        ];

        if (user?.role === 'teacher' || user?.role === 'hod' || user?.role === 'principal') {
            baseItems.push({ path: '/students', icon: Users, label: 'Students' });
        }

        if (user?.role === 'hod' || user?.role === 'principal') {
            baseItems.push({ path: '/teachers', icon: GraduationCap, label: 'Teachers' });
        }

        if (user?.role === 'principal') {
            baseItems.push({ path: '/departments', icon: Building2, label: 'Departments' });
        }

        return baseItems;
    }, [user?.role]);

    const NavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
            <Link
                to={item.path}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'hover:bg-white/5',
                    isActive && 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30',
                    sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? item.label : undefined}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                )}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                {!sidebarCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
                            K
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Kingston
                            </span>
                            <p className="text-xs text-slate-400">Connect</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                >
                    {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                {navItems.map(item => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
                <div className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm',
                    sidebarCollapsed && 'justify-center'
                )}>
                    <Avatar
                        src={user?.avatar}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        size="sm"
                    />
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-white">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className={cn(
                        'w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl',
                        'hover:bg-red-500/10 text-red-400 transition-colors',
                        sidebarCollapsed && 'justify-center'
                    )}
                >
                    <LogOut className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300',
                    'bg-[#0f1419]/95 backdrop-blur-xl border-r border-white/10',
                    sidebarCollapsed ? 'w-20' : 'w-64'
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarMobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarMobileOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0f1419] border-r border-white/10 z-50 md:hidden flex flex-col animate-slide-in-left">
                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
};

export default Sidebar;

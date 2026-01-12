import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';

// =============================================================================
// DASHBOARD LAYOUT
// =============================================================================

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { sidebarCollapsed } = useUIStore();

    return (
        <div className="min-h-screen bg-[#0a0f14]">
            <Sidebar />
            <Header />
            <main
                className={cn(
                    'pt-16 min-h-screen transition-all duration-300',
                    sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
                )}
            >
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'default',
    size = 'md',
    dot = false,
    glow = false,
    children,
    ...props
}) => {
    const variants = {
        default: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        primary: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        secondary: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        error: 'bg-red-500/20 text-red-400 border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        outline: 'bg-transparent text-cyan-200 border-cyan-500/30',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const dotColors = {
        default: 'bg-cyan-400',
        primary: 'bg-cyan-400',
        secondary: 'bg-slate-400',
        success: 'bg-green-400',
        warning: 'bg-yellow-400',
        error: 'bg-red-400',
        info: 'bg-blue-400',
        outline: 'bg-cyan-400',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full border',
                variants[variant],
                sizes[size],
                glow && 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
            )}
            {children}
        </span>
    );
};

// Role Badge with specific styling (all cyan-teal variants)
interface RoleBadgeProps {
    role: 'principal' | 'hod' | 'teacher' | 'student';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
    const roleConfig = {
        principal: {
            label: 'Principal',
            className: 'bg-[#0E7490]/20 text-[#0E7490] border-[#0E7490]/30',
        },
        hod: {
            label: 'HOD',
            className: 'bg-[#0891B2]/20 text-[#0891B2] border-[#0891B2]/30',
        },
        teacher: {
            label: 'Teacher',
            className: 'bg-[#0284C7]/20 text-[#0284C7] border-[#0284C7]/30',
        },
        student: {
            label: 'Student',
            className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
    };

    const config = roleConfig[role];

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border',
                config.className
            )}
        >
            {config.label}
        </span>
    );
};

// Counter Badge (for notification counts)
interface CounterBadgeProps {
    count: number;
    max?: number;
    className?: string;
}

export const CounterBadge: React.FC<CounterBadgeProps> = ({
    count,
    max = 99,
    className,
}) => {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count;

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]',
                className
            )}
        >
            {displayCount}
        </span>
    );
};

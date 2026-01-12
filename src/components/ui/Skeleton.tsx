import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'shimmer' | 'none';
}

/**
 * Base Skeleton component for loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'default',
    animation = 'pulse',
}) => {
    return (
        <div
            className={cn(
                'bg-white/5',
                {
                    'rounded-lg': variant === 'default',
                    'rounded-full': variant === 'circular',
                    'rounded-none': variant === 'rectangular',
                    'animate-pulse': animation === 'pulse',
                    'animate-shimmer': animation === 'shimmer',
                },
                className
            )}
        />
    );
};

/**
 * Card skeleton for loading card content
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4', className)}>
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
            </div>
        </div>
    );
};

/**
 * Table row skeleton for loading table content
 */
export const SkeletonTableRow: React.FC<{ columns?: number; className?: string }> = ({
    columns = 4,
    className,
}) => {
    return (
        <tr className={cn('border-b border-white/5', className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4" />
                </td>
            ))}
        </tr>
    );
};

/**
 * List item skeleton
 */
export const SkeletonListItem: React.FC<{ hasAvatar?: boolean; className?: string }> = ({
    hasAvatar = true,
    className,
}) => {
    return (
        <div className={cn('flex items-center gap-4 p-4', className)}>
            {hasAvatar && <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />}
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
};

/**
 * Stat card skeleton
 */
export const SkeletonStatCard: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('bg-white/5 border border-white/5 rounded-2xl p-6', className)}>
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
        </div>
    );
};

/**
 * Text skeleton for paragraphs
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
    lines = 3,
    className,
}) => {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn('h-3', {
                        'w-full': i < lines - 1,
                        'w-3/4': i === lines - 1,
                    })}
                />
            ))}
        </div>
    );
};

/**
 * Avatar skeleton
 */
export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className,
}) => {
    return (
        <Skeleton
            variant="circular"
            className={cn(
                {
                    'w-8 h-8': size === 'sm',
                    'w-10 h-10': size === 'md',
                    'w-12 h-12': size === 'lg',
                },
                className
            )}
        />
    );
};

/**
 * Button skeleton
 */
export const SkeletonButton: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className,
}) => {
    return (
        <Skeleton
            className={cn(
                'rounded-lg',
                {
                    'h-8 w-16': size === 'sm',
                    'h-10 w-24': size === 'md',
                    'h-12 w-32': size === 'lg',
                },
                className
            )}
        />
    );
};

/**
 * Input skeleton
 */
export const SkeletonInput: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('space-y-2', className)}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    );
};

/**
 * Dashboard skeleton for full page loading
 */
export const SkeletonDashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome section */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <SkeletonCard className="h-64" />
                    <SkeletonCard className="h-64" />
                </div>
                <div className="space-y-6">
                    <SkeletonCard className="h-48" />
                    <SkeletonCard className="h-64" />
                </div>
            </div>
        </div>
    );
};

/**
 * Chat skeleton
 */
export const SkeletonChat: React.FC = () => {
    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/5 p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonListItem key={i} />
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn('flex gap-3', {
                            'justify-end': i % 3 === 0,
                        })}
                    >
                        {i % 3 !== 0 && <SkeletonAvatar size="sm" />}
                        <div className={cn('space-y-2', { 'items-end': i % 3 === 0 })}>
                            <Skeleton className={cn('h-16 rounded-2xl', i % 3 === 0 ? 'w-48' : 'w-64')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Profile skeleton
 */
export const SkeletonProfile: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Skeleton variant="circular" className="w-24 h-24" />
                <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard className="h-48" />
                <SkeletonCard className="h-48" />
            </div>
        </div>
    );
};

export default Skeleton;

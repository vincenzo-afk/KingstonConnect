import React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'busy' | 'away';
    glow?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
    className,
    src,
    alt,
    name,
    size = 'md',
    status,
    glow = false,
    ...props
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    const statusColors = {
        online: 'bg-[#0284C7] shadow-[0_0_6px_#0284C7]',
        offline: 'bg-cyan-600/50',
        busy: 'bg-[#0369A1] shadow-[0_0_6px_#0369A1]',
        away: 'bg-[#36B7D9] shadow-[0_0_6px_#36B7D9]',
    };

    return (
        <div className={cn('relative inline-flex', className)} {...props}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className={cn(
                        'rounded-full object-cover bg-cyan-500/10',
                        sizes[size],
                        glow && 'shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-cyan-500 to-sky-500 text-white',
                        sizes[size],
                        glow && 'shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    )}
                >
                    {name ? getInitials(name) : '?'}
                </div>
            )}
            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 rounded-full border-2 border-[#0a0f14]',
                        statusSizes[size],
                        statusColors[status]
                    )}
                />
            )}
        </div>
    );
};

// Avatar Group
interface AvatarGroupProps {
    avatars: Array<{
        src?: string;
        name?: string;
    }>;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    avatars,
    max = 4,
    size = 'md',
}) => {
    const visible = avatars.slice(0, max);
    const remaining = avatars.length - max;

    const overlapSizes = {
        xs: '-ml-2',
        sm: '-ml-2.5',
        md: '-ml-3',
        lg: '-ml-4',
    };

    return (
        <div className="flex items-center">
            {visible.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    name={avatar.name}
                    size={size}
                    className={cn(
                        index > 0 && overlapSizes[size],
                        'ring-2 ring-[#0a0f14]'
                    )}
                />
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        'rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 font-medium ring-2 ring-[#0a0f14]',
                        overlapSizes[size],
                        size === 'xs' && 'w-6 h-6 text-[10px]',
                        size === 'sm' && 'w-8 h-8 text-xs',
                        size === 'md' && 'w-10 h-10 text-sm',
                        size === 'lg' && 'w-12 h-12 text-base'
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
};

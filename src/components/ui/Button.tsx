import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            glow = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const variants = {
            primary: 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 border border-cyan-400/20',
            secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
            danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
            ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
            outline: 'bg-transparent text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10',
            glass: 'bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
            icon: 'p-2.5',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0f14]',
                    variants[variant],
                    sizes[size],
                    glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]',
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    icon && iconPosition === 'left' && icon
                )}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }
);

Button.displayName = 'Button';

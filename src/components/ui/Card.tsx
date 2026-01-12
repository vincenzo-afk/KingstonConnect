import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient' | 'outline';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hover = false, padding = 'md', glow = false, children, ...props }, ref) => {
        const variants = {
            default: 'bg-[#0a0f14] border border-white/5',
            glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
            gradient: 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10',
            outline: 'bg-transparent border border-white/10',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-5 md:p-6',
            lg: 'p-6 md:p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl transition-all duration-300',
                    variants[variant],
                    paddings[padding],
                    hover && 'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-1',
                    glow && 'shadow-[0_0_30px_rgba(6,182,212,0.1)]',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
};

// Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const CardTitle: React.FC<CardTitleProps> = ({ className, as: Tag = 'h3', children, ...props }) => {
    return (
        <Tag className={cn('text-lg font-semibold text-white', className)} {...props}>
            {children}
        </Tag>
    );
};

// Card Description
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => {
    return (
        <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
            {children}
        </p>
    );
};

// Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
};

// Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('mt-4 pt-4 border-t border-white/5', className)} {...props}>
            {children}
        </div>
    );
};

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent' | 'info';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent' | 'info';
    trend?: {
        value: number;
        label?: string;
        positive?: boolean;
    };
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    variant,
    trend,
    className
}) => {
    // variant takes precedence over color for compatibility
    const effectiveColor = variant || color || 'primary';
    const colors = {
        default: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
        primary: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        success: 'text-green-400 bg-green-500/10 border-green-500/20',
        warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        error: 'text-red-400 bg-red-500/10 border-red-500/20',
        accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };

    return (
        <Card variant="glass" hover className={cn("relative overflow-hidden group", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {icon && (
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-300",
                        colors[effectiveColor]
                    )}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as any, { className: "w-6 h-6" }) : icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        trend.positive ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                    <span className="text-xs text-slate-500">{trend.label}</span>
                </div>
            )}
        </Card>
    );
};

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, iconPosition = 'left', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-cyan-100 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-white placeholder:text-cyan-400/40 transition-all duration-200',
                            'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            icon && iconPosition === 'left' && 'pl-10',
                            icon && iconPosition === 'right' && 'pr-10',
                            error && 'border-[#0369A1]/50 focus:border-[#0369A1]/50 focus:ring-[#0369A1]/20',
                            className
                        )}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-[#0369A1]">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-cyan-100 mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-white placeholder:text-cyan-400/40 transition-all duration-200 resize-none',
                        'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-[#0369A1]/50 focus:border-[#0369A1]/50 focus:ring-[#0369A1]/20',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-xs text-[#0369A1]">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-cyan-100 mb-2">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-white transition-all duration-200 appearance-none cursor-pointer',
                        'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-[#0369A1]/50',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#0a0f14] text-white">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1.5 text-xs text-[#0369A1]">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

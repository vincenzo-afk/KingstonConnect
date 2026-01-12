import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface DropdownItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
}

export interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    selectedId?: string;
    align?: 'left' | 'right';
    width?: 'auto' | 'trigger' | number;
    className?: string;
    menuClassName?: string;
}

export interface DropdownMenuProps {
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement>;
    align?: 'left' | 'right';
    className?: string;
}

// =============================================================================
// DROPDOWN MENU (Portal-based)
// =============================================================================

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    children,
    open,
    onClose,
    triggerRef,
    align = 'left',
    className,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position
    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const menuWidth = menuRef.current?.offsetWidth || 200;

            let left = align === 'right' ? rect.right - menuWidth : rect.left;
            const top = rect.bottom + 8;

            // Ensure menu stays in viewport
            if (left < 8) left = 8;
            if (left + menuWidth > window.innerWidth - 8) {
                left = window.innerWidth - menuWidth - 8;
            }

            setPosition({ top, left });
        }
    }, [open, triggerRef, align]);

    // Handle click outside
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onClose, triggerRef]);

    if (!open) return null;

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className={cn(
                'fixed z-50 min-w-[160px] py-2 bg-[#1a242d] border border-white/10 rounded-xl shadow-xl backdrop-blur-md',
                'animate-fade-in origin-top',
                className
            )}
            style={{ top: position.top, left: position.left }}
        >
            {children}
        </div>,
        document.body
    );
};

// =============================================================================
// DROPDOWN ITEM
// =============================================================================

interface DropdownItemComponentProps {
    item: DropdownItem;
    selected?: boolean;
    onSelect: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

const DropdownItemComponent: React.FC<DropdownItemComponentProps> = ({
    item,
    selected,
    onSelect,
    onKeyDown,
}) => {
    if (item.divider) {
        return <div className="my-2 border-t border-white/10" role="separator" />;
    }

    return (
        <button
            role="menuitem"
            disabled={item.disabled}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                'focus:outline-none focus:bg-white/5',
                item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : item.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-slate-200 hover:bg-white/5',
                selected && 'bg-cyan-500/10'
            )}
        >
            {item.icon && (
                <span className={cn('flex-shrink-0', item.danger ? 'text-red-400' : 'text-slate-400')}>
                    {item.icon}
                </span>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                {item.description && (
                    <p className="text-xs text-slate-500 truncate">{item.description}</p>
                )}
            </div>
            {selected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
        </button>
    );
};

// =============================================================================
// MAIN DROPDOWN COMPONENT
// =============================================================================

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    onSelect,
    selectedId,
    align = 'left',
    className,
    menuClassName,
}) => {
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleSelect = useCallback(
        (item: DropdownItem) => {
            if (!item.disabled && !item.divider) {
                onSelect(item);
                setOpen(false);
            }
        },
        [onSelect]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const selectableItems = items.filter(item => !item.divider && !item.disabled);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev =>
                        prev < selectableItems.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev =>
                        prev > 0 ? prev - 1 : selectableItems.length - 1
                    );
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (focusedIndex >= 0) {
                        handleSelect(selectableItems[focusedIndex]);
                    }
                    break;
                case 'Escape':
                    setOpen(false);
                    triggerRef.current?.focus();
                    break;
            }
        },
        [items, focusedIndex, handleSelect]
    );

    return (
        <div className={cn('relative inline-block', className)}>
            <button
                ref={triggerRef}
                onClick={() => setOpen(!open)}
                aria-haspopup="true"
                aria-expanded={open}
                className="focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg"
            >
                {trigger}
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                triggerRef={triggerRef as React.RefObject<HTMLElement>}
                align={align}
                className={menuClassName}
            >
                {items.map((item) => (
                    <DropdownItemComponent
                        key={item.id}
                        item={item}
                        selected={item.id === selectedId}
                        onSelect={() => handleSelect(item)}
                        onKeyDown={handleKeyDown}
                    />
                ))}
            </DropdownMenu>
        </div>
    );
};

// =============================================================================
// SELECT DROPDOWN (Alternative to native select)
// =============================================================================

interface SelectDropdownProps {
    value?: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    className?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled,
    error,
    label,
    className,
}) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const items: DropdownItem[] = options.map(opt => ({
        id: opt.value,
        label: opt.label,
        icon: opt.icon,
    }));

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    ref={triggerRef}
                    onClick={() => !disabled && setOpen(!open)}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={cn(
                        'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl',
                        'bg-white/5 border transition-colors text-left',
                        error
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-white/10 hover:border-white/20 focus:border-cyan-500',
                        disabled && 'opacity-50 cursor-not-allowed',
                        'focus:outline-none focus:ring-2 focus:ring-cyan-500/20'
                    )}
                >
                    <span className={cn('truncate', !selectedOption && 'text-slate-500')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        className={cn(
                            'w-4 h-4 text-slate-400 transition-transform',
                            open && 'rotate-180'
                        )}
                    />
                </button>

                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    triggerRef={triggerRef as React.RefObject<HTMLElement>}
                    className="w-full"
                >
                    {items.map(item => (
                        <DropdownItemComponent
                            key={item.id}
                            item={item}
                            selected={item.id === value}
                            onSelect={() => {
                                onChange(item.id);
                                setOpen(false);
                            }}
                            onKeyDown={() => { }}
                        />
                    ))}
                </DropdownMenu>
            </div>
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        </div>
    );
};

export default Dropdown;

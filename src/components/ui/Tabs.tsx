import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
}

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (id: string) => void;
    orientation: 'horizontal' | 'vertical';
}

// =============================================================================
// CONTEXT
// =============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

// =============================================================================
// TABS ROOT
// =============================================================================

interface TabsProps {
    children: React.ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    children,
    defaultValue,
    value,
    onValueChange,
    orientation = 'horizontal',
    className,
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeTab = value !== undefined ? value : internalValue;

    const setActiveTab = useCallback(
        (id: string) => {
            if (value === undefined) {
                setInternalValue(id);
            }
            onValueChange?.(id);
        },
        [value, onValueChange]
    );

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
            <div
                className={cn(
                    orientation === 'vertical' && 'flex gap-6',
                    className
                )}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
};

// =============================================================================
// TAB LIST
// =============================================================================

interface TabListProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'pills' | 'underline';
}

export const TabList: React.FC<TabListProps> = ({
    children,
    className,
    variant = 'default',
}) => {
    const { orientation } = useTabsContext();
    const listRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle] = useState({ left: 0, width: 0 });

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const tabs = listRef.current?.querySelectorAll('[role="tab"]:not([disabled])');
        if (!tabs) return;

        const currentIndex = Array.from(tabs).findIndex(
            tab => tab === document.activeElement
        );

        let nextIndex = -1;

        if (orientation === 'horizontal') {
            if (e.key === 'ArrowRight') {
                nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            }
        } else {
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            } else if (e.key === 'ArrowUp') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            }
        }

        if (e.key === 'Home') {
            nextIndex = 0;
        } else if (e.key === 'End') {
            nextIndex = tabs.length - 1;
        }

        if (nextIndex !== -1) {
            e.preventDefault();
            (tabs[nextIndex] as HTMLElement).focus();
        }
    }, [orientation]);

    return (
        <div
            ref={listRef}
            role="tablist"
            aria-orientation={orientation}
            onKeyDown={handleKeyDown}
            className={cn(
                'relative',
                orientation === 'horizontal' && 'flex',
                orientation === 'vertical' && 'flex flex-col',
                variant === 'default' && 'gap-1 p-1 bg-white/5 rounded-xl',
                variant === 'underline' && 'border-b border-white/10',
                variant === 'pills' && 'gap-2',
                className
            )}
        >
            {children}
            {variant === 'underline' && (
                <div
                    className="absolute bottom-0 h-0.5 bg-cyan-500 transition-all duration-300"
                    style={indicatorStyle}
                />
            )}
        </div>
    );
};

// =============================================================================
// TAB TRIGGER
// =============================================================================

interface TabTriggerProps {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    badge?: string | number;
    className?: string;
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
    value,
    children,
    disabled,
    icon,
    badge,
    className,
}) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${value}`}
            id={`tab-${value}`}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(value)}
            className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 rounded-lg',
                isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {badge !== undefined && (
                <span
                    className={cn(
                        'ml-auto px-2 py-0.5 text-xs rounded-full',
                        isActive
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-white/10 text-slate-400'
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    );
};

// =============================================================================
// TAB CONTENT
// =============================================================================

interface TabContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    forceMount?: boolean;
}

export const TabContent: React.FC<TabContentProps> = ({
    value,
    children,
    className,
    forceMount = false,
}) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive && !forceMount) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            id={`panel-${value}`}
            aria-labelledby={`tab-${value}`}
            tabIndex={0}
            hidden={!isActive}
            className={cn(
                'focus:outline-none',
                isActive && 'animate-fade-in',
                className
            )}
        >
            {children}
        </div>
    );
};

// =============================================================================
// SIMPLE TABS (Alternative API)
// =============================================================================

interface SimpleTabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    className,
}) => {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    // Update indicator position
    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
        const activeRef = tabRefs.current[activeIndex];

        if (activeRef && variant === 'underline') {
            setIndicatorStyle({
                left: activeRef.offsetLeft,
                width: activeRef.offsetWidth,
            });
        }
    }, [activeTab, tabs, variant]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        const enabledTabs = tabs.filter(tab => !tab.disabled);
        const currentEnabledIndex = enabledTabs.findIndex(tab => tab.id === tabs[index].id);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentEnabledIndex + 1) % enabledTabs.length;
            onChange(enabledTabs[nextIndex].id);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
            onChange(enabledTabs[prevIndex].id);
        }
    };

    const sizeClasses = {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-2.5',
    };

    return (
        <div
            role="tablist"
            className={cn(
                'relative flex',
                variant === 'default' && 'gap-1 p-1 bg-white/5 rounded-xl',
                variant === 'underline' && 'border-b border-white/10',
                variant === 'pills' && 'gap-2',
                fullWidth && 'w-full',
                className
            )}
        >
            {tabs.map((tab, index) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                        key={tab.id}
                        ref={el => { tabRefs.current[index] = el; }}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        disabled={tab.disabled}
                        onClick={() => !tab.disabled && onChange(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={cn(
                            'relative flex items-center justify-center gap-2 font-medium transition-all',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                            sizeClasses[size],
                            variant === 'default' && 'rounded-lg',
                            variant === 'pills' && 'rounded-full',
                            variant === 'underline' && 'rounded-t-lg pb-3',
                            isActive
                                ? variant === 'pills'
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-white bg-white/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5',
                            tab.disabled && 'opacity-50 cursor-not-allowed',
                            fullWidth && 'flex-1'
                        )}
                    >
                        {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span
                                className={cn(
                                    'px-1.5 py-0.5 text-xs rounded-full',
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-slate-400'
                                )}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}

            {/* Underline indicator */}
            {variant === 'underline' && (
                <div
                    className="absolute bottom-0 h-0.5 bg-cyan-500 transition-all duration-300 ease-out"
                    style={indicatorStyle}
                />
            )}
        </div>
    );
};

export default Tabs;

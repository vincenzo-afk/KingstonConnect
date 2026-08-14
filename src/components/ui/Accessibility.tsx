import React from 'react';
import { useFocusTrap } from './accessibilityHooks';

// =============================================================================
// FOCUS TRAP HOOK
// =============================================================================

/**
 * Hook that traps focus within a container when active
 */

interface FocusTrapProps {
    children: React.ReactNode;
    active?: boolean;
    className?: string;
}

interface VisuallyHiddenProps {
    children: React.ReactNode;
    as?: React.ElementType;
}

interface SkipLinkProps {
    href: string;
    children?: React.ReactNode;
}

export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

interface LiveRegionProps {
    children: React.ReactNode;
    politeness?: LiveRegionPoliteness;
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
}

interface LiveRegionProps {
    children: React.ReactNode;
    politeness?: LiveRegionPoliteness;
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
    children,
    active = true,
    className,
}) => {
    const containerRef = useFocusTrap(active);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

// =============================================================================
// SCREEN READER ONLY COMPONENT
// =============================================================================



/**
 * Component that hides content visually but keeps it accessible to screen readers
 */

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
    children,
    as: Component = 'span',
}) => {
    return (
        <Component
            style={{
                position: 'absolute' as const,
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: '0',
            }}
        >
            {children}
        </Component>
    );
};

// =============================================================================
// SKIP LINK COMPONENT
// =============================================================================



/**
 * Skip link for keyboard users to skip to main content
 */

export const SkipLink: React.FC<SkipLinkProps> = ({
    href,
    children = 'Skip to main content',
}) => {
    return (
        <a
            href={href}
            className="
                sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
                focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-lg
                focus:outline-none focus:ring-2 focus:ring-white
            "
        >
            {children}
        </a>
    );
};

// =============================================================================
// LIVE REGION COMPONENT
// =============================================================================



/**
 * Component that announces dynamic content changes to screen readers
 */

export const LiveRegion: React.FC<LiveRegionProps> = ({
    children,
    politeness = 'polite',
    atomic = true,
    relevant = 'additions text',
}) => {
    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic={atomic}
            aria-relevant={relevant}
            className="sr-only"
        >
            {children}
        </div>
    );
};

// =============================================================================
// ANNOUNCE HOOK
// =============================================================================

/**
 * Hook that provides a function to announce messages to screen readers
 */
export default FocusTrap;

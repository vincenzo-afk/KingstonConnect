import React, { useEffect, useRef, useCallback } from 'react';

// =============================================================================
// FOCUS TRAP HOOK
// =============================================================================

/**
 * Hook that traps focus within a container when active
 */
export function useFocusTrap(active: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = getFocusableElements(container);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Store the previously focused element
        const previouslyFocused = document.activeElement as HTMLElement;

        // Focus the first element
        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            // Restore focus to previously focused element
            previouslyFocused?.focus?.();
        };
    }, [active]);

    return containerRef;
}

// =============================================================================
// FOCUS TRAP COMPONENT
// =============================================================================

interface FocusTrapProps {
    children: React.ReactNode;
    active?: boolean;
    className?: string;
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

interface VisuallyHiddenProps {
    children: React.ReactNode;
    as?: React.ElementType;
}

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

interface SkipLinkProps {
    href: string;
    children?: React.ReactNode;
}

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

type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

interface LiveRegionProps {
    children: React.ReactNode;
    politeness?: LiveRegionPoliteness;
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
}

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
export function useAnnounce() {
    const regionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create the live region
        const region = document.createElement('div');
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        `;
        document.body.appendChild(region);
        regionRef.current = region;

        return () => {
            if (regionRef.current) {
                document.body.removeChild(regionRef.current);
            }
        };
    }, []);

    const announce = useCallback((message: string, politeness: LiveRegionPoliteness = 'polite') => {
        if (!regionRef.current) return;

        regionRef.current.setAttribute('aria-live', politeness);
        regionRef.current.textContent = '';

        // Force reflow to reset announcement
        void regionRef.current.offsetWidth;

        regionRef.current.textContent = message;
    }, []);

    return announce;
}

// =============================================================================
// ROVING TABINDEX HOOK
// =============================================================================

/**
 * Hook that implements roving tabindex pattern for arrow key navigation
 */
export function useRovingTabindex<T extends HTMLElement>(
    items: T[],
    options?: {
        loop?: boolean;
        orientation?: 'horizontal' | 'vertical' | 'both';
    }
) {
    const { loop = true, orientation = 'both' } = options || {};
    const [focusedIndex, setFocusedIndex] = React.useState(0);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const currentIndex = focusedIndex;
            let nextIndex = currentIndex;

            const horizontalKeys = ['ArrowLeft', 'ArrowRight'];
            const verticalKeys = ['ArrowUp', 'ArrowDown'];
            const allowedKeys =
                orientation === 'horizontal'
                    ? horizontalKeys
                    : orientation === 'vertical'
                        ? verticalKeys
                        : [...horizontalKeys, ...verticalKeys];

            if (!allowedKeys.includes(e.key)) return;

            e.preventDefault();

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextIndex = currentIndex + 1;
                if (nextIndex >= items.length) {
                    nextIndex = loop ? 0 : items.length - 1;
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextIndex = currentIndex - 1;
                if (nextIndex < 0) {
                    nextIndex = loop ? items.length - 1 : 0;
                }
            } else if (e.key === 'Home') {
                nextIndex = 0;
            } else if (e.key === 'End') {
                nextIndex = items.length - 1;
            }

            setFocusedIndex(nextIndex);
            items[nextIndex]?.focus();
        },
        [focusedIndex, items, loop, orientation]
    );

    const getTabIndex = useCallback(
        (index: number) => (index === focusedIndex ? 0 : -1),
        [focusedIndex]
    );

    return { focusedIndex, setFocusedIndex, handleKeyDown, getTabIndex };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'audio[controls]',
        'video[controls]',
        '[contenteditable]:not([contenteditable="false"])',
    ].join(', ');

    const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(elements).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
    );
}

/**
 * Generate a unique ID for accessibility purposes
 */
let idCounter = 0;
export function useId(prefix: string = 'id'): string {
    const idRef = useRef<string | null>(null);

    if (idRef.current === null) {
        idCounter += 1;
        idRef.current = `${prefix}-${idCounter}`;
    }

    return idRef.current;
}

/**
 * Combine refs into one
 */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
    return (value: T) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref && typeof ref === 'object') {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const onChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', onChange);
        return () => mediaQuery.removeEventListener('change', onChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Describe element for screen readers
 */
export function getAriaDescribedBy(...descriptions: (string | undefined | null)[]): string {
    return descriptions.filter(Boolean).join(' ');
}

export default FocusTrap;

import { useEffect, useRef, useCallback, useState } from 'react';
import { getFocusableElements } from './accessibilityUtils';
import type { LiveRegionPoliteness } from './Accessibility';

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
    const [focusedIndex, setFocusedIndex] = useState(0);

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

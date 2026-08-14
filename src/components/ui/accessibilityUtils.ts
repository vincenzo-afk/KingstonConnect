import React, { useEffect } from 'react';

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
// Module-level counter used only inside useState's lazy initializer,
// which is executed once per component instance and never during render.
let idCounter = 0;

export function useId(prefix: string = 'id'): string {
    const [id] = React.useState(() => `${prefix}-${idCounter++}`);

    return id;
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
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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


/**
 * Custom React Hooks
 * Collection of reusable hooks for common functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// =============================================================================
// useDebounce - Debounce a value or function
// =============================================================================

/**
 * Debounce a value - useful for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 300
): T {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

// =============================================================================
// useLocalStorage - Persist state to localStorage
// =============================================================================

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    // Get initial value from localStorage or use default
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}

// =============================================================================
// useOnClickOutside - Detect clicks outside an element
// =============================================================================

export function useOnClickOutside<T extends HTMLElement>(
    ref: React.RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
): void {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// =============================================================================
// useMediaQuery - Responsive breakpoint detection
// =============================================================================

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

        setMatches(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

// Pre-configured breakpoint hooks
export const useIsMobile = () => useMediaQuery('(max-width: 639px)');
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

// =============================================================================
// usePrevious - Get the previous value of a state
// =============================================================================

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// =============================================================================
// useToggle - Boolean toggle state
// =============================================================================

export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue((v) => !v), []);
    return [value, toggle, setValue];
}

// =============================================================================
// useAsync - Handle async operations with loading and error states
// =============================================================================

interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
): AsyncState<T> & { execute: () => Promise<void> } {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const data = await asyncFunction();
            setState({ data, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { ...state, execute };
}

// =============================================================================
// useInterval - Execute a callback at intervals
// =============================================================================

export function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const tick = () => savedCallback.current();
        const id = setInterval(tick, delay);

        return () => clearInterval(id);
    }, [delay]);
}

// =============================================================================
// useTimeout - Execute a callback after a delay
// =============================================================================

export function useTimeout(callback: () => void, delay: number | null): void {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}

// =============================================================================
// useScrollPosition - Track scroll position
// =============================================================================

export function useScrollPosition(): { x: number; y: number } {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            setPosition({ x: window.scrollX, y: window.scrollY });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return position;
}

// =============================================================================
// useIntersectionObserver - Detect when element is in viewport
// =============================================================================

interface IntersectionOptions extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options: IntersectionOptions = {}
): IntersectionObserverEntry | undefined {
    const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

    const [entry, setEntry] = useState<IntersectionObserverEntry>();
    const frozen = entry?.isIntersecting && freezeOnceVisible;

    useEffect(() => {
        const node = ref?.current;
        if (!node || frozen) return;

        const observer = new IntersectionObserver(
            ([entry]) => setEntry(entry),
            { threshold, root, rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [ref, threshold, root, rootMargin, frozen]);

    return entry;
}

// =============================================================================
// useCopyToClipboard - Copy text to clipboard
// =============================================================================

export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            setCopied(false);
        }
    }, []);

    return [copied, copy];
}

// =============================================================================
// useKeyPress - Detect specific key presses
// =============================================================================

export function useKeyPress(targetKey: string): boolean {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {
        const downHandler = ({ key }: KeyboardEvent) => {
            if (key === targetKey) {
                setKeyPressed(true);
            }
        };

        const upHandler = ({ key }: KeyboardEvent) => {
            if (key === targetKey) {
                setKeyPressed(false);
            }
        };

        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [targetKey]);

    return keyPressed;
}

// =============================================================================
// useHotkey - Execute callback on keyboard shortcut
// =============================================================================

export function useHotkey(key: string, callback: () => void, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }): void {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const ctrlMatch = modifiers?.ctrl ? event.ctrlKey || event.metaKey : true;
            const shiftMatch = modifiers?.shift ? event.shiftKey : true;
            const altMatch = modifiers?.alt ? event.altKey : true;

            if (event.key.toLowerCase() === key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
                event.preventDefault();
                callback();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, callback, modifiers]);
}

// =============================================================================
// useDocumentTitle - Update document title
// =============================================================================

export function useDocumentTitle(title: string): void {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title;

        return () => {
            document.title = previousTitle;
        };
    }, [title]);
}

// =============================================================================
// usePagination - Handle pagination logic
// =============================================================================

interface PaginationResult {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    startIndex: number;
    endIndex: number;
    hasPrevious: boolean;
    hasNext: boolean;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setPageSize: (size: number) => void;
}

export function usePagination(totalItems: number, initialPageSize: number = 10): PaginationResult {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setCurrentPage(1);
    }, []);

    // Reset to page 1 if current page exceeds total
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return {
        currentPage,
        totalPages,
        pageSize,
        startIndex,
        endIndex,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        goToPage,
        nextPage,
        prevPage,
        setPageSize,
    };
}

// =============================================================================
// useForm - Simple form state management
// =============================================================================

interface UseFormOptions<T> {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
    onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
    const { initialValues, validate, onSubmit } = options;

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDirty = useMemo(() => {
        return JSON.stringify(values) !== JSON.stringify(initialValues);
    }, [values, initialValues]);

    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    const handleChange = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
        if (validate) {
            const newErrors = validate({ ...values, [field]: value });
            setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
        }
    }, [values, validate]);

    const handleBlur = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Validate all fields
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit?.(values);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validate, onSubmit]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        handleChange(field, value);
    }, [handleChange]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setValues,
    };
}

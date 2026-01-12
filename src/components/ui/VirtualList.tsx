import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface VirtualListProps<T> {
    items: T[];
    itemHeight: number | ((item: T, index: number) => number);
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
    containerHeight: number | string;
    overscan?: number;
    className?: string;
    onEndReached?: () => void;
    endReachedThreshold?: number;
    keyExtractor?: (item: T, index: number) => string | number;
}

interface VirtualGridProps<T> {
    items: T[];
    itemWidth: number;
    itemHeight: number;
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
    containerHeight: number | string;
    gap?: number;
    overscan?: number;
    className?: string;
    keyExtractor?: (item: T, index: number) => string | number;
}

// =============================================================================
// VIRTUAL LIST COMPONENT
// =============================================================================

export function VirtualList<T>({
    items,
    itemHeight,
    renderItem,
    containerHeight,
    overscan = 3,
    className,
    onEndReached,
    endReachedThreshold = 200,
    keyExtractor,
}: VirtualListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeightPx, setContainerHeightPx] = useState(0);

    // Calculate item heights
    const getItemHeight = useCallback(
        (index: number): number => {
            if (typeof itemHeight === 'function') {
                return itemHeight(items[index], index);
            }
            return itemHeight;
        },
        [itemHeight, items]
    );

    // Calculate cumulative heights for variable height items
    const { totalHeight, offsets } = useMemo(() => {
        const offsets: number[] = [];
        let total = 0;

        for (let i = 0; i < items.length; i++) {
            offsets.push(total);
            total += getItemHeight(i);
        }

        return { totalHeight: total, offsets };
    }, [items.length, getItemHeight]);

    // Find visible range
    const { startIndex, endIndex } = useMemo(() => {
        if (typeof itemHeight === 'number') {
            // Fixed height - simple calculation
            const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
            const end = Math.min(
                items.length - 1,
                Math.ceil((scrollTop + containerHeightPx) / itemHeight) + overscan
            );
            return { startIndex: start, endIndex: end };
        }

        // Variable height - binary search
        const findStart = () => {
            let low = 0;
            let high = offsets.length - 1;

            while (low < high) {
                const mid = Math.floor((low + high) / 2);
                if (offsets[mid] < scrollTop) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return Math.max(0, low - overscan);
        };

        const findEnd = () => {
            const targetOffset = scrollTop + containerHeightPx;
            let low = 0;
            let high = offsets.length - 1;

            while (low < high) {
                const mid = Math.floor((low + high) / 2);
                if (offsets[mid] < targetOffset) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return Math.min(items.length - 1, low + overscan);
        };

        return { startIndex: findStart(), endIndex: findEnd() };
    }, [scrollTop, containerHeightPx, itemHeight, offsets, overscan, items.length]);

    // Handle scroll
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const { scrollTop: newScrollTop, scrollHeight, clientHeight } = e.currentTarget;
            setScrollTop(newScrollTop);

            // Check for end reached
            if (onEndReached && scrollHeight - newScrollTop - clientHeight < endReachedThreshold) {
                onEndReached();
            }
        },
        [onEndReached, endReachedThreshold]
    );

    // Update container height
    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeightPx(containerRef.current.clientHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Generate visible items
    const visibleItems = useMemo(() => {
        const result: React.ReactNode[] = [];

        for (let i = startIndex; i <= endIndex && i < items.length; i++) {
            const item = items[i];
            const height = getItemHeight(i);
            const top = typeof itemHeight === 'number' ? i * itemHeight : offsets[i];

            const style: React.CSSProperties = {
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height,
            };

            const key = keyExtractor ? keyExtractor(item, i) : i;
            result.push(
                <React.Fragment key={key}>{renderItem(item, i, style)}</React.Fragment>
            );
        }

        return result;
    }, [startIndex, endIndex, items, getItemHeight, itemHeight, offsets, renderItem, keyExtractor]);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={cn('overflow-auto', className)}
            style={{ height: containerHeight }}
        >
            <div className="relative" style={{ height: totalHeight }}>
                {visibleItems}
            </div>
        </div>
    );
}

// =============================================================================
// VIRTUAL GRID COMPONENT
// =============================================================================

export function VirtualGrid<T>({
    items,
    itemWidth,
    itemHeight,
    renderItem,
    containerHeight,
    gap = 0,
    overscan = 2,
    className,
    keyExtractor,
}: VirtualGridProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // Calculate columns
    const columnsCount = useMemo(() => {
        const effectiveWidth = containerWidth - gap;
        return Math.max(1, Math.floor(effectiveWidth / (itemWidth + gap)));
    }, [containerWidth, itemWidth, gap]);

    // Calculate rows
    const rowsCount = Math.ceil(items.length / columnsCount);
    const totalHeight = rowsCount * (itemHeight + gap) - gap;

    // Find visible range
    const { startRow, endRow } = useMemo(() => {
        const rowHeight = itemHeight + gap;
        const heightPx = typeof containerHeight === 'number' ? containerHeight : 600;

        const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
        const end = Math.min(
            rowsCount - 1,
            Math.ceil((scrollTop + heightPx) / rowHeight) + overscan
        );

        return { startRow: start, endRow: end };
    }, [scrollTop, itemHeight, gap, containerHeight, overscan, rowsCount]);

    // Handle scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    // Update container width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Generate visible items
    const visibleItems = useMemo(() => {
        const result: React.ReactNode[] = [];

        for (let row = startRow; row <= endRow; row++) {
            for (let col = 0; col < columnsCount; col++) {
                const index = row * columnsCount + col;
                if (index >= items.length) break;

                const item = items[index];
                const style: React.CSSProperties = {
                    position: 'absolute',
                    top: row * (itemHeight + gap),
                    left: col * (itemWidth + gap),
                    width: itemWidth,
                    height: itemHeight,
                };

                const key = keyExtractor ? keyExtractor(item, index) : index;
                result.push(
                    <React.Fragment key={key}>{renderItem(item, index, style)}</React.Fragment>
                );
            }
        }

        return result;
    }, [startRow, endRow, columnsCount, items, itemWidth, itemHeight, gap, renderItem, keyExtractor]);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={cn('overflow-auto', className)}
            style={{ height: containerHeight }}
        >
            <div className="relative" style={{ height: totalHeight }}>
                {visibleItems}
            </div>
        </div>
    );
}

// =============================================================================
// INFINITE SCROLL HOOK
// =============================================================================

interface UseInfiniteScrollOptions {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    threshold?: number;
    rootMargin?: string;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
    const { hasMore, isLoading, onLoadMore, threshold = 0.5, rootMargin = '100px' } = options;
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    onLoadMore();
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

    return sentinelRef;
}

// =============================================================================
// INFINITE SCROLL SENTINEL COMPONENT
// =============================================================================

interface InfiniteScrollSentinelProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    loadingComponent?: React.ReactNode;
    endComponent?: React.ReactNode;
    className?: string;
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
    hasMore,
    isLoading,
    onLoadMore,
    loadingComponent,
    endComponent,
    className,
}) => {
    const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

    return (
        <div ref={sentinelRef} className={cn('py-4 text-center', className)}>
            {isLoading && (
                loadingComponent || (
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        <span className="text-sm">Loading more...</span>
                    </div>
                )
            )}
            {!hasMore && !isLoading && (
                endComponent || (
                    <p className="text-sm text-slate-500">No more items to load</p>
                )
            )}
        </div>
    );
};

export default VirtualList;

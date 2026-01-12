import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// =============================================================================
// PULL TO REFRESH HOOK
// =============================================================================

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    disabled?: boolean;
}

export function usePullToRefresh(options: UsePullToRefreshOptions) {
    const { onRefresh, threshold = 80, disabled = false } = options;
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing) return;

        const scrollTop = containerRef.current?.scrollTop || window.scrollY;
        if (scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, (currentY - startY.current) * 0.5); // 0.5 resistance
        setPullDistance(Math.min(distance, threshold * 1.5));

        if (distance > 10) {
            e.preventDefault();
        }
    }, [isPulling, disabled, isRefreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling || disabled) return;

        setIsPulling(false);

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(threshold);

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, disabled]);

    useEffect(() => {
        const container = containerRef.current || document;

        container.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
        container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
        container.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart as EventListener);
            container.removeEventListener('touchmove', handleTouchMove as EventListener);
            container.removeEventListener('touchend', handleTouchEnd as EventListener);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        pullProgress: Math.min(pullDistance / threshold, 1),
    };
}

// =============================================================================
// PULL TO REFRESH COMPONENT
// =============================================================================

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    disabled?: boolean;
    threshold?: number;
    className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    children,
    onRefresh,
    disabled = false,
    threshold = 80,
    className,
}) => {
    const {
        containerRef,
        isRefreshing,
        pullDistance,
        pullProgress,
    } = usePullToRefresh({ onRefresh, threshold, disabled });

    return (
        <div ref={containerRef} className={cn('relative overflow-auto', className)}>
            {/* Pull indicator */}
            <div
                className={cn(
                    'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform',
                    'w-10 h-10 bg-white/10 rounded-full backdrop-blur-sm'
                )}
                style={{
                    top: -40,
                    transform: `translateX(-50%) translateY(${pullDistance}px)`,
                    opacity: pullProgress,
                }}
            >
                <Loader2
                    className={cn(
                        'w-5 h-5 text-cyan-400',
                        isRefreshing && 'animate-spin'
                    )}
                    style={{
                        transform: isRefreshing ? '' : `rotate(${pullProgress * 180}deg)`,
                    }}
                />
            </div>

            {/* Content with transform */}
            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
};

// =============================================================================
// SWIPE HANDLER HOOK
// =============================================================================

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeOptions {
    onSwipe: (direction: SwipeDirection) => void;
    threshold?: number;
    preventDefault?: boolean;
}

export function useSwipe(options: UseSwipeOptions) {
    const { onSwipe, threshold = 50, preventDefault = false } = options;
    const startX = useRef(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX.current;
        const deltaY = endY - startY.current;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) < threshold) return;

        if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
                onSwipe('right');
            } else {
                onSwipe('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                onSwipe('down');
            } else {
                onSwipe('up');
            }
        }
    }, [onSwipe, threshold]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (preventDefault) {
            e.preventDefault();
        }
    }, [preventDefault]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

    return containerRef;
}

// =============================================================================
// SWIPEABLE LIST ITEM
// =============================================================================

interface SwipeableItemAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    color: string;
    backgroundColor: string;
}

interface SwipeableItemProps {
    children: React.ReactNode;
    leftActions?: SwipeableItemAction[];
    rightActions?: SwipeableItemAction[];
    onAction: (actionId: string) => void;
    threshold?: number;
    className?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    leftActions = [],
    rightActions = [],
    onAction,
    threshold = 80,
    className,
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const delta = currentX - startX.current;

        // Apply bounds
        const maxRight = leftActions.length > 0 ? threshold * leftActions.length : 0;
        const maxLeft = rightActions.length > 0 ? -threshold * rightActions.length : 0;

        setTranslateX(Math.max(maxLeft, Math.min(maxRight, delta)));
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        if (Math.abs(translateX) >= threshold) {
            if (translateX > 0 && leftActions.length > 0) {
                onAction(leftActions[0].id);
            } else if (translateX < 0 && rightActions.length > 0) {
                onAction(rightActions[rightActions.length - 1].id);
            }
        }

        setTranslateX(0);
    };

    return (
        <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
            {/* Left actions */}
            {leftActions.length > 0 && (
                <div className="absolute inset-y-0 left-0 flex">
                    {leftActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => onAction(action.id)}
                            className={cn(
                                'flex items-center justify-center px-4',
                                action.backgroundColor
                            )}
                            style={{ width: threshold }}
                        >
                            {action.icon && <span className={action.color}>{action.icon}</span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Right actions */}
            {rightActions.length > 0 && (
                <div className="absolute inset-y-0 right-0 flex">
                    {rightActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => onAction(action.id)}
                            className={cn(
                                'flex items-center justify-center px-4',
                                action.backgroundColor
                            )}
                            style={{ width: threshold }}
                        >
                            {action.icon && <span className={action.color}>{action.icon}</span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Main content */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative bg-[#131b24]"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
};

// =============================================================================
// TOUCH RIPPLE EFFECT
// =============================================================================

interface TouchRippleProps {
    children: React.ReactNode;
    disabled?: boolean;
    color?: string;
    className?: string;
}

export const TouchRipple: React.FC<TouchRippleProps> = ({
    children,
    disabled = false,
    color = 'rgba(255, 255, 255, 0.2)',
    className,
}) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const addRipple = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
    };

    return (
        <div
            ref={containerRef}
            onMouseDown={addRipple}
            onTouchStart={addRipple}
            className={cn('relative overflow-hidden', className)}
        >
            {children}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none animate-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        backgroundColor: color,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </div>
    );
};

export default PullToRefresh;

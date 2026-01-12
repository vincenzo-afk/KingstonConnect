import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    snapPoints?: number[]; // Percentages: [0.25, 0.5, 0.9]
    defaultSnap?: number;
    dismissible?: boolean;
    showHandle?: boolean;
    className?: string;
}

// =============================================================================
// BOTTOM SHEET COMPONENT
// =============================================================================

export const BottomSheet: React.FC<BottomSheetProps> = ({
    open,
    onClose,
    children,
    title,
    description,
    snapPoints = [0.5, 0.9],
    defaultSnap = 0,
    dismissible = true,
    showHandle = true,
    className,
}) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [, setCurrentSnap] = useState(defaultSnap);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [currentHeight, setCurrentHeight] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Calculate height from snap point
    const getHeightFromSnap = useCallback((snapIndex: number) => {
        return window.innerHeight * snapPoints[snapIndex];
    }, [snapPoints]);

    // Initialize height when opened
    useEffect(() => {
        if (open) {
            setIsAnimating(true);
            setCurrentHeight(getHeightFromSnap(defaultSnap));
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [open, defaultSnap, getHeightFromSnap]);

    // Handle escape key
    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dismissible) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose, dismissible]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Handle drag start
    const handleDragStart = useCallback((clientY: number) => {
        setIsDragging(true);
        setDragStart(clientY);
    }, []);

    // Handle drag move
    const handleDragMove = useCallback((clientY: number) => {
        if (!isDragging) return;

        const delta = dragStart - clientY;
        const newHeight = Math.max(100, Math.min(window.innerHeight * 0.95, currentHeight + delta));
        setCurrentHeight(newHeight);
        setDragStart(clientY);
    }, [isDragging, dragStart, currentHeight]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        if (!isDragging) return;

        setIsDragging(false);
        setIsAnimating(true);

        // Find closest snap point
        const currentPercent = currentHeight / window.innerHeight;
        let closestSnap = 0;
        let minDiff = Math.abs(currentPercent - snapPoints[0]);

        snapPoints.forEach((snap, index) => {
            const diff = Math.abs(currentPercent - snap);
            if (diff < minDiff) {
                minDiff = diff;
                closestSnap = index;
            }
        });

        // Dismiss if dragged below minimum
        if (currentPercent < snapPoints[0] * 0.5 && dismissible) {
            onClose();
        } else {
            setCurrentSnap(closestSnap);
            setCurrentHeight(getHeightFromSnap(closestSnap));
        }

        setTimeout(() => setIsAnimating(false), 300);
    }, [isDragging, currentHeight, snapPoints, dismissible, onClose, getHeightFromSnap]);

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    // Mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        handleDragStart(e.clientY);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            handleDragMove(e.clientY);
        };

        const handleMouseUp = () => {
            handleDragEnd();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
                    isAnimating ? 'duration-300' : ''
                )}
                onClick={dismissible ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'sheet-title' : undefined}
                className={cn(
                    'absolute bottom-0 left-0 right-0 bg-[#131b24] border-t border-white/10 rounded-t-3xl',
                    'flex flex-col overflow-hidden',
                    isAnimating && 'transition-all duration-300 ease-out',
                    className
                )}
                style={{ height: currentHeight }}
            >
                {/* Handle */}
                {showHandle && (
                    <div
                        className="flex-shrink-0 flex items-center justify-center py-4 cursor-grab active:cursor-grabbing"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                    </div>
                )}

                {/* Header */}
                {(title || description) && (
                    <div className="flex-shrink-0 px-6 pb-4 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            {title && (
                                <h2 id="sheet-title" className="text-lg font-semibold text-white">
                                    {title}
                                </h2>
                            )}
                            {dismissible && (
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {description && (
                            <p className="mt-1 text-sm text-slate-400">{description}</p>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

// =============================================================================
// ACTION SHEET (Specialized Bottom Sheet)
// =============================================================================

export interface ActionSheetAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    destructive?: boolean;
    disabled?: boolean;
}

interface ActionSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    actions: ActionSheetAction[];
    onAction: (action: ActionSheetAction) => void;
    cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
    open,
    onClose,
    title,
    actions,
    onAction,
    cancelLabel = 'Cancel',
}) => {
    const handleAction = (action: ActionSheetAction) => {
        if (!action.disabled) {
            onAction(action);
            onClose();
        }
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            snapPoints={[0.4]}
            defaultSnap={0}
            showHandle={false}
        >
            <div className="p-4">
                {title && (
                    <p className="text-center text-sm text-slate-400 mb-4">{title}</p>
                )}

                <div className="space-y-1">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action)}
                            disabled={action.disabled}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                                action.disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : action.destructive
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : 'text-white hover:bg-white/5'
                            )}
                        >
                            {action.icon && (
                                <span className="flex-shrink-0">{action.icon}</span>
                            )}
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                    {cancelLabel}
                </button>
            </div>
        </BottomSheet>
    );
};

export default BottomSheet;

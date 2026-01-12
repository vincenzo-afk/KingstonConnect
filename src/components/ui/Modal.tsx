import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
    closeOnOverlay?: boolean;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showClose = true,
    closeOnOverlay = true,
    footer,
}) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        full: 'max-w-[90vw] max-h-[90vh]',
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={closeOnOverlay ? onClose : undefined}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full bg-[#0d1419] border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 animate-scale-in',
                    sizes[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {(title || showClose) && (
                    <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
                        <div>
                            {title && (
                                <h2 id="modal-title" className="text-lg font-semibold text-white">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-cyan-200/60 mt-1">{description}</p>
                            )}
                        </div>
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-cyan-300/60 hover:text-white hover:bg-cyan-500/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-cyan-500/20">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

// Confirm Dialog
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
            <div className="text-center">
                <div
                    className={cn(
                        'w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center',
                        variant === 'danger' && 'bg-[#0369A1]/20 text-[#0369A1]',
                        variant === 'warning' && 'bg-[#36B7D9]/20 text-[#36B7D9]',
                        variant === 'info' && 'bg-cyan-500/20 text-cyan-400'
                    )}
                >
                    {variant === 'danger' && '⚠️'}
                    {variant === 'warning' && '⚡'}
                    {variant === 'info' && 'ℹ️'}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-cyan-200/60">{message}</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
                <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    className="flex-1"
                    loading={loading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for catching and displaying errors gracefully
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo });

        // Log error to console in development
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = (): void => {
        window.location.href = '/dashboard';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <Card variant="glass" className="max-w-lg w-full p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-slate-400 mb-6">
                            We encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
                        </p>

                        {/* Error details (development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400 flex items-center gap-2">
                                    <Bug className="w-4 h-4" />
                                    Show error details
                                </summary>
                                <div className="mt-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl overflow-auto max-h-48">
                                    <p className="text-sm font-mono text-red-400 mb-2">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo?.componentStack && (
                                        <pre className="text-xs text-slate-500 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="secondary"
                                onClick={this.handleGoHome}
                                icon={<Home className="w-4 h-4" />}
                            >
                                Go Home
                            </Button>
                            <Button
                                glow
                                onClick={this.handleRetry}
                                icon={<RefreshCw className="w-4 h-4" />}
                            >
                                Try Again
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Page-level Error Boundary with full screen display
 */
export class PageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo });
        console.error('Page Error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = '/dashboard';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center p-6">
                    <div className="text-center max-w-lg">
                        {/* Animated error icon */}
                        <div className="relative mx-auto w-32 h-32 mb-8">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-12 h-12 text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Oops! Page Error
                        </h1>

                        <p className="text-xl text-slate-400 mb-8">
                            The page couldn't load properly. This might be a temporary issue.
                        </p>

                        {/* Error message */}
                        {this.state.error && (
                            <div className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <p className="text-sm text-red-400 font-mono">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={this.handleGoHome}
                                icon={<Home className="w-5 h-5" />}
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                glow
                                size="lg"
                                onClick={this.handleRetry}
                                icon={<RefreshCw className="w-5 h-5" />}
                            >
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Inline error display for smaller components
 */
interface InlineErrorProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
    message,
    onRetry,
    className,
}) => {
    return (
        <div className={`flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl ${className}`}>
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300 flex-1">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4 text-red-400" />
                </button>
            )}
        </div>
    );
};

/**
 * Empty state component for when no data is available
 */
interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    action,
    className,
}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            {icon && (
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-slate-400 max-w-sm mx-auto mb-6">{description}</p>
            )}
            {action && (
                <Button glow onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};

export default ErrorBoundary;

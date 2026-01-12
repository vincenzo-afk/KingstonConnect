/**
 * UI Components Barrel Export
 * Re-exports all UI components for convenient importing
 */

// Core UI Components
export { Avatar, AvatarGroup } from './Avatar';
export { Badge, RoleBadge, CounterBadge } from './Badge';
export { Button } from './Button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard } from './Card';
export { Input, Textarea, Select } from './Input';
export { Modal, ConfirmDialog } from './Modal';

// Navigation & Selection
export { Dropdown, DropdownMenu, SelectDropdown } from './Dropdown';
export { Tabs, TabList, TabTrigger, TabContent, SimpleTabs } from './Tabs';

// Data Display
export { DataTable } from './DataTable';
export { VirtualList, VirtualGrid, InfiniteScrollSentinel, useInfiniteScroll } from './VirtualList';
export {
    Skeleton,
    SkeletonCard,
    SkeletonTableRow,
    SkeletonListItem,
    SkeletonStatCard,
    SkeletonText,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonInput,
    SkeletonDashboard,
    SkeletonChat,
    SkeletonProfile
} from './Skeleton';

// Feedback & Notifications
export { NotificationCenter, useNotifications } from './NotificationCenter';
export { ErrorBoundary, PageErrorBoundary, InlineError, EmptyState } from './ErrorBoundary';

// Accessibility
export {
    FocusTrap,
    useFocusTrap,
    VisuallyHidden,
    SkipLink,
    LiveRegion,
    useAnnounce,
    useRovingTabindex,
    getFocusableElements,
    useId,
    mergeRefs,
    usePrefersReducedMotion,
} from './Accessibility';

// Mobile Components
export { BottomSheet, ActionSheet } from './BottomSheet';
export {
    PullToRefresh,
    usePullToRefresh,
    useSwipe,
    SwipeableItem,
    TouchRipple,
} from './MobileGestures';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UserRole } from '@/types';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
    const d = new Date(date);

    if (format === 'relative') {
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
    }

    if (format === 'long') {
        return d.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Format time
export function formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// Get grade from percentage
export function getGrade(percentage: number): string {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B+';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    return 'F';
}

// Get grade color
export function getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
        'O': 'text-emerald-400',
        'A+': 'text-green-400',
        'A': 'text-teal-400',
        'B+': 'text-blue-400',
        'B': 'text-indigo-400',
        'C': 'text-amber-400',
        'F': 'text-red-400',
    };
    return colors[grade] || 'text-gray-400';
}

// Get attendance status color
export function getAttendanceColor(status: string): string {
    const colors: Record<string, string> = {
        'present': 'bg-emerald-500',
        'absent': 'bg-red-500',
        'late': 'bg-amber-500',
        'excused': 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-500';
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
    const names: Record<UserRole, string> = {
        principal: 'Principal',
        hod: 'Head of Department',
        teacher: 'Teacher',
        student: 'Student',
    };
    return names[role];
}

// Get role badge color
export function getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
        principal: 'bg-amber-500/20 text-amber-400',
        hod: 'bg-purple-500/20 text-purple-400',
        teacher: 'bg-emerald-500/20 text-emerald-400',
        student: 'bg-indigo-500/20 text-indigo-400',
    };
    return classes[role];
}

// Truncate text
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Generate random ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// Validate register number format (e.g., KIT192001)
export function isValidRegisterNo(registerNo: string): boolean {
    const pattern = /^[A-Z]{2,4}\d{6,8}$/;
    return pattern.test(registerNo);
}

// Validate email
export function isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

// Validate phone (Indian format)
export function isValidPhone(phone: string): boolean {
    const pattern = /^[6-9]\d{9}$/;
    return pattern.test(phone.replace(/\D/g, ''));
}

// Format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file icon based on type
export function getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'video';
    if (fileType.includes('audio')) return 'music';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'table';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'presentation';
    return 'file';
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if date is today
export function isToday(date: string | Date): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

// Get days in month
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {} as Record<string, T[]>);
}

// Sort array by key
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

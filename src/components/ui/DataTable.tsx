import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

// =============================================================================
// TYPES
// =============================================================================

export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    searchable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    loading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    sortable?: boolean;
    paginated?: boolean;
    pageSize?: number;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    selectedRows?: T[];
    onSelectionChange?: (selected: T[]) => void;
    className?: string;
    stickyHeader?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

// =============================================================================
// DATA TABLE COMPONENT
// =============================================================================

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    keyField,
    loading = false,
    searchable = true,
    searchPlaceholder = 'Search...',
    sortable = true,
    paginated = true,
    pageSize: initialPageSize = 10,
    emptyMessage = 'No data available',
    onRowClick,
    selectedRows,
    onSelectionChange,
    className,
    stickyHeader = false,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(initialPageSize);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;

        const query = searchQuery.toLowerCase();
        const searchableColumns = columns.filter(col => col.searchable !== false);

        return data.filter(row => {
            return searchableColumns.some(col => {
                const value = row[col.key as keyof T];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [data, searchQuery, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn as keyof T];
            const bValue = b[sortColumn as keyof T];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (aValue && typeof aValue === 'object' && 'getTime' in aValue && bValue && typeof bValue === 'object' && 'getTime' in bValue) {
                comparison = (aValue as Date).getTime() - (bValue as Date).getTime();
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!paginated) return sortedData;

        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, paginated]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Handle sort
    const handleSort = (columnKey: string) => {
        if (!sortable) return;

        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return;

        if (sortColumn !== columnKey) {
            setSortColumn(columnKey);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else if (sortDirection === 'desc') {
            setSortColumn(null);
            setSortDirection(null);
        }
    };

    // Handle selection
    const isSelected = (row: T) => {
        if (!selectedRows) return false;
        return selectedRows.some(selected => selected[keyField] === row[keyField]);
    };

    const toggleSelection = (row: T) => {
        if (!onSelectionChange || !selectedRows) return;

        if (isSelected(row)) {
            onSelectionChange(selectedRows.filter(selected => selected[keyField] !== row[keyField]));
        } else {
            onSelectionChange([...selectedRows, row]);
        }
    };

    const toggleSelectAll = () => {
        if (!onSelectionChange) return;

        if (selectedRows?.length === paginatedData.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange([...paginatedData]);
        }
    };

    // Render sort icon
    const renderSortIcon = (columnKey: string) => {
        if (sortColumn !== columnKey) {
            return <ChevronsUpDown className="w-4 h-4 text-slate-600" />;
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="w-4 h-4 text-cyan-400" />;
        }
        return <ChevronDown className="w-4 h-4 text-cyan-400" />;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className={cn('bg-white/5 border border-white/5 rounded-2xl overflow-hidden', className)}>
                {searchable && (
                    <div className="p-4 border-b border-white/5">
                        <Skeleton className="h-10 w-64 rounded-lg" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {columns.map((_, i) => (
                                    <th key={i} className="p-4 text-left">
                                        <Skeleton className="h-4 w-20" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-white/5">
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="p-4">
                                            <Skeleton className="h-4 w-3/4" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('bg-white/5 border border-white/5 rounded-2xl overflow-hidden', className)}>
            {/* Header with search */}
            {searchable && (
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            icon={<Search className="w-4 h-4" />}
                            className="bg-white/5"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={cn(
                        'bg-white/5',
                        stickyHeader && 'sticky top-0 z-10'
                    )}>
                        <tr className="border-b border-white/5">
                            {/* Selection checkbox */}
                            {onSelectionChange && (
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows?.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                                    />
                                </th>
                            )}
                            {/* Column headers */}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={cn(
                                        'p-4 text-left text-sm font-medium text-slate-400',
                                        column.sortable && sortable && 'cursor-pointer hover:text-white transition-colors',
                                        column.width
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className={cn(
                                        'flex items-center gap-2',
                                        column.align === 'center' && 'justify-center',
                                        column.align === 'right' && 'justify-end'
                                    )}>
                                        {column.header}
                                        {column.sortable && sortable && renderSortIcon(String(column.key))}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                                    className="p-12 text-center text-slate-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={String(row[keyField])}
                                    className={cn(
                                        'border-b border-white/5 transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-white/5',
                                        isSelected(row) && 'bg-cyan-500/10'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {/* Selection checkbox */}
                                    {onSelectionChange && (
                                        <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected(row)}
                                                onChange={() => toggleSelection(row)}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                                            />
                                        </td>
                                    )}
                                    {/* Data cells */}
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={cn(
                                                'p-4 text-sm text-slate-200',
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right'
                                            )}
                                        >
                                            {column.render
                                                ? column.render(row[column.key as keyof T], row, rowIndex)
                                                : String(row[column.key as keyof T] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginated && totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                    <div className="text-sm text-slate-500">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
                        {sortedData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft className="w-4 h-4" />}
                        />
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                                            currentPage === pageNum
                                                ? 'bg-cyan-500 text-white'
                                                : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            icon={<ChevronRight className="w-4 h-4" />}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  id?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage = 'No records found matching your filters.',
  pagination,
  id,
  className = ''
}: DataTableProps<T>) {
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
    : 1;

  return (
    <div id={id} className={`w-full flex flex-col bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 select-none">
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    className={`py-3 px-4 font-semibold uppercase tracking-wider text-[11px] ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:text-slate-200 hover:bg-slate-800/40' : ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-500">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="bg-slate-900/40">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-td-${cIdx}`} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    <p className="text-xs text-slate-600 mt-1">Try broadening your search query or reset active filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`transition-colors ${
                      onRowClick ? 'hover:bg-slate-800/50 cursor-pointer' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    {columns.map((col) => {
                      return (
                        <td
                          key={`${key}-${col.key}`}
                          className={`py-3 px-4 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {col.render
                            ? col.render(item, index)
                            : String((item as Record<string, unknown>)[col.key] ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="font-mono">
            Showing{' '}
            <span className="text-slate-200 font-semibold">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="text-slate-200 font-semibold">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            of <span className="text-slate-200 font-semibold">{pagination.totalItems}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-1.5 rounded border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-slate-300">
              Page {pagination.currentPage} of {totalPages}
            </span>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages}
              className="p-1.5 rounded border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

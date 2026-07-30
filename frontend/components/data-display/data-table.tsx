"use client";
import { TableSkeleton } from "@/components/feedback/loading-skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  keyExtractor: (row: T) => string;
  /** Accessible name for the table, exposed to screen readers via a visually-hidden <caption>. Falls back to emptyTitle/"Data table" if omitted. */
  caption?: string;
  pagination?: {
    hasNext: boolean;
    hasPrev: boolean;
    onNext: () => void;
    onPrev: () => void;
  };
}

export function DataTable<T>({
  columns, data, isLoading, emptyTitle, emptyDescription, keyExtractor, caption, pagination,
}: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton rows={4} cols={columns.length} />;
  if (data.length === 0) return <EmptyState title={emptyTitle ?? "No data"} description={emptyDescription} />;
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption ?? emptyTitle ?? "Data table"}</caption>
        <thead>
          <tr className="border-b border-graphite/10">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cn("text-left py-2 px-3 font-medium opacity-50 text-xs uppercase tracking-wider", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-graphite/5 hover:bg-graphite/[0.02]">
              {columns.map((col) => (
                <td key={col.key} className={cn("py-2.5 px-3", col.className)}>{col.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <Button variant="secondary" size="sm" onClick={pagination.onPrev} disabled={!pagination.hasPrev}>Previous</Button>
          <Button variant="secondary" size="sm" onClick={pagination.onNext} disabled={!pagination.hasNext}>Next</Button>
        </div>
      )}
    </div>
  );
}

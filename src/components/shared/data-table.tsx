import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from './loading-skeletons';
import { EmptyState } from './empty-state';
import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display in this list.',
  emptyIcon,
  emptyAction,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900/10 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <TableRow className="hover:bg-transparent">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className={col.className || 'text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5 px-4'}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-800/60">
          {data.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-slate-100 dark:bg-slate-900/10 bg-slate-50 dark:bg-slate-950/10"
            >
              {columns.map((col, colIndex) => {
                const cellContent = col.render
                  ? col.render(row)
                  : col.accessorKey
                  ? (row[col.accessorKey as keyof T] as ReactNode)
                  : null;

                return (
                  <TableCell
                    key={colIndex}
                    className="text-slate-700 dark:text-slate-300 text-sm py-3.5 px-4 font-medium"
                  >
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

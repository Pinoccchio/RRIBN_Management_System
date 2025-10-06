import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  const formatCellValue = (column: TableColumn, row: any) => {
    const value = row[column.key];

    // Use custom formatter if provided
    if (column.format) {
      return column.format(value, row);
    }

    // Auto-format dates
    if (value instanceof Date) {
      return format(value, 'MMM dd, yyyy');
    }

    // Auto-format ISO date strings
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return format(new Date(value), 'MMM dd, yyyy');
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return '-';
    }

    return value;
  };

  if (loading) {
    return (
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-200">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {formatCellValue(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {data.length} {data.length === 1 ? 'record' : 'records'}
        </p>
      </div>
    </Card>
  );
};

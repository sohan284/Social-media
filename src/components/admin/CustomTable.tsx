"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  cellClassName?: string;
  onRowClick?: (row: T, index: number) => void;
}

export function CustomTable<T extends { id?: string | number } | Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data available",
  className = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  onRowClick,
}: CustomTableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof row === "object" && row !== null) {
      if ("id" in row) {
        const id = (row as { id?: string | number }).id;
        if (id !== undefined && id !== null) {
          return id;
        }
      }
    }
    return index;
  };

  const getRowClassName = (row: T, index: number): string => {
    const baseClass = "border-t border-white/10 hover:bg-white/10 transition";
    const customClass =
      typeof rowClassName === "function"
        ? rowClassName(row, index)
        : rowClassName;
    const clickableClass = onRowClick ? "cursor-pointer" : "";
    return `${baseClass} ${customClass} ${clickableClass}`.trim();
  };

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-white/20 ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className={`bg-white/10 text-left ${headerClassName}`}>
            {columns.map((column, index) => (
              <TableHead key={index} className={`px-4 text-white py-3 ${column.className || ""}`}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-white/60"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={getRowKey(row, rowIndex)}
                className={getRowClassName(row, rowIndex)}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`px-4 py-3 ${cellClassName} ${column.className || ""}`.trim()}
                  >
                    {column.accessor(row, rowIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


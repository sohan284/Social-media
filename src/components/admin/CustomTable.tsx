"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, AlertCircle, Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  cellClassName?: string;
  onRowClick?: (row: T, index: number) => void;
  disablePagination?: boolean;
  maxHeight?: string;
  enableScroll?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function CustomTable<T extends { id?: string | number } | Record<string, unknown>>({
  columns,
  data,
  title,
  emptyMessage = "No data available",
  emptyIcon,
  isError = false,
  errorMessage = "Failed to load data. Please try again later.",
  className = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  onRowClick,
  disablePagination = false,
  maxHeight = "80vh",
  enableScroll = false,
}: CustomTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  }, [data.length]);

  // Reset to page 1 if current page is out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Get paginated data - if pagination is disabled, show all data
  const paginatedData = useMemo(() => {
    if (disablePagination) {
      return data;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, disablePagination]);

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

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display (show up to 5 page numbers)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Show first 3 pages, ellipsis, last page
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, last 3 pages
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div 
      className={`w-[88vw] lg:w-full rounded-2xl border bg-black/30 backdrop-blur-sm border-white/20 flex flex-col ${className}`}
      style={enableScroll ? { maxHeight } : {}}
    >
      {title && (
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-center text-white">{title}</h2>
        </div>
      )}
      <div 
        className={`relative w-full ${enableScroll ? 'overflow-hidden flex flex-col' : ''}`}
        style={enableScroll ? { maxHeight: `calc(${maxHeight} - ${title ? '120px' : '0px'})` } : {}}
      >
        <div className={enableScroll ? 'overflow-y-auto flex-1' : ''}>
          <Table className="min-w-max">
            <TableHeader className={enableScroll ? 'sticky top-0 z-10 bg-black/30 backdrop-blur-sm' : ''}>
              <TableRow className={`bg-white/10 text-left ${headerClassName}`}>
                {columns.map((column, index) => (
                  <TableHead key={index} className={`px-4 text-white py-3 ${column.className || ""}`}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
            {isError ? (
              // Error State
              <TableRow className="hover:!bg-transparent cursor-default">
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                  style={{ height: `${ITEMS_PER_PAGE * 60}px` }}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 text-lg font-medium mb-1">
                        Error Loading Data
                      </p>
                      <p className="text-white/60 text-sm">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              // Empty State
              <TableRow className="hover:!bg-transparent cursor-default">
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                  style={{ height: `${ITEMS_PER_PAGE * 60}px` }}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {emptyIcon || (
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-white/40" />
                      </div>
                    )}
                    <div>
                      <p className="text-white/80 text-lg font-medium mb-1">
                        {emptyMessage}
                      </p>
                      <p className="text-white/40 text-sm">
                        No data available to display
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Render paginated rows */}
                {paginatedData.map((row, rowIndex) => {
                  const originalIndex = (currentPage - 1) * ITEMS_PER_PAGE + rowIndex;
                  return (
                    <TableRow
                      key={getRowKey(row, originalIndex)}
                      className={getRowClassName(row, originalIndex)}
                      onClick={() => onRowClick?.(row, originalIndex)}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`px-4 py-3 ${cellClassName} ${column.className || ""}`.trim()}
                        >
                          {column.accessor(row, originalIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {/* Fill remaining rows to maintain consistent height */}
                {paginatedData.length < ITEMS_PER_PAGE && (
                  Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }).map((_, emptyIndex) => (
                    <TableRow key={`empty-${emptyIndex}`} className="border-t border-white/10">
                      {columns.map((_, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`px-4 py-3 ${cellClassName}`.trim()}
                        >
                          <span className="invisible">-</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </>
            )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - Always show if there's data and pagination is enabled */}
      {!disablePagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
          <div className="text-sm text-white/60">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-white/60">
                      ...
                    </span>
                  );
                }
                const pageNum = page as number;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      currentPage === pageNum
                        ? "bg-[#6B83FA] text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


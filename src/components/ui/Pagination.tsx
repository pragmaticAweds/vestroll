"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { ChevronRightIcon } from "../../../public/svg";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showInfo?: boolean;
  showResultsPerPage?: boolean;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  resultsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  showInfo = true,
  showResultsPerPage = false,
  onItemsPerPageChange,
  resultsPerPageOptions = [10, 25, 50, 100],
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first 5 pages with ellipsis at the end
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages with ellipsis at the beginning
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        // Show current page and surrounding pages
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
        );
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
      {showInfo && totalItems !== undefined && (
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      )}

      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`size-9 flex items-center justify-center rounded-full border border-[#5E2A8C]  text-xs sm:text-sm font-medium  transition-colors ${
            currentPage === 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#E8E5FA] hover:bg-[#E8E5FA]/80 text-[#5E2A8C]"
          }`}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          const isCurrentPage = page === currentPage;
          const isEllipsis =
            page !== currentPage &&
            index > 0 &&
            pageNumbers[index - 1] !== page - 1;

          if (isEllipsis) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 sm:px-3 sm:py-2 text-gray-500 text-xs sm:text-sm"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                isCurrentPage
                  ? "text-purple-600 "
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`size-9 flex items-center justify-center rounded-full border border-[#5E2A8C]  text-xs sm:text-sm font-medium  transition-colors ${
            currentPage === totalPages
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#E8E5FA] hover:bg-[#E8E5FA]/80 text-[#5E2A8C]"
          }`}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {showResultsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Results per page</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {resultsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Pagination;

"use client";

import React from "react";
import Link from "next/link";
import { FilterIcon, ChevronRightIcon } from "@/../public/svg";

interface TableFilterHeaderProps {
  selectedTab: string;
  search: string;
  setSearch: (value: string) => void;
  showModal: () => void;
  searchPlaceholder?: string;
  showFilterButton?: boolean;
  showTabLabel?: boolean;
  showSearch?: boolean;
  seeAllHref?: string;
  SearchIcon?: React.ComponentType;
  FilterIcon?: React.ComponentType;
  children?: React.ReactNode;
}

const TableFilterHeader: React.FC<TableFilterHeaderProps> = ({
  selectedTab,
  search,
  setSearch,
  showModal,
  searchPlaceholder = "Search by name...",
  showFilterButton = true,
  showTabLabel = true,
  showSearch = true,
  seeAllHref,
  SearchIcon,
  children,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {showTabLabel && (
        <p className="font-semibold text-text-header dark:text-gray-100">
          {selectedTab}
        </p>
      )}
      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="flex items-center gap-1 md:max-w-85">
            <div className="flex justify-between items-center w-full px-4 py-2 bg-white border rounded-lg border-border-primary h-9 dark:bg-gray-900 dark:border-gray-800">
              <input
                type="search"
                className="w-full text-xs text-gray-400 outline-none bg-transparent"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {SearchIcon && <SearchIcon />}
            </div>
            {showFilterButton && (
              <button
                onClick={showModal}
                className="flex items-center justify-center bg-white border rounded-lg cursor-pointer w-9 h-9 border-primary-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              >
                <FilterIcon />
              </button>
            )}
          </div>
        )}
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            See all
            <ChevronRightIcon />
          </Link>
        )}
        {children}
      </div>
    </div>
  );
};

export default TableFilterHeader;

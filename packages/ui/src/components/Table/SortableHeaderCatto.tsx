// @ccatto/ui - SortableHeaderCatto Component
// Performance: Memoized to prevent re-renders when other columns change
"use client";

import React, { memo, useCallback, useState } from "react";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { cn } from "../../utils";

export interface SortableHeaderCattoProps<TData> {
  column: Column<TData, unknown>;
  title: string;
  enableSorting?: boolean;
  /** Optional tooltip text shown on hover */
  tooltip?: string;
}

function SortableHeaderCattoInner<TData>({
  column,
  title,
  enableSorting = true,
  tooltip,
}: SortableHeaderCattoProps<TData>) {
  const handleSort = useCallback(() => {
    column.toggleSorting(column.getIsSorted() === "asc");
  }, [column]);

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleSort}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-semibold transition-colors duration-200",
          // Text color - orange on hover, inherit otherwise
          "text-inherit hover:text-theme-secondary",
          // No background change - stays transparent
          "bg-transparent",
          // Focus ring for accessibility
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-secondary",
          // Dotted underline hint when tooltip exists
          tooltip &&
            "decoration-dotted underline underline-offset-4 decoration-gray-400 dark:decoration-gray-500"
        )}
      >
        {title}
        {enableSorting && <ArrowUpDown className="h-4 w-4" />}
      </button>
      {showTooltip && tooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-normal text-gray-100 shadow-lg dark:bg-gray-700 pointer-events-none">
          {tooltip}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

// Memoize with custom comparison for column object
export const SortableHeaderCatto = memo(
  SortableHeaderCattoInner
) as typeof SortableHeaderCattoInner;

export default SortableHeaderCatto;

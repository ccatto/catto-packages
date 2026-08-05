// @ccatto/ui - PaginationCatto
// Numbered prev/next pager for the classic page-based style. Data-agnostic:
// it emits the target page (0-based); the consumer maps page -> skip/take.
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils";

export interface PaginationCattoProps {
  /** Current page (0-based). */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the target page (0-based). */
  onPageChange: (page: number) => void;
  /** Max numbered buttons to show around the current page (default: 5). */
  siblingCount?: number;
  /** Accessible name for the nav landmark (default: "Pagination"). */
  ariaLabel?: string;
  className?: string;
  "data-testid"?: string;
}

/** Inclusive integer range [start, end]. */
function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * PaginationCatto — numbered pager with prev/next arrows. Renders nothing when
 * there is a single page or fewer.
 *
 * @example
 * <PaginationCatto page={page} pageCount={pageCount} onPageChange={setPage} />
 */
export const PaginationCatto: React.FC<PaginationCattoProps> = ({
  page,
  pageCount,
  onPageChange,
  siblingCount = 5,
  ariaLabel = "Pagination",
  className,
  "data-testid": testId,
}) => {
  if (pageCount <= 1) return null;

  // Window of page numbers centered on the current page.
  const half = Math.floor(siblingCount / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(pageCount - 1, start + siblingCount - 1);
  start = Math.max(0, end - siblingCount + 1);
  const pages = range(start, end);

  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  const arrowCls = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md border",
    "border-gray-300 bg-white text-gray-700",
    "hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
  );

  return (
    <nav
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        className={arrowCls}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => {
        const isCurrent = p === page;
        return (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p + 1}`}
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
              isCurrent
                ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {p + 1}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        className={arrowCls}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default PaginationCatto;

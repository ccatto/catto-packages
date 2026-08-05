// @ccatto/ui - LoadMoreButtonCatto
// Centered "Load more" button + subtle "Showing X of N" caption for
// server-driven lists. Pairs with useServerPagingCatto but takes plain props,
// so it's data-source-agnostic. Hidden entirely once everything is shown.
"use client";

import React from "react";
import { cn } from "../../utils";

export interface LoadMoreButtonCattoProps {
  /** How many records are currently rendered (e.g. `items.length`). */
  shown: number;
  /** Total records available on the server. */
  total: number;
  /** Disable the button and show `loadingLabel` while a fetch is in flight. */
  loading?: boolean;
  /** Invoked when the button is pressed — typically `loadMore` from the hook. */
  onClick: () => void;
  /** Button label (default: "Load more"). */
  label?: string;
  /** Button label while `loading` (default: "Loading…"). */
  loadingLabel?: string;
  /**
   * Override the caption. Receives `(shown, total)`; return `null` to hide it.
   * Default: "Showing X of N".
   */
  caption?: (shown: number, total: number) => React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

const defaultCaption = (shown: number, total: number): React.ReactNode =>
  `Showing ${shown} of ${total}`;

/**
 * LoadMoreButtonCatto — centered load-more control with a "Showing X of N"
 * caption. Renders nothing when `shown >= total`.
 *
 * @example
 * <LoadMoreButtonCatto
 *   shown={items.length}
 *   total={total}
 *   loading={loading}
 *   onClick={loadMore}
 * />
 */
export const LoadMoreButtonCatto: React.FC<LoadMoreButtonCattoProps> = ({
  shown,
  total,
  loading = false,
  onClick,
  label = "Load more",
  loadingLabel = "Loading…",
  caption = defaultCaption,
  className,
  "data-testid": testId,
}) => {
  if (shown >= total) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-6",
        className
      )}
      data-testid={testId}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg border px-6 py-2.5 text-sm font-medium",
          "border-gray-300 bg-white text-gray-900",
          "hover:bg-gray-50 active:scale-95",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
          "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        )}
      >
        {loading ? loadingLabel : label}
      </button>
      {caption && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {caption(shown, total)}
        </p>
      )}
    </div>
  );
};

export default LoadMoreButtonCatto;

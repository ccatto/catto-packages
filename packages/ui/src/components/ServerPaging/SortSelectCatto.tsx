// @ccatto/ui - SortSelectCatto
// Labeled sort dropdown for server-driven lists. Emits the selected option's
// `value` string — map it to your query's orderBy/orderDir in the consumer.
"use client";

import React, { useId } from "react";
import { cn } from "../../utils";

export interface SortSelectOption {
  value: string;
  label: string;
}

export interface SortSelectCattoProps {
  /** Currently selected option value. */
  value: string;
  /** Called with the newly selected option value. */
  onChange: (value: string) => void;
  /** Options to render. */
  options: SortSelectOption[];
  /** Visible label text before the select (default: none — uses `ariaLabel`). */
  label?: string;
  /** Accessible name for the select (default: "Sort by"). */
  ariaLabel?: string;
  /** Wrapper CSS classes. */
  className?: string;
  /** CSS classes for the `<select>` element itself. */
  selectClassName?: string;
  "data-testid"?: string;
}

/**
 * SortSelectCatto — accessible labeled sort dropdown.
 *
 * @example
 * <SortSelectCatto
 *   value={sortKey}
 *   onChange={setSortKey}
 *   options={[
 *     { value: "newest", label: "Newest" },
 *     { value: "price-asc", label: "Price: Low to High" },
 *   ]}
 * />
 */
export const SortSelectCatto: React.FC<SortSelectCattoProps> = ({
  value,
  onChange,
  options,
  label,
  ariaLabel = "Sort by",
  className,
  selectClassName,
  "data-testid": testId,
}) => {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        data-testid={testId}
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          "border-gray-300 bg-white text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
          "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
          selectClassName
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelectCatto;

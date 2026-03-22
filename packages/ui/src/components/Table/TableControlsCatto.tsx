// @ccatto/ui - TableControlsCatto
// Filter input and pagination controls for TableCatto
// IMPORTANT: Must use local useState for input value — see docs/TABLE-FILTERING-GUIDE.md
"use client";

import { useEffect, useState } from "react";
import { Table as TableType } from "@tanstack/react-table";
import { cn } from "../../utils";
import InputCatto from "../Input/InputCatto";
import { TablePrevNextButtonsCatto } from "./TablePrevNextButtonsCatto";

export interface TableControlsCattoProps<TData> {
  /** TanStack table instance */
  table: TableType<TData>;
  /** Column ID to filter on (required for 'column' mode) */
  filterVal?: string;
  /** Placeholder text for the filter input */
  filterText: string;
  /** Filter mode: 'column' or 'global' (default: 'column') */
  filterMode?: "column" | "global";
  /** Additional CSS classes */
  className?: string;
}

export function TableControlsCatto<TData>({
  table,
  filterVal,
  filterText,
  filterMode = "column",
  className,
}: TableControlsCattoProps<TData>) {
  // Opt out of React Compiler — table prop is a mutable ref (see TableCoreCatto)
  "use no memo";
  const isGlobalMode = filterMode === "global";

  // Safely convert filterText to a primitive string
  // Handles next-intl translation objects that may return [object Object] in template literals
  const safeFilterText =
    typeof filterText === "string"
      ? filterText
      : typeof filterText === "object" && filterText !== null
      ? (filterText as { toString?: () => string }).toString?.() ===
        "[object Object]"
        ? ""
        : String(filterText)
      : String(filterText || "");

  // Get current filter value from the table (external source of truth)
  const rawFilterValue = isGlobalMode
    ? table.getState().globalFilter
    : table.getColumn(filterVal ?? "")?.getFilterValue();
  const tableFilterValue =
    typeof rawFilterValue === "string" ? rawFilterValue : "";

  // Local state for the input value — REQUIRED for controlled InputCatto.
  // Without this, typed text disappears because table state doesn't sync
  // back fast enough for React's controlled input reconciliation.
  // See docs/TABLE-FILTERING-GUIDE.md Rule 1.
  const [inputValue, setInputValue] = useState(tableFilterValue);

  // Sync local state when external filter changes (e.g., programmatic clear)
  useEffect(() => {
    setInputValue(tableFilterValue);
  }, [tableFilterValue]);

  // Handle filter change based on mode
  // NOTE: Second parameter required — InputCatto uses function.length to
  // detect the calling convention: onChange(value, event) not onChange(event)
  const handleFilterChange = (value: string, _event?: unknown) => {
    setInputValue(value); // Update local state immediately for responsive input
    if (isGlobalMode) {
      table.setGlobalFilter(value);
    } else if (filterVal) {
      table.getColumn(filterVal)?.setFilterValue(value);
    }
  };

  // Show filtered count when actively filtering
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = table.getCoreRowModel().rows.length;
  const isFiltering = inputValue.length > 0;

  return (
    <div className={cn("flex justify-between", className)}>
      {/* Filter Input Textbox */}
      <div className="flex flex-1 items-center gap-2 py-2 pl-1 md:py-4">
        <InputCatto
          placeholder={`Filter by ${safeFilterText}`}
          value={inputValue}
          onChange={handleFilterChange}
          inputMode="search"
          className="max-w-[280px] md:max-w-sm"
        />
        {isFiltering && (
          <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            {filteredCount} / {totalCount}
          </span>
        )}
      </div>
      <div className="ml-auto flex w-28 items-center justify-end">
        <TablePrevNextButtonsCatto table={table} />
      </div>
    </div>
  );
}

export default TableControlsCatto;

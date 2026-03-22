// @ccatto/ui - TimezoneSelectCatto Component
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils";

/** A single timezone option with value, label, and region grouping */
export interface TimezoneOption {
  /** IANA timezone identifier, e.g. "America/New_York" */
  value: string;
  /** Human-readable label, e.g. "Eastern Time (New York)" */
  label: string;
  /** Region group, e.g. "Americas", "Europe", "Asia" */
  region: string;
}

export interface TimezoneSelectCattoProps {
  /** Array of timezone options to display */
  timezones: TimezoneOption[];
  /** Currently selected IANA timezone value */
  value?: string;
  /** Callback when a timezone is selected */
  onChange: (tz: string) => void;
  /** Optional label displayed above the dropdown */
  label?: string;
  /** Error message displayed below the dropdown */
  error?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Filter to only show timezones from a specific region */
  regionFilter?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Optional function to render UTC offset label for a timezone */
  getOffsetLabel?: (tz: string) => string;
  /** Visual variant to match SelectCatto styles */
  variant?: "default" | "primary" | "secondary";
  /** Test ID for testing */
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "text-sm h-8 px-2",
  md: "text-base h-10 px-3",
  lg: "text-lg h-12 px-4",
} as const;

const variantClasses = {
  default:
    "border-theme-border bg-theme-surface hover:border-theme-border-strong",
  primary:
    "border-theme-primary bg-theme-primary-subtle hover:bg-theme-primary-subtle text-theme-primary",
  secondary:
    "border-theme-secondary bg-theme-secondary-subtle hover:bg-theme-secondary-subtle text-theme-secondary",
} as const;

const dropdownSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

export default function TimezoneSelectCatto({
  timezones,
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  regionFilter,
  size = "md",
  className,
  getOffsetLabel,
  variant = "default",
  "data-testid": dataTestId,
}: TimezoneSelectCattoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // US popular timezones shown at top when not searching (majority US user base)
  const usPopularValues = useMemo(
    () =>
      new Set([
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
      ]),
    []
  );

  // Filter timezones by region and search query
  const filteredTimezones = useMemo(() => {
    let filtered = timezones;

    if (regionFilter) {
      filtered = filtered.filter(
        (tz) => tz.region.toLowerCase() === regionFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (tz) =>
          tz.label.toLowerCase().includes(query) ||
          tz.value.toLowerCase().includes(query) ||
          tz.region.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [timezones, regionFilter, search]);

  // Group filtered timezones by region, with "US Popular" pinned at top when not searching
  const groupedTimezones = useMemo(() => {
    const groups: Record<string, TimezoneOption[]> = {};

    // Add "US Popular" group when not actively searching
    if (!search.trim()) {
      const usPopular = filteredTimezones.filter((tz) =>
        usPopularValues.has(tz.value)
      );
      if (usPopular.length > 0) {
        groups["US Popular"] = usPopular;
      }
    }

    for (const tz of filteredTimezones) {
      if (!groups[tz.region]) {
        groups[tz.region] = [];
      }
      groups[tz.region].push(tz);
    }
    return groups;
  }, [filteredTimezones, search, usPopularValues]);

  // Preferred region order: US Popular first, then Americas, then by proximity
  const regionOrder = [
    "US Popular",
    "Americas",
    "Europe",
    "Asia",
    "Oceania",
    "Middle East",
    "Africa",
  ];

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const items: TimezoneOption[] = [];
    const regions = Object.keys(groupedTimezones).sort(
      (a, b) =>
        (regionOrder.indexOf(a) === -1 ? 99 : regionOrder.indexOf(a)) -
        (regionOrder.indexOf(b) === -1 ? 99 : regionOrder.indexOf(b))
    );
    for (const region of regions) {
      items.push(...groupedTimezones[region]);
    }
    return items;
  }, [groupedTimezones]);

  // Find the currently selected timezone for display
  const selectedTimezone = useMemo(
    () => timezones.find((tz) => tz.value === value),
    [timezones, value]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-tz-option]");
      const item = items[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  function handleToggle() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearch("");
      setHighlightedIndex(-1);
    }
  }

  function handleSelect(tzValue: string) {
    onChange(tzValue);
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < flatList.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : flatList.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && flatList[highlightedIndex]) {
          handleSelect(flatList[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
        break;
    }
  }

  function renderOptionLabel(tz: TimezoneOption) {
    const offset = getOffsetLabel ? getOffsetLabel(tz.value) : null;
    return (
      <span className="flex items-center justify-between gap-2 w-full">
        <span className="truncate">{tz.label}</span>
        {offset && (
          <span className="text-theme-text-subtle text-xs shrink-0">
            {offset}
          </span>
        )}
      </span>
    );
  }

  const regions = Object.keys(groupedTimezones).sort(
    (a, b) =>
      (regionOrder.indexOf(a) === -1 ? 99 : regionOrder.indexOf(a)) -
      (regionOrder.indexOf(b) === -1 ? 99 : regionOrder.indexOf(b))
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      data-testid={dataTestId}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      {label && (
        <label className="block font-medium text-theme-text mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border transition-colors duration-200",
          variantClasses[variant],
          variant === "default" && "text-theme-text",
          isOpen && "ring-2 ring-theme-primary",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500 ring-1 ring-red-500",
          sizeClasses[size]
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedTimezone && "text-theme-text-subtle"
          )}
        >
          {selectedTimezone
            ? selectedTimezone.label +
              (getOffsetLabel
                ? ` (${getOffsetLabel(selectedTimezone.value)})`
                : "")
            : "Select timezone..."}
        </span>
        <svg
          className={cn(
            "h-4 w-4 shrink-0 text-theme-text-subtle transition-transform duration-200 ml-2",
            isOpen && "rotate-180"
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-lg border shadow-xl",
            "border-theme-border bg-theme-surface",
            dropdownSizeClasses[size]
          )}
        >
          {/* Search input */}
          <div className="p-2 border-b border-theme-border">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder="Search timezones..."
              className={cn(
                "w-full rounded-lg border px-3 py-1.5",
                "border-theme-border bg-theme-surface-secondary",
                "text-theme-text",
                "placeholder:text-theme-text-subtle",
                "focus:outline-none focus:ring-1 focus:ring-theme-primary",
                size === "sm"
                  ? "text-xs"
                  : size === "lg"
                  ? "text-base"
                  : "text-sm"
              )}
            />
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto scrollbar-none"
          >
            {regions.length === 0 ? (
              <div className="px-3 py-4 text-center text-theme-text-subtle text-sm">
                No timezones found
              </div>
            ) : (
              regions.map((region) => (
                <div key={region} role="group" aria-label={region}>
                  {/* Region header */}
                  <div className="sticky top-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-theme-text-muted bg-theme-surface-secondary">
                    {region}
                  </div>

                  {/* Timezone options */}
                  {groupedTimezones[region].map((tz) => {
                    const flatIndex = flatList.indexOf(tz);
                    const isSelected = tz.value === value;
                    const isHighlighted = flatIndex === highlightedIndex;

                    return (
                      <button
                        key={tz.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        data-tz-option
                        onClick={() => handleSelect(tz.value)}
                        onMouseEnter={() => setHighlightedIndex(flatIndex)}
                        className={cn(
                          "w-full flex items-center px-4 py-2 text-left cursor-pointer transition-colors",
                          "text-theme-text",
                          isHighlighted && "bg-theme-surface-secondary",
                          isSelected &&
                            "bg-theme-surface-secondary font-medium",
                          !isHighlighted &&
                            !isSelected &&
                            "hover:bg-theme-surface-secondary text-theme-text-muted"
                        )}
                      >
                        {renderOptionLabel(tz)}
                        {isSelected && (
                          <svg
                            className="h-4 w-4 shrink-0 text-theme-text-muted ml-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Spacer to push parent scrollable area when dropdown is open */}
      {isOpen && <div className="h-64" aria-hidden="true" />}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

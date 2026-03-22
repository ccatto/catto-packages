// @ccatto/ui - CountryCodeSelectCatto Component
// Country code selector for phone input with flag emoji and dial codes
"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils";
import { COUNTRIES, getCountryByCode, type CountryData } from "./countries";

export interface CountryCodeSelectCattoProps {
  /** Selected country ISO code (e.g., 'US') */
  value: string;
  /** Called when country selection changes */
  onChange: (countryCode: string, country: CountryData) => void;
  /** Size variant matching PhoneInputCatto */
  size?: "small" | "medium" | "large";
  /** Disable the selector */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** i18n label for search placeholder */
  searchPlaceholder?: string;
  /** i18n label for accessibility */
  ariaLabel?: string;
}

/**
 * Country code selector dropdown.
 * Shows flag + dial code in compact mode, full list on click.
 */
const CountryCodeSelectCatto: React.FC<CountryCodeSelectCattoProps> = ({
  value,
  onChange,
  size = "medium",
  disabled = false,
  className,
  searchPlaceholder = "Search countries...",
  ariaLabel = "Select country code",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  const selectedCountry = getCountryByCode(value) ?? COUNTRIES[0];

  // Estimated dropdown height for collision detection (search + ~6 items)
  const DROPDOWN_HEIGHT = 320;

  // Position the portal dropdown relative to the trigger button,
  // flipping above the trigger if it would overflow the viewport bottom
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipAbove = spaceBelow < DROPDOWN_HEIGHT && rect.top > spaceBelow;

    setDropdownPos({
      top: flipAbove ? rect.top - DROPDOWN_HEIGHT - 4 : rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click (needed for portal since onBlur won't catch it)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setSearch("");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close when focus leaves both the trigger and the portal dropdown (keyboard/tab nav)
  useEffect(() => {
    if (!isOpen) return;
    const handleFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (
        relatedTarget &&
        (containerRef.current?.contains(relatedTarget) ||
          dropdownRef.current?.contains(relatedTarget))
      ) {
        return;
      }
      setIsOpen(false);
      setSearch("");
    };
    const container = containerRef.current;
    const dropdown = dropdownRef.current;
    container?.addEventListener("focusout", handleFocusOut);
    dropdown?.addEventListener("focusout", handleFocusOut);
    return () => {
      container?.removeEventListener("focusout", handleFocusOut);
      dropdown?.removeEventListener("focusout", handleFocusOut);
    };
  }, [isOpen]);

  const filteredCountries = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  const sizeClasses = {
    small: "h-8 px-2 text-sm",
    medium: "h-10 px-2 text-base",
    large: "h-12 px-3 text-lg",
  };

  const handleToggle = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // Focus search after dropdown opens
        setTimeout(() => searchRef.current?.focus(), 50);
      } else {
        setSearch("");
      }
      return next;
    });
  }, [disabled, updatePosition]);

  const handleSelect = useCallback(
    (country: CountryData) => {
      onChange(country.code, country);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      } else if (e.key === "Enter" && !isOpen) {
        handleToggle();
      }
    },
    [isOpen, handleToggle]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button - shows flag + dial code */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id={generatedId}
        className={cn(
          sizeClasses[size],
          "flex items-center gap-1 rounded-l-md border border-r-0",
          "border-theme-border bg-theme-surface text-theme-text",
          "transition-all duration-200",
          "hover:bg-theme-surface-hover",
          "focus:outline-none focus:ring-2 focus:ring-theme-secondary",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="text-xs text-theme-text-muted">
          {selectedCountry.dialCode}
        </span>
        <svg
          className={cn(
            "h-3 w-3 text-theme-text-muted transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown - rendered via portal to escape overflow-hidden ancestors */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
            }}
            className={cn(
              "z-[9999]",
              "w-64 rounded-md border border-theme-border",
              "bg-theme-surface shadow-lg",
              "overflow-hidden"
            )}
            role="listbox"
            aria-labelledby={generatedId}
          >
            {/* Search input */}
            <div className="border-b border-theme-border p-2">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "w-full rounded border border-theme-border px-2 py-1 text-sm",
                  "bg-theme-surface text-theme-text",
                  "placeholder:text-theme-text-subtle",
                  "focus:border-theme-secondary focus:outline-none focus:ring-1 focus:ring-theme-secondary"
                )}
                aria-label={searchPlaceholder}
              />
            </div>

            {/* Country list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-2 text-sm text-theme-text-muted">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={country.code === value}
                    onClick={() => handleSelect(country)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm",
                      "transition-colors duration-100",
                      "hover:bg-theme-surface-hover",
                      country.code === value &&
                        "bg-theme-secondary-subtle font-medium"
                    )}
                  >
                    <span className="text-base leading-none">
                      {country.flag}
                    </span>
                    <span className="flex-1 text-left text-theme-text">
                      {country.name}
                    </span>
                    <span className="text-theme-text-muted">
                      {country.dialCode}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CountryCodeSelectCatto;

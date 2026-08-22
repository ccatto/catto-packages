"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";

export type AccordionType = "single" | "multiple";
export type AccordionVariant = "default" | "bordered" | "separated";
export type AccordionSize = "sm" | "md" | "lg";
export type AccordionIconPosition = "left" | "right";

/** Data-driven item shape (for the `items` convenience API). */
export interface AccordionItemData {
  /** Unique, stable id for this item. */
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** Optional leading icon shown before the title. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionCattoProps {
  /**
   * Data-driven items. Provide this OR compose <AccordionItemCatto> children,
   * not both (children win if both are passed).
   */
  items?: AccordionItemData[];
  /** Compound children — <AccordionItemCatto> elements. */
  children?: React.ReactNode;
  /** "single" opens one item at a time; "multiple" allows many. Default "single". */
  type?: AccordionType;
  /** In "single" mode, allow closing the open item (empty state). Default true. */
  collapsible?: boolean;
  /** Uncontrolled initial open value(s). */
  defaultValue?: string | string[];
  /** Controlled open value(s). When set, the component keeps no internal state. */
  value?: string | string[];
  /** Fires with the new open value(s): a string for "single", string[] for "multiple". */
  onValueChange?: (value: string | string[]) => void;
  variant?: AccordionVariant;
  size?: AccordionSize;
  /** Chevron position within the header. Default "right". */
  iconPosition?: AccordionIconPosition;
  /** localStorage key to persist open state (uncontrolled mode only). */
  storageKey?: string;
  className?: string;
}

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  size: AccordionSize;
  variant: AccordionVariant;
  iconPosition: AccordionIconPosition;
  itemClassName: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordionContext = (component: string): AccordionContextValue => {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <AccordionCatto>.`);
  }
  return ctx;
};

const toArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const sizeClasses: Record<
  AccordionSize,
  { header: string; content: string; icon: string }
> = {
  sm: { header: "px-3 py-2 text-sm", content: "px-3 pb-2 text-sm", icon: "h-4 w-4" },
  md: {
    header: "px-4 py-3 text-base",
    content: "px-4 pb-3 text-base",
    icon: "h-5 w-5",
  },
  lg: { header: "px-5 py-4 text-lg", content: "px-5 pb-4 text-lg", icon: "h-6 w-6" },
};

const containerClasses: Record<AccordionVariant, string> = {
  default: "",
  bordered:
    "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700",
  separated: "flex flex-col gap-2",
};

const itemClasses: Record<AccordionVariant, string> = {
  default: "border-b border-gray-200 dark:border-gray-700 last:border-b-0",
  bordered: "",
  separated:
    "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
};

/**
 * AccordionCatto - flexible, accessible disclosure accordion.
 *
 * Two APIs (choose either):
 *   - Data-driven: <AccordionCatto items={[{ id, title, content }]} />
 *   - Compound:    <AccordionCatto><AccordionItemCatto value=... title=...>...</AccordionItemCatto></AccordionCatto>
 *
 * Features: single/multiple open modes, controlled + uncontrolled, optional
 * localStorage persistence, keyboard navigation (Arrow/Home/End), disabled items,
 * theme-aware variants and sizes.
 */
export const AccordionCatto: React.FC<AccordionCattoProps> = ({
  items,
  children,
  type = "single",
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant = "default",
  size = "md",
  iconPosition = "right",
  storageKey,
  className = "",
}) => {
  const isControlled = controlledValue !== undefined;

  const [internalOpen, setInternalOpen] = useState<string[]>(() => {
    if (typeof window !== "undefined" && storageKey && !isControlled) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) return JSON.parse(stored) as string[];
      } catch {
        // ignore malformed/unavailable storage
      }
    }
    return toArray(defaultValue);
  });

  const openItems = isControlled ? toArray(controlledValue) : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);

  const emit = useCallback(
    (next: string[]) => {
      onValueChange?.(type === "single" ? next[0] ?? "" : next);
    },
    [onValueChange, type]
  );

  const persist = useCallback(
    (next: string[]) => {
      if (typeof window === "undefined" || !storageKey || isControlled) return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore write failures (private mode, quota)
      }
    },
    [storageKey, isControlled]
  );

  const toggle = useCallback(
    (val: string) => {
      const currentlyOpen = openItems.includes(val);
      let next: string[];
      if (type === "single") {
        next = currentlyOpen ? (collapsible ? [] : [val]) : [val];
      } else {
        next = currentlyOpen
          ? openItems.filter((v) => v !== val)
          : [...openItems, val];
      }
      if (!isControlled) setInternalOpen(next);
      persist(next);
      emit(next);
    },
    [openItems, type, collapsible, isControlled, persist, emit]
  );

  const isOpen = useCallback(
    (val: string) => openItems.includes(val),
    [openItems]
  );

  // Roving keyboard nav across the header buttons within this accordion.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.matches("[data-accordion-header]")) return;
    const container = containerRef.current;
    if (!container) return;
    const headers = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-accordion-header]:not([disabled])"
      )
    );
    const idx = headers.indexOf(target as HTMLButtonElement);
    if (idx === -1) return;

    let nextIdx: number | null = null;
    switch (e.key) {
      case "ArrowDown":
        nextIdx = (idx + 1) % headers.length;
        break;
      case "ArrowUp":
        nextIdx = (idx - 1 + headers.length) % headers.length;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = headers.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    headers[nextIdx]?.focus();
  }, []);

  const ctx = useMemo<AccordionContextValue>(
    () => ({
      isOpen,
      toggle,
      size,
      variant,
      iconPosition,
      itemClassName: itemClasses[variant],
    }),
    [isOpen, toggle, size, variant, iconPosition]
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div
        ref={containerRef}
        className={`w-full ${containerClasses[variant]} ${className}`.trim()}
        onKeyDown={handleKeyDown}
      >
        {children
          ? children
          : items?.map((item) => (
              <AccordionItemCatto
                key={item.id}
                value={item.id}
                title={item.title}
                icon={item.icon}
                disabled={item.disabled}
              >
                {item.content}
              </AccordionItemCatto>
            ))}
      </div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemCattoProps {
  /** Unique, stable value identifying this item within the accordion. */
  value: string;
  title: React.ReactNode;
  /** Optional leading icon shown before the title. */
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * AccordionItemCatto - one disclosure row. Must be rendered inside <AccordionCatto>.
 */
export const AccordionItemCatto: React.FC<AccordionItemCattoProps> = ({
  value,
  title,
  icon,
  disabled = false,
  children,
  className = "",
}) => {
  const { isOpen, toggle, size, iconPosition, itemClassName } =
    useAccordionContext("AccordionItemCatto");
  const open = isOpen(value);
  const uid = useId();
  const headerId = `accordion-header-${uid}`;
  const panelId = `accordion-panel-${uid}`;
  const s = sizeClasses[size];

  const chevron = (
    <ChevronDown
      aria-hidden="true"
      className={`${s.icon} shrink-0 text-gray-500 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    />
  );

  return (
    <div className={`${itemClassName} ${className}`.trim()}>
      <h3 className="m-0">
        <button
          type="button"
          id={headerId}
          data-accordion-header
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => toggle(value)}
          className={`flex w-full items-center gap-3 text-left font-medium text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-secondary ${
            s.header
          } ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          {iconPosition === "left" && chevron}
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="flex-1">{title}</span>
          {iconPosition === "right" && chevron}
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open}
        {...(!open ? ({ inert: true } as { inert?: boolean }) : {})}
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={`${s.content} text-gray-700 dark:text-gray-300`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionCatto;

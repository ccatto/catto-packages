// @ccatto/ui - ProductFilterSidebarCatto
// Data-driven faceted filter sidebar (Nike/Amazon style). Desktop = sticky left
// column; mobile = app-controlled drawer. Sections are checkbox (multi), radio
// (single), or link. The app owns all state and reacts to onChange.
"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils";
import CheckboxCatto from "../Checkbox/CheckboxCatto";
import DrawerCatto from "../Drawer/DrawerCatto";
import AnimatedHamburgerCatto from "../Hamburger/AnimatedHamburgerCatto";

export type FilterSectionType = "checkbox" | "radio" | "link";

export interface FilterOption {
  label: string;
  value: string;
  /** Optional faceted count, e.g. "Elongated (42)". */
  count?: number;
  /** For type "link" options (used with LinkComponent). */
  href?: string;
}

export interface FilterSection {
  key: string;
  title: string;
  type: FilterSectionType;
  options: FilterOption[];
  /** string[] for checkbox, string|null for radio, ignored for link. */
  selected: string | string[] | null;
  /** Start this section collapsed. */
  defaultCollapsed?: boolean;
  /** Render a search box above the options that filters them by label
   *  client-side. Great for long lists (e.g. 100+ brands). */
  searchable?: boolean;
  /** Placeholder for the search box (default `Search {title}`). */
  searchPlaceholder?: string;
  /** When the option count exceeds this, cap the list height and scroll it,
   *  so one large section doesn't dominate the sidebar. */
  maxVisibleOptions?: number;
}

export interface ProductFilterSidebarCattoProps {
  sections: FilterSection[];
  /** Fired on any option toggle: checkbox = toggled value, radio = new value. */
  onChange: (sectionKey: string, value: string) => void;
  /** Optional slot at the very top (e.g. a search input). */
  searchSlot?: React.ReactNode;
  /** Optional header row above the sections. */
  header?: React.ReactNode;
  /** Clear-all handler; when set, a "Clear all" button renders in the header. */
  onClearAll?: () => void;
  /** Sections are collapsible with a chevron (default true). */
  collapsible?: boolean;

  // --- mobile drawer (app-controlled) ---
  /** When defined, a hamburger trigger + left DrawerCatto render on mobile. */
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  /** Label for the mobile trigger (default "Filters"). */
  mobileTriggerLabel?: string;

  /** Router link for type "link" options. */
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  className?: string;
}

// ---- Single section (collapsible) --------------------------------------------
const SidebarSection: React.FC<{
  section: FilterSection;
  collapsible: boolean;
  onChange: (sectionKey: string, value: string) => void;
  LinkComponent?: ProductFilterSidebarCattoProps["LinkComponent"];
}> = ({ section, collapsible, onChange, LinkComponent }) => {
  const [open, setOpen] = useState(!section.defaultCollapsed);
  const [query, setQuery] = useState("");
  const selectedArr = Array.isArray(section.selected)
    ? section.selected
    : section.selected != null
      ? [section.selected]
      : [];

  const q = query.trim().toLowerCase();
  const visibleOptions =
    section.searchable && q
      ? section.options.filter((o) => o.label.toLowerCase().includes(q))
      : section.options;
  const scroll =
    section.maxVisibleOptions != null &&
    visibleOptions.length > section.maxVisibleOptions;

  return (
    <div className="border-b border-theme-border py-4">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-theme-text">
          {section.title}
        </span>
        {collapsible && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-theme-text-muted transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        )}
      </button>

      {open && (
        <>
          {section.searchable && (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                section.searchPlaceholder ??
                `Search ${section.title.toLowerCase()}`
              }
              aria-label={`Search ${section.title}`}
              className="mt-3 w-full rounded border border-theme-border bg-theme-surface px-2 py-1 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:ring-1 focus:ring-theme-secondary"
            />
          )}
          <div
            className={scroll ? "overflow-y-auto pr-1" : undefined}
            style={
              scroll
                ? { maxHeight: `${(section.maxVisibleOptions ?? 8) * 2.25}rem` }
                : undefined
            }
          >
            <ul className="mt-3 space-y-2">
              {visibleOptions.map((opt) => {
            const isSelected = selectedArr.includes(opt.value);

            if (section.type === "link") {
              const cls = cn(
                "flex items-center justify-between rounded px-1 py-0.5 text-sm transition-colors",
                isSelected
                  ? "font-semibold text-theme-secondary"
                  : "text-theme-text-muted hover:text-theme-text",
              );
              const label = (
                <>
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className="text-xs text-theme-text-muted">
                      {opt.count}
                    </span>
                  )}
                </>
              );
              return (
                <li key={opt.value}>
                  {LinkComponent && opt.href ? (
                    <LinkComponent href={opt.href} className={cls}>
                      {label}
                    </LinkComponent>
                  ) : (
                    <a href={opt.href ?? "#"} className={cls}>
                      {label}
                    </a>
                  )}
                </li>
              );
            }

            // checkbox / radio → CheckboxCatto (radio is single-select styling
            // handled by the app's onChange semantics).
            return (
              <li
                key={opt.value}
                className="flex items-center justify-between gap-2"
              >
                <CheckboxCatto
                  id={`${section.key}-${opt.value}`}
                  checked={isSelected}
                  onChange={() => onChange(section.key, opt.value)}
                  label={opt.label}
                />
                {opt.count !== undefined && (
                  <span className="text-xs text-theme-text-muted">
                    {opt.count}
                  </span>
                )}
              </li>
            );
          })}
            </ul>
            {visibleOptions.length === 0 && (
              <p className="mt-3 text-sm text-theme-text-muted">No matches</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ---- Body shared by desktop + mobile -----------------------------------------
const SidebarBody: React.FC<
  Pick<
    ProductFilterSidebarCattoProps,
    | "sections"
    | "onChange"
    | "searchSlot"
    | "header"
    | "onClearAll"
    | "collapsible"
    | "LinkComponent"
  >
> = ({
  sections,
  onChange,
  searchSlot,
  header,
  onClearAll,
  collapsible = true,
  LinkComponent,
}) => (
  <div>
    {(header || onClearAll) && (
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-theme-text">
          {header ?? "Filters"}
        </div>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-theme-secondary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    )}
    {searchSlot && <div className="mb-4">{searchSlot}</div>}
    {sections.map((section) => (
      <SidebarSection
        key={section.key}
        section={section}
        collapsible={collapsible}
        onChange={onChange}
        LinkComponent={LinkComponent}
      />
    ))}
  </div>
);

/**
 * ProductFilterSidebarCatto - faceted filter sidebar.
 *
 * Desktop renders a sticky left column (`hidden lg:block`); the app is expected
 * to also render the mobile trigger/drawer by passing `isOpen`/`onOpen`/`onClose`.
 */
const ProductFilterSidebarCatto: React.FC<ProductFilterSidebarCattoProps> = ({
  sections,
  onChange,
  searchSlot,
  header,
  onClearAll,
  collapsible = true,
  isOpen,
  onOpen,
  onClose,
  mobileTriggerLabel = "Filters",
  LinkComponent,
  className,
}) => {
  const body = (
    <SidebarBody
      sections={sections}
      onChange={onChange}
      searchSlot={searchSlot}
      header={header}
      onClearAll={onClearAll}
      collapsible={collapsible}
      LinkComponent={LinkComponent}
    />
  );

  const hasMobile =
    isOpen !== undefined && onClose !== undefined && onOpen !== undefined;

  return (
    <>
      {/* Desktop: sticky left column */}
      <aside
        className={cn(
          // Sticky column; cap to the viewport and scroll internally so long
          // filter lists (e.g. 100+ brands) never run off the bottom.
          "hidden self-start lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1",
          className,
        )}
      >
        {body}
      </aside>

      {/* Mobile: trigger + drawer (app-controlled) */}
      {hasMobile && (
        <>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-sm font-medium text-theme-text lg:hidden"
            aria-expanded={!!isOpen}
            aria-label={mobileTriggerLabel}
          >
            {/* interactive=false → renders a <span>, so we don't nest <button>. */}
            <AnimatedHamburgerCatto
              isOpen={!!isOpen}
              size="sm"
              interactive={false}
            />
            {mobileTriggerLabel}
          </button>
          <DrawerCatto
            isOpen={!!isOpen}
            onClose={onClose!}
            side="left"
            width="sm"
            title={mobileTriggerLabel}
          >
            {body}
          </DrawerCatto>
        </>
      )}
    </>
  );
};

export default ProductFilterSidebarCatto;

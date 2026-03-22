/**
 * @ccatto/ui Spacing Tokens
 * ========================
 *
 * Single source of truth for spacing values across the component library.
 * Maps semantic size names to Tailwind utility classes.
 *
 * Scale follows Tailwind's default 4px base unit:
 *   none=0, xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px
 *
 * NOTE: GAP_MAP uses a compressed scale compared to PADDING_MAP.
 * Gaps are typically smaller than padding at the same semantic level
 * (e.g., 'lg' gap = gap-4/16px vs 'lg' padding = p-6/24px).
 *
 * NOTE: The CSS custom properties in themes/tokens.css (--catto-spacing-*)
 * are separate from these TypeScript maps. The CSS vars exist for future
 * theme-level override capability; these TS maps produce Tailwind classes
 * directly. They are intentionally parallel systems for now.
 *
 * Usage in components:
 *   import { PADDING_MAP, GAP_MAP, type SpacingScale } from '../../tokens/spacing';
 *   const padding = PADDING_MAP[size]; // e.g. 'p-4'
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Semantic spacing scale used across all @ccatto/ui components */
export type SpacingScale = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// ---------------------------------------------------------------------------
// Padding Maps
// ---------------------------------------------------------------------------

/** All-sides padding */
export const PADDING_MAP = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
} as const satisfies Record<SpacingScale, string>;

/** Horizontal padding (px) */
export const PADDING_X_MAP = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
} as const satisfies Record<SpacingScale, string>;

/** Vertical padding (py) */
export const PADDING_Y_MAP = {
  none: "py-0",
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
  "2xl": "py-12",
} as const satisfies Record<SpacingScale, string>;

// ---------------------------------------------------------------------------
// Gap Maps
// ---------------------------------------------------------------------------

/**
 * Flex/grid gap — uses a compressed scale vs padding.
 * Gaps are typically tighter than padding at the same semantic level.
 */
export const GAP_MAP = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
  "2xl": "gap-8",
} as const satisfies Record<SpacingScale, string>;

// ---------------------------------------------------------------------------
// Margin Maps
// ---------------------------------------------------------------------------

/** Bottom margin (commonly used between sections) */
export const MARGIN_BOTTOM_MAP = {
  none: "mb-0",
  xs: "mb-1",
  sm: "mb-2",
  md: "mb-4",
  lg: "mb-6",
  xl: "mb-8",
  "2xl": "mb-12",
} as const satisfies Record<SpacingScale, string>;

// ---------------------------------------------------------------------------
// Canonical Gap Sizes (for quick reference)
// ---------------------------------------------------------------------------

/** Standard gap between icon and text content */
export const ICON_GAP = "gap-2";

/** Standard gap between form fields / section elements */
export const SECTION_GAP = "gap-4";

/** Standard gap between major page sections */
export const PAGE_GAP = "gap-6";

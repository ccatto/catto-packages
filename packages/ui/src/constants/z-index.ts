/**
 * @ccatto/ui Z-Index Scale
 * =======================
 *
 * Centralized z-index values for layered UI elements.
 * Use these constants instead of arbitrary z-[N] values.
 *
 * Tailwind z-index utilities (z-0 through z-50) cover most cases.
 * These constants are for components that need to sit above everything.
 */
export const Z_INDEX = {
  /** Standard dropdown menus, select popups, autocomplete */
  dropdown: "z-[1000]",
  /** Modals, dialogs, overlays */
  modal: "z-[2000]",
  /** Tooltips (should float above modals) */
  tooltip: "z-50",
  /** Toast notifications (topmost layer) */
  toast: "z-[3000]",
} as const;

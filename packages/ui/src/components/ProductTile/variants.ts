import { cva, type VariantProps } from "class-variance-authority";

/**
 * ProductTileCatto container variants.
 * Presentation-only catalog/review tile (no commerce assumptions).
 */
export const productTileVariants = cva(
  "group relative flex flex-col overflow-hidden rounded-xl border border-theme-border bg-theme-surface text-left transition-all",
  {
    variants: {
      elevation: {
        flat: "",
        hover:
          "hover:-translate-y-0.5 hover:border-theme-secondary hover:shadow-lg",
      },
      padding: {
        sm: "p-2",
        md: "p-3",
        lg: "p-4",
      },
    },
    defaultVariants: {
      elevation: "hover",
      padding: "md",
    },
  },
);

export type ProductTileVariants = VariantProps<typeof productTileVariants>;

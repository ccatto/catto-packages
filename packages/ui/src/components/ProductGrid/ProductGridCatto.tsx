// @ccatto/ui - ProductGridCatto
// Responsive grid wrapper for catalog tiles. Column classes are STATIC literal
// strings (COLS_MAP) so Tailwind's JIT can see them — never interpolate
// `grid-cols-${n}` or the classes get purged.
"use client";

import React from "react";
import { cn } from "../../utils";
import { GAP_MAP, type SpacingScale } from "../../tokens/spacing";
import CardSkeletonCatto from "../Skeleton/CardSkeletonCatto";

/** Max columns at the largest breakpoint; the grid ramps up responsively. */
export type ProductGridCols = 2 | 3 | 4 | 5;

// Literal, complete class strings (required for Tailwind static extraction).
const COLS_MAP: Record<ProductGridCols, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

export interface ProductGridCattoProps {
  children?: React.ReactNode;
  /** Max columns at the largest breakpoint (default 4). */
  cols?: ProductGridCols;
  /** Grid gap, mapped through GAP_MAP (default "lg" = gap-4). */
  gap?: SpacingScale;
  /** When true, render `skeletonCount` skeleton tiles instead of children. */
  loading?: boolean;
  /** Number of skeletons when loading (default = cols * 2). */
  skeletonCount?: number;
  className?: string;
  "data-testid"?: string;
}

/**
 * ProductGridCatto - responsive catalog grid.
 *
 * @example
 * <ProductGridCatto cols={4} loading={isLoading}>
 *   {items.map((p) => <ProductTileCatto key={p.id} {...p} />)}
 * </ProductGridCatto>
 */
const ProductGridCatto: React.FC<ProductGridCattoProps> = ({
  children,
  cols = 4,
  gap = "lg",
  loading = false,
  skeletonCount,
  className,
  "data-testid": testId,
}) => {
  return (
    <div
      className={cn("grid", COLS_MAP[cols], GAP_MAP[gap], className)}
      data-testid={testId}
    >
      {loading
        ? Array.from({ length: skeletonCount ?? cols * 2 }).map((_, i) => (
            <CardSkeletonCatto key={i} showFooter />
          ))
        : children}
    </div>
  );
};

export default ProductGridCatto;

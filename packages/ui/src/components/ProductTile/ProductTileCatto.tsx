// @ccatto/ui - ProductTileCatto
// Presentation-only catalog/review product tile. Unlike the commerce
// ProductCardCatto (required price + Add-to-Cart), this makes price/rating
// optional and has no cart — ideal for review catalogs. The whole tile is a
// single navigation target to a product detail page.
"use client";

import React, { useState } from "react";
import { cn } from "../../utils";
import RatingStarsCatto from "../RatingStars/RatingStarsCatto";
import BadgeCatto, { type BadgeVariant } from "../Badge/BadgeCatto";
import { productTileVariants, type ProductTileVariants } from "./variants";

export interface ProductTileCattoProps extends ProductTileVariants {
  /** Image URL. If omitted (or it errors), `mediaFallback` is rendered. */
  image?: string;
  /** Alt text for the image (defaults to `title` when it's a string). */
  imageAlt?: string;
  /** Rendered when there's no image / the image fails to load. */
  mediaFallback?: React.ReactNode;
  /** Full override of the media area — takes precedence over image/fallback. */
  media?: React.ReactNode;

  /** Small brand/category eyebrow line above the title. */
  category?: React.ReactNode;
  /** Main title, line-clamped to 2 lines. */
  title: React.ReactNode;
  /** Optional supporting copy, line-clamped to 2 lines. */
  description?: React.ReactNode;

  /** Numeric rating 0–max; composes RatingStarsCatto when provided. */
  rating?: number;
  /** Review count shown next to the stars. */
  reviewCount?: number;

  /** Free-form price (string or number; formatting is the caller's job). */
  price?: string | number;

  /** Badge label overlaid top-left of the media. */
  badge?: string;
  /** Badge visual variant. */
  badgeVariant?: BadgeVariant;

  /** Arbitrary slot under the price row (e.g. wishlist, tags). */
  footer?: React.ReactNode;

  // --- navigation: LinkComponent+href preferred; onClick / href fallback ---
  href?: string;
  /** Injected router link (Next.js Link, etc.) for a real, locale-aware anchor. */
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  onClick?: () => void;

  className?: string;
  "data-testid"?: string;
}

/**
 * ProductTileCatto - flexible, clickable catalog/review tile.
 *
 * Navigation precedence (matches BottomNavCatto): `LinkComponent`+`href` →
 * `onClick` → `href` → static `div`.
 *
 * @example
 * <ProductGridCatto cols={4}>
 *   {items.map((p) => (
 *     <ProductTileCatto
 *       key={p.id}
 *       image={p.imageUrl}
 *       category={p.brand}
 *       title={p.name}
 *       reviewCount={p.reviews}
 *       href={`/products/${p.slug}`}
 *       LinkComponent={Link}
 *       mediaFallback="📦"
 *     />
 *   ))}
 * </ProductGridCatto>
 */
const ProductTileCatto: React.FC<ProductTileCattoProps> = ({
  image,
  imageAlt,
  mediaFallback = "📦",
  media,
  category,
  title,
  description,
  rating,
  reviewCount,
  price,
  badge,
  badgeVariant = "default",
  footer,
  href,
  LinkComponent,
  onClick,
  elevation,
  padding,
  className,
  "data-testid": testId,
}) => {
  const [imgError, setImgError] = useState(false);

  const inner = (
    <>
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-theme-surface-secondary">
        {badge && (
          <BadgeCatto
            variant={badgeVariant}
            size="sm"
            className="absolute top-2 left-2 z-10"
          >
            {badge}
          </BadgeCatto>
        )}
        {media ??
          (image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={imageAlt ?? (typeof title === "string" ? title : "")}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-theme-text-muted">
              {mediaFallback}
            </div>
          ))}
      </div>

      {category && (
        <p className="mb-1 text-xs text-theme-text-muted">{category}</p>
      )}
      <h3 className="line-clamp-2 font-semibold text-theme-text">{title}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-theme-text-muted">
          {description}
        </p>
      )}
      {rating !== undefined && (
        <div className="mt-2">
          <RatingStarsCatto value={rating} size="sm" count={reviewCount} />
        </div>
      )}
      {price !== undefined && (
        <p className="mt-2 font-bold text-theme-text">{price}</p>
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </>
  );

  const wrapperClassName = cn(
    productTileVariants({ elevation, padding }),
    className,
  );

  // 1) LinkComponent + href → real anchor (preferred; SEO + locale-aware)
  if (LinkComponent && href) {
    return (
      <LinkComponent href={href} className={wrapperClassName}>
        {inner}
      </LinkComponent>
    );
  }

  // 2) onClick → button
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={wrapperClassName}
        data-testid={testId}
      >
        {inner}
      </button>
    );
  }

  // 3) href → plain anchor
  if (href) {
    return (
      <a href={href} className={wrapperClassName} data-testid={testId}>
        {inner}
      </a>
    );
  }

  // 4) static
  return (
    <div className={wrapperClassName} data-testid={testId}>
      {inner}
    </div>
  );
};

export default ProductTileCatto;

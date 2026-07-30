// @ccatto/ui - ProductHeroCatto
// Domain-agnostic product-detail hero: image + title + badges + metadata grid
// + external links + optional rating + actions slot. All facets flow in as
// generic data (no domain enums), so any app can map its product onto it.
"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "../../utils";
import RatingStarsCatto from "../RatingStars/RatingStarsCatto";
import BadgeCatto, { type BadgeVariant } from "../Badge/BadgeCatto";

export interface ProductHeroBadge {
  label: string;
  variant?: BadgeVariant;
}
export interface ProductHeroMeta {
  label: string;
  value: React.ReactNode;
}
export interface ProductHeroLink {
  label: string;
  url: string;
  icon?: React.ReactNode;
  /** Opens in a new tab with rel=noopener. Internal links use LinkComponent. */
  external?: boolean;
}

export interface ProductHeroCattoProps {
  image?: string;
  imageAlt?: string;
  mediaFallback?: React.ReactNode;

  /** Brand / category eyebrow above the title. */
  category?: React.ReactNode;
  title: string;

  /** Badges rendered as a wrap row (composes BadgeCatto). */
  badges?: ProductHeroBadge[];
  /** Spec pairs rendered as a responsive 2×N <dl>. */
  metadata?: ProductHeroMeta[];
  /** External / editorial links row. */
  externalLinks?: ProductHeroLink[];

  rating?: number;
  reviewCount?: number;

  /** CTA / actions slot (e.g. an "Add to compare" button). Alias: children. */
  actions?: React.ReactNode;
  children?: React.ReactNode;

  /** Router link for internal `externalLinks` (external=false). */
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  className?: string;
}

/**
 * ProductHeroCatto - generic product-detail hero.
 *
 * @example
 * <ProductHeroCatto
 *   image={p.imageUrl}
 *   category={p.brand.name}
 *   title={p.name}
 *   badges={[{ label: 'Elongated', variant: 'info' }, { label: 'Gen-4' }]}
 *   metadata={[{ label: 'Core', value: '16mm' }, { label: 'Length', value: '16.5"' }]}
 *   externalLinks={[{ label: "Manufacturer", url: p.url, external: true }]}
 * />
 */
const ProductHeroCatto: React.FC<ProductHeroCattoProps> = ({
  image,
  imageAlt,
  mediaFallback = "📦",
  category,
  title,
  badges,
  metadata,
  externalLinks,
  rating,
  reviewCount,
  actions,
  children,
  LinkComponent,
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const linkClass =
    "inline-flex items-center gap-1 font-medium text-theme-secondary hover:underline";

  return (
    <section
      className={cn(
        "rounded-2xl border border-theme-border bg-theme-surface p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Media */}
        <div className="flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-xl bg-theme-surface-secondary md:w-56">
          {image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={imageAlt ?? title}
              onError={() => setImgError(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-5xl text-theme-text-muted">
              {mediaFallback}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {category && (
            <p className="text-sm text-theme-text-muted">{category}</p>
          )}
          <h1 className="mb-3 text-3xl font-bold text-theme-text">{title}</h1>

          {badges && badges.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {badges.map((b) => (
                <BadgeCatto
                  key={b.label}
                  variant={b.variant ?? "default"}
                  size="sm"
                >
                  {b.label}
                </BadgeCatto>
              ))}
            </div>
          )}

          {rating !== undefined && (
            <div className="mb-4">
              <RatingStarsCatto value={rating} count={reviewCount} showValue />
            </div>
          )}

          {metadata && metadata.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {metadata.map((m) => (
                <div key={m.label}>
                  <dt className="text-theme-text-muted">{m.label}</dt>
                  <dd className="font-medium text-theme-text">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {externalLinks && externalLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {externalLinks.map((link) => {
                const content = (
                  <>
                    {link.label}
                    {link.icon ??
                      (link.external ? (
                        <ExternalLink className="h-4 w-4" />
                      ) : null)}
                  </>
                );
                if (link.external) {
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {content}
                    </a>
                  );
                }
                if (LinkComponent) {
                  return (
                    <LinkComponent
                      key={link.label}
                      href={link.url}
                      className={linkClass}
                    >
                      {content}
                    </LinkComponent>
                  );
                }
                return (
                  <a key={link.label} href={link.url} className={linkClass}>
                    {content}
                  </a>
                );
              })}
            </div>
          )}

          {(actions ?? children) && (
            <div className="mt-4">{actions ?? children}</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductHeroCatto;

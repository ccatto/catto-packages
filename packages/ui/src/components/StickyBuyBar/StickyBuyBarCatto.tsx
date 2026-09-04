"use client";

import React, { useEffect, useRef, useState } from "react";

export interface StickyBuyBarCattoProps {
  /** Buy destination. When absent, the bar renders nothing (no buy option). */
  buyUrl?: string | null;
  /** Primary price. Formatted with Intl unless `priceLabel` is passed. */
  price?: number | null;
  /** Original/list price — shown struck-through when greater than `price`. */
  compareAtPrice?: number | null;
  /** ISO currency for number formatting. Default "USD". Ignored if you pass label strings. */
  currency?: string;
  /** Pre-formatted price string, if the app would rather format prices itself. */
  priceLabel?: string;
  /** Pre-formatted compare-at string (shown struck-through when provided). */
  compareAtLabel?: string;
  /** Optional discount code shown as a chip (e.g. "PPR"). */
  discountCode?: string | null;
  /** CTA text. Default "Buy". */
  ctaLabel?: string;
  /** Optional product name (shown on wider screens). */
  productName?: string;
  /** Optional product thumbnail (shown on wider screens). */
  imageUrl?: string | null;
  /**
   * Ref to the element (e.g. the hero) whose visibility toggles the bar. While
   * this element is on screen the bar stays hidden; it reveals once scrolled past.
   * If omitted, falls back to a scroll-Y threshold (`revealAfterPx`).
   */
  revealAfterRef?: React.RefObject<HTMLElement | null>;
  /** Scroll-Y (px) after which the bar reveals when no `revealAfterRef` is given. Default 400. */
  revealAfterPx?: number;
  /** Fired on Buy click (app logs the outbound click). */
  onBuyClick?: () => void;
  className?: string;
}

/**
 * StickyBuyBarCatto - a bottom-pinned "buy bar" for product detail pages.
 *
 * Shows a price (+ optional struck-through compare-at and discount-code chip) and a
 * primary Buy link that opens `buyUrl` in a new tab with affiliate-safe `rel`. Stays
 * hidden while the hero (or a scroll threshold) is in view and slides up once the
 * user scrolls past, so it never duplicates an above-the-fold CTA.
 *
 * Domain-agnostic: the app maps its product onto the props. Renders nothing when
 * `buyUrl` is absent. Mode-aware via theme tokens; safe-area aware; SSR-safe;
 * respects prefers-reduced-motion.
 */
const StickyBuyBarCatto: React.FC<StickyBuyBarCattoProps> = ({
  buyUrl,
  price,
  compareAtPrice,
  currency = "USD",
  priceLabel,
  compareAtLabel,
  discountCode,
  ctaLabel = "Buy",
  productName,
  imageUrl,
  revealAfterRef,
  revealAfterPx = 400,
  onBuyClick,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  // Reveal logic: hide while the target (hero) is on screen, else use a scroll
  // threshold. Client-only; guards window / IntersectionObserver for SSR.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = revealAfterRef?.current;

    if (target && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0 }
      );
      io.observe(target);
      return () => io.disconnect();
    }

    const onScroll = () => setVisible(window.scrollY > revealAfterPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfterRef, revealAfterPx]);

  // Measure the bar so an in-flow spacer can reserve its height (keeps the last
  // page content from hiding behind the fixed bar).
  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setBarHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [buyUrl]);

  if (!buyUrl) return null;

  const fmt = (n: number): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(n);
    } catch {
      return `${n}`;
    }
  };

  const priceText =
    priceLabel ?? (price != null ? fmt(price) : undefined);
  const compareText =
    compareAtLabel ??
    (compareAtPrice != null && price != null && compareAtPrice > price
      ? fmt(compareAtPrice)
      : undefined);

  return (
    <>
      {/* In-flow spacer so content above isn't hidden behind the fixed bar. */}
      <div aria-hidden="true" style={{ height: barHeight }} />

      <div
        ref={barRef}
        aria-hidden={!visible}
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-theme-border bg-theme-surface transition-transform duration-300 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0" : "translate-y-full pointer-events-none"
        } ${className}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          {/* Product name + thumbnail (wider screens only) */}
          {(imageUrl || productName) && (
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={productName ?? ""}
                  className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                />
              )}
              {productName && (
                <span className="truncate text-sm font-medium text-theme-text">
                  {productName}
                </span>
              )}
            </div>
          )}

          {/* Price + optional compare-at + discount chip */}
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex items-baseline gap-2">
              {priceText && (
                <span className="text-lg font-bold text-theme-text">
                  {priceText}
                </span>
              )}
              {compareText && (
                <span className="text-sm text-theme-text-muted line-through">
                  {compareText}
                </span>
              )}
            </div>
            {discountCode && (
              <span className="mt-0.5 w-fit rounded-full bg-theme-primary-subtle px-2 py-0.5 text-xs font-medium text-theme-primary">
                Code: {discountCode}
              </span>
            )}
          </div>

          {/* Push CTA to the right */}
          <div className="flex-1" />

          <a
            href={buyUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            onClick={onBuyClick}
            className="inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-theme-primary px-5 py-2.5 font-semibold text-theme-on-primary shadow-sm transition-colors hover:bg-theme-primary-hover active:bg-theme-primary-active focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
};

export default StickyBuyBarCatto;

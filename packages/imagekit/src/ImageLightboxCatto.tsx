'use client';

// @ccatto/imagekit — ImageLightboxCatto
//
// A fullscreen modal image viewer with pinch/wheel/double-click zoom, drag-to-pan
// when zoomed, prev/next paging, and swipe on touch. Self-contained: native
// pointer events + a CSS transform, the browser's focus handling, and a portal to
// document.body. No external gesture library. SSR-safe (portal mounts on client
// only). Respects prefers-reduced-motion.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildImageKitUrl } from './url';

export interface ImageLightboxCattoProps {
  /** Image URLs, in display order. */
  images: string[];
  /** Whether the overlay is open. */
  open: boolean;
  /** Current image index (controlled). */
  index: number;
  /** Fired when the user pages to a different image inside the lightbox. */
  onIndexChange?: (index: number) => void;
  /** Fired when the lightbox requests to close (X, Esc, backdrop). */
  onClose: () => void;
  /** Alt text base (index is appended for a11y). */
  alt?: string;
  /** ImageKit transform width for the fullscreen image. Default 1600. */
  width?: number;
}

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const SWIPE_THRESHOLD = 50; // px horizontal to trigger prev/next

function tr(src: string, width?: number): string {
  if (!width) return src;
  try {
    return buildImageKitUrl(src, { width, quality: 80, format: 'auto' });
  } catch {
    return src;
  }
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ImageLightboxCatto({
  images,
  open,
  index,
  onIndexChange,
  onClose,
  alt = 'Image',
  width = 1600,
}: ImageLightboxCattoProps) {
  const clean = images.filter(Boolean);
  const count = clean.length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dialogRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Imperative gesture state (kept in refs so pointer moves don't re-render).
  const transform = useRef({ scale: 1, tx: 0, ty: 0 });
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const applyTransform = useCallback((animate = false) => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, tx, ty } = transform.current;
    el.style.transition =
      animate && !prefersReducedMotion() ? 'transform 0.2s ease-out' : 'none';
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }, []);

  const resetTransform = useCallback(
    (animate = false) => {
      transform.current = { scale: 1, tx: 0, ty: 0 };
      setIsZoomed(false);
      applyTransform(animate);
    },
    [applyTransform],
  );

  // Clamp pan so the image cannot be dragged entirely off-screen.
  const clampPan = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { scale } = transform.current;
    const rect = el.getBoundingClientRect();
    // rect already reflects the current scale; bound by the overflow half-extent.
    const maxX = Math.max(0, (rect.width - el.clientWidth) / 2);
    const maxY = Math.max(0, (rect.height - el.clientHeight) / 2);
    transform.current.tx = clamp(transform.current.tx, -maxX, maxX);
    transform.current.ty = clamp(transform.current.ty, -maxY, maxY);
    void scale;
  }, []);

  const setScale = useCallback(
    (next: number, animate = false) => {
      const scale = clamp(next, MIN_SCALE, MAX_SCALE);
      transform.current.scale = scale;
      if (scale === 1) {
        transform.current.tx = 0;
        transform.current.ty = 0;
      }
      setIsZoomed(scale > 1);
      clampPan();
      applyTransform(animate);
    },
    [applyTransform, clampPan],
  );

  const page = useCallback(
    (dir: number) => {
      if (count < 2) return;
      const next = (index + dir + count) % count;
      resetTransform(false);
      onIndexChange?.(next);
    },
    [count, index, onIndexChange, resetTransform],
  );

  // Reset zoom whenever the image changes or the overlay (re)opens.
  useEffect(() => {
    if (open) resetTransform(false);
  }, [open, index, resetTransform]);

  // Body scroll lock + focus management while open.
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open]);

  // Keyboard: Esc closes, arrows page, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        page(-1);
      } else if (e.key === 'ArrowRight') {
        page(1);
      } else if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, page]);

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      pinchStart.current = {
        dist: distance(pts[0], pts[1]),
        scale: transform.current.scale,
      };
      swipeStart.current = null;
      panStart.current = null;
    } else if (transform.current.scale > 1) {
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        tx: transform.current.tx,
        ty: transform.current.ty,
      };
    } else {
      swipeStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length === 2 && pinchStart.current) {
      const dist = distance(pts[0], pts[1]);
      setScale((dist / pinchStart.current.dist) * pinchStart.current.scale);
      return;
    }
    if (panStart.current) {
      transform.current.tx = panStart.current.tx + (e.clientX - panStart.current.x);
      transform.current.ty = panStart.current.ty + (e.clientY - panStart.current.y);
      clampPan();
      applyTransform(false);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeStart.current;
    // Swipe to page (only when not zoomed and single pointer).
    if (start && transform.current.scale === 1 && pointers.current.size === 1) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        page(dx < 0 ? 1 : -1);
      }
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      panStart.current = null;
      swipeStart.current = null;
      // Snap back if a pinch drifted below 1.
      if (transform.current.scale < 1) resetTransform(true);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(transform.current.scale * (e.deltaY < 0 ? 1.15 : 0.87), false);
  };

  const onDoubleClick = () => {
    setScale(transform.current.scale > 1 ? 1 : 2, true);
  };

  if (!mounted || !open || count === 0) return null;

  const current = clean[Math.min(index, count - 1)];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} ${index + 1} of ${count}`}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 select-none"
      onClick={(e) => {
        // Backdrop click (not a click on the image or a control) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur transition hover:bg-white/25"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {count > 1 && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
          {index + 1} / {count}
        </span>
      )}

      {/* Image + gesture surface. Clicking the letterbox area (not the image) closes,
          but only when not zoomed so a pan/zoom gesture never dismisses. */}
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden touch-none"
        style={{ cursor: isZoomed ? 'grab' : 'auto' }}
        onClick={(e) => {
          if (e.target === e.currentTarget && transform.current.scale === 1) {
            onClose();
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={tr(current, width)}
          alt={`${alt} ${index + 1} of ${count}`}
          draggable={false}
          className="max-h-full max-w-full object-contain will-change-transform"
        />
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/25"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/25"
          >
            ›
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}

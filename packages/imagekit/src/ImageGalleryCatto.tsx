'use client';

// @ccatto/imagekit — ImageGalleryCatto
//
// A lightweight multi-image viewer: a large main image with a clickable
// thumbnail strip, prev/next controls, and keyboard arrow support. No keys or
// app coupling — pass an array of image URLs (ImageKit or any host). Neutral
// Tailwind with a `className` override.

import { useCallback, useEffect, useState } from 'react';
import { buildImageKitUrl } from './url';

export interface ImageGalleryCattoProps {
  /** Image URLs, in display order. */
  images: string[];
  /** Alt text base (index is appended for a11y). */
  alt?: string;
  /** Wrapper className override. */
  className?: string;
  /** Optional ImageKit transform width for the main image (skips if not an ImageKit URL). */
  mainWidth?: number;
  /** Optional ImageKit transform width for thumbnails. */
  thumbWidth?: number;
}

function tr(src: string, width?: number): string {
  if (!width) return src;
  try {
    return buildImageKitUrl(src, { width, quality: 80, format: 'auto' });
  } catch {
    return src;
  }
}

export function ImageGalleryCatto({
  images,
  alt = 'Image',
  className = '',
  mainWidth = 800,
  thumbWidth = 160,
}: ImageGalleryCattoProps) {
  const clean = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const count = clean.length;

  const go = useCallback(
    (next: number) => setIndex((i) => (count ? (next + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, go]);

  if (count === 0) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 text-4xl dark:bg-gray-800 ${className}`}
        aria-label="No image"
      >
        🏓
      </div>
    );
  }

  const current = clean[Math.min(index, count - 1)];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tr(current, mainWidth)}
          alt={`${alt} ${index + 1} of ${count}`}
          className="mx-auto aspect-square w-full object-contain"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="flex flex-wrap gap-2">
          {clean.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                i === index
                  ? 'border-blue-500'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tr(src, thumbWidth)}
                alt={`${alt} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

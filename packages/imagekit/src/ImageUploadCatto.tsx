'use client';

// @ccatto/imagekit — ImageUploadCatto
//
// A minimal, provider-styled-neutral image upload control: a button that opens
// a file picker, uploads to ImageKit (via the app's auth endpoint), shows a
// preview, and calls `onUploaded(url)`. No keys embedded — the app passes its
// public key; the private key stays in the app's server auth route.

import { useRef, useState } from 'react';
import { uploadToImageKit } from './upload';

export interface ImageUploadCattoProps {
  /** ImageKit public key (e.g. process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY). */
  publicKey: string;
  /** Destination folder, e.g. '/pickle-paddle-reviews'. */
  folder?: string;
  /** Prefix for the uploaded file name (a timestamp + original name follow). */
  fileNamePrefix?: string;
  /** App auth endpoint (default '/api/imagekit-auth'). */
  authUrl?: string;
  /** Current image URL — shows a preview when set. */
  value?: string | null;
  /** Called with the uploaded CDN url on success. */
  onUploaded: (url: string) => void;
  onError?: (error: Error) => void;
  label?: string;
  className?: string;
}

export function ImageUploadCatto({
  publicKey,
  folder,
  fileNamePrefix = '',
  authUrl,
  value,
  onUploaded,
  onError,
  label = 'Upload image',
  className,
}: ImageUploadCattoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToImageKit(file, {
        publicKey,
        folder,
        fileName: `${fileNamePrefix}${Date.now()}-${file.name}`,
        authUrl,
      });
      onUploaded(result.url);
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Upload failed');
      setError(err.message);
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 flex-none rounded-lg object-contain"
          />
        ) : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !publicKey}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          {uploading ? 'Uploading…' : value ? 'Replace image' : label}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />
    </div>
  );
}

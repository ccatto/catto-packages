// @ccatto/imagekit — URL transform builder
//
// Append ImageKit transforms to an image URL for resized/optimized variants.
//   buildImageKitUrl(url, { width: 600, format: 'auto' })
//     → `${url}?tr=w-600,f-auto`

export interface ImageKitTransform {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  /** ImageKit crop mode, e.g. 'maintain_ratio', 'at_max', 'force'. */
  crop?: string;
}

export function buildImageKitUrl(
  src: string,
  transform: ImageKitTransform,
): string {
  const parts: string[] = [];
  if (transform.width) parts.push(`w-${transform.width}`);
  if (transform.height) parts.push(`h-${transform.height}`);
  if (transform.quality) parts.push(`q-${transform.quality}`);
  if (transform.format) parts.push(`f-${transform.format}`);
  if (transform.crop) parts.push(`c-${transform.crop}`);
  if (parts.length === 0) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}tr=${parts.join(',')}`;
}

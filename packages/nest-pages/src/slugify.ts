/**
 * @ccatto/nest-pages - default slugify
 *
 * Lowercase, strip accents, replace non-alphanumerics with hyphens, collapse and
 * trim. Overridable via `CattoPagesModule.forRoot({ slugify })`.
 */
export function defaultSlugify(input: string): string {
  return (input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 191);
}

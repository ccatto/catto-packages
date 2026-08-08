// @ccatto/react-pages — slugify (matches @ccatto/nest-pages' defaultSlugify)
// Used for the editor's live "slug from title" suggestion. The backend re-slugs
// authoritatively on save, so this is a UX convenience only.
export function slugify(input: string): string {
  return (input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 191);
}

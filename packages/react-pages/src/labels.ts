// @ccatto/react-pages — i18n label bags (override via the `labels` prop)

export interface PageEditorLabels {
  titleLabel: string;
  titlePlaceholder: string;
  slugLabel: string;
  parentLabel: string;
  parentNone: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  previewLabel: string;
  statusLabel: string;
  draft: string;
  published: string;
  save: string;
  saving: string;
  cancel: string;
  delete: string;
  genericError: string;
}

export const DEFAULT_EDITOR_LABELS: PageEditorLabels = {
  titleLabel: 'Title',
  titlePlaceholder: 'Page title',
  slugLabel: 'Slug',
  parentLabel: 'Parent page',
  parentNone: '— Top level —',
  bodyLabel: 'Body (Markdown)',
  bodyPlaceholder: 'Write your page in Markdown…',
  previewLabel: 'Preview',
  statusLabel: 'Status',
  draft: 'Draft',
  published: 'Published',
  save: 'Save',
  saving: 'Saving…',
  cancel: 'Cancel',
  delete: 'Delete',
  genericError: 'Something went wrong. Please try again.',
};

export interface PageAdminTreeLabels {
  heading: string;
  empty: string;
  addChild: string;
  addTop: string;
  edit: string;
  delete: string;
  draft: string;
  dragHint: string;
  genericError: string;
}

export const DEFAULT_ADMIN_TREE_LABELS: PageAdminTreeLabels = {
  heading: 'Pages',
  empty: 'No pages yet. Add your first page.',
  addChild: 'Add child',
  addTop: 'Add page',
  edit: 'Edit',
  delete: 'Delete',
  draft: 'Draft',
  dragHint: 'Drag to reorder',
  genericError: 'Something went wrong. Please try again.',
};

// @ccatto/react-pages — PageBodyCatto
//
// Renders a page's Markdown body. This package ships NO markdown/sanitizer dep —
// the app injects `renderMarkdown` and owns sanitization (its security boundary),
// e.g. react-markdown + rehype-sanitize, or marked + DOMPurify. When omitted, the
// body is rendered as escaped plain text — never as raw HTML — so it can't inject.
'use client';

import React from 'react';
import type { RenderMarkdown } from '../types';

export interface PageBodyCattoProps {
  /** The stored Markdown body. */
  markdown: string;
  /** Renders Markdown → sanitized React. Omit only to get the plain-text fallback. */
  renderMarkdown?: RenderMarkdown;
  className?: string;
  'data-testid'?: string;
}

let warned = false;

export const PageBodyCatto: React.FC<PageBodyCattoProps> = ({
  markdown,
  renderMarkdown,
  className,
  'data-testid': testId,
}) => {
  if (renderMarkdown) {
    return (
      <div className={className} data-testid={testId}>
        {renderMarkdown(markdown ?? '')}
      </div>
    );
  }

  if (
    !warned &&
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV !== 'production'
  ) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[PageBodyCatto] No `renderMarkdown` prop provided — rendering the body as ' +
        'escaped plain text. Pass a sanitizing Markdown renderer (e.g. react-markdown ' +
        '+ rehype-sanitize) for formatted, safe output.',
    );
  }

  // Safe fallback: React escapes the text; whitespace preserved. No HTML injection.
  return (
    <div
      className={className}
      data-testid={testId}
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {markdown ?? ''}
    </div>
  );
};

export default PageBodyCatto;

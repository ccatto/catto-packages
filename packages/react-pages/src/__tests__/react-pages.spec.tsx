import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageBodyCatto } from '../components/PageBodyCatto';
import { PageEditorCatto } from '../components/PageEditorCatto';
import { toNavTree } from '../toNavTree';
import { usePageManager } from '../hooks/usePageManager';
import { slugify } from '../slugify';
import type { PageNodeDTO } from '../types';

function node(over: Partial<PageNodeDTO> = {}): PageNodeDTO {
  return {
    id: 'p1',
    namespace: 'pickle_talk',
    slug: 'rules',
    parentId: null,
    title: 'The Rules',
    excerpt: null,
    icon: null,
    status: 'PUBLISHED',
    order: 0,
    body: '# Hello',
    path: 'rules',
    children: [],
    ...over,
  };
}

describe('slugify', () => {
  it('slugifies titles', () => {
    expect(slugify('Ready Position!')).toBe('ready-position');
  });
});

describe('PageBodyCatto', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('uses the injected renderMarkdown', () => {
    const renderMarkdown = vi.fn((md: string) => <p>rendered: {md}</p>);
    render(<PageBodyCatto markdown="# Hi" renderMarkdown={renderMarkdown} />);
    expect(renderMarkdown).toHaveBeenCalledWith('# Hi');
    expect(screen.getByText(/rendered: # Hi/)).toBeTruthy();
  });

  it('falls back to escaped plain text (no HTML injection) when no renderer', () => {
    const { container } = render(
      <PageBodyCatto markdown={'<img src=x onerror=alert(1)>'} />,
    );
    // The raw string is rendered as text, not parsed as HTML.
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('toNavTree', () => {
  it('maps a page tree to NavTreeItem with hrefs + nested children', () => {
    const tree = [
      node({
        id: 'a',
        title: 'Training',
        slug: 'training',
        path: 'training',
        children: [
          node({
            id: 'b',
            title: 'Forehand',
            slug: 'forehand',
            path: 'training/forehand',
          }),
        ],
      }),
    ];
    const nav = toNavTree(tree, { basePath: '/pickle-talk' });
    expect(nav[0]).toMatchObject({ key: 'a', label: 'Training', href: '/pickle-talk/training' });
    expect(nav[0].children![0]).toMatchObject({
      key: 'b',
      href: '/pickle-talk/training/forehand',
    });
  });
});

describe('usePageManager', () => {
  it('loads the tree and reorderSiblings calls reorderPages', async () => {
    const fetchTree = vi.fn().mockResolvedValue([node({ id: 'x' }), node({ id: 'y' })]);
    const reorderPages = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePageManager({
        namespace: 'pickle_talk',
        fetchTree,
        createPage: vi.fn(),
        updatePage: vi.fn(),
        deletePage: vi.fn(),
        reorderPages,
      }),
    );
    await waitFor(() => expect(result.current.tree).toHaveLength(2));
    await act(async () => {
      await result.current.reorderSiblings(null, ['y', 'x']);
    });
    expect(reorderPages).toHaveBeenCalledWith(null, ['y', 'x']);
    expect(result.current.tree.map((n) => n.id)).toEqual(['y', 'x']); // optimistic
  });
});

describe('PageEditorCatto', () => {
  it('auto-slugs from the title and saves create vars', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <PageEditorCatto namespace="pickle_talk" onSave={onSave} />,
    );
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Ready Position' },
    });
    // slug field reflects the auto-slug
    expect((screen.getByLabelText(/slug/i) as HTMLInputElement).value).toBe(
      'ready-position',
    );
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [vars, id] = onSave.mock.calls[0];
    expect(id).toBeUndefined();
    expect(vars).toMatchObject({
      namespace: 'pickle_talk',
      title: 'Ready Position',
      slug: 'ready-position',
      status: 'DRAFT',
    });
  });
});

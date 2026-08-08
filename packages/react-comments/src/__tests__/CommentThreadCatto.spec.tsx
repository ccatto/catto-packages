import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentThreadCatto } from '../components/CommentThreadCatto';
import type { CommentDTO, CommentPage } from '../types';

// This package's setup does not load jest-dom — use vanilla matchers.

function comment(over: Partial<CommentDTO> = {}): CommentDTO {
  return {
    id: 'c1',
    entityType: 'pickle_talk_page',
    entityKey: 'rules',
    authorId: 'u1',
    authorName: 'Ada',
    body: 'Great article!',
    status: 'APPROVED',
    parentId: null,
    flaggedCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

const page = (items: CommentDTO[]): CommentPage => ({
  total: items.length,
  items,
});

const baseProps = {
  entityType: 'pickle_talk_page',
  entityKey: 'rules',
};

describe('CommentThreadCatto', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders approved comments from fetchComments', async () => {
    const fetchComments = vi.fn().mockResolvedValue(page([comment()]));
    render(
      <CommentThreadCatto
        {...baseProps}
        fetchComments={fetchComments}
        createComment={vi.fn()}
      />,
    );
    expect(await screen.findByText('Great article!')).toBeTruthy();
    expect(fetchComments).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'pickle_talk_page',
        entityKey: 'rules',
      }),
    );
  });

  it('shows a sign-in prompt and no composer when logged out', async () => {
    render(
      <CommentThreadCatto
        {...baseProps}
        currentUser={null}
        fetchComments={vi.fn().mockResolvedValue(page([]))}
        createComment={vi.fn()}
      />,
    );
    expect(await screen.findByText(/sign in/i)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('blocks submit on the client profanity pre-check', async () => {
    const createComment = vi.fn();
    render(
      <CommentThreadCatto
        {...baseProps}
        currentUser={{ id: 'u2', name: 'Grace' }}
        fetchComments={vi.fn().mockResolvedValue(page([]))}
        createComment={createComment}
        profanityCheck={(t) => /badword/i.test(t)}
      />,
    );
    const box = await screen.findByRole('textbox');
    fireEvent.change(box, { target: { value: 'you badword' } });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() =>
      expect(screen.getByText(/inappropriate language/i)).toBeTruthy(),
    );
    expect(createComment).not.toHaveBeenCalled();
  });

  it("shows a pending-review pill after posting in 'pre' mode", async () => {
    const createComment = vi
      .fn()
      .mockResolvedValue(comment({ id: 'c2', body: 'My thoughts', status: 'PENDING' }));
    render(
      <CommentThreadCatto
        {...baseProps}
        moderationMode="pre"
        currentUser={{ id: 'u2', name: 'Grace' }}
        fetchComments={vi.fn().mockResolvedValue(page([]))}
        createComment={createComment}
      />,
    );
    const box = await screen.findByRole('textbox');
    fireEvent.change(box, { target: { value: 'My thoughts' } });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => expect(createComment).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/pending review/i)).toBeTruthy();
  });

  it('reports a comment via the injected callback', async () => {
    const reportComment = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentThreadCatto
        {...baseProps}
        currentUser={{ id: 'u2', name: 'Grace' }}
        fetchComments={vi.fn().mockResolvedValue(page([comment()]))}
        createComment={vi.fn()}
        reportComment={reportComment}
      />,
    );
    await screen.findByText('Great article!');
    fireEvent.click(screen.getByRole('button', { name: /^report$/i }));
    await waitFor(() => expect(reportComment).toHaveBeenCalledWith('c1'));
  });
});

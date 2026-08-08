import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentModerationTableCatto } from '../components/CommentModerationTableCatto';
import type { CommentDTO, CommentPage } from '../types';

function comment(over: Partial<CommentDTO> = {}): CommentDTO {
  return {
    id: 'c1',
    entityType: 'pickle_talk_page',
    entityKey: 'rules',
    authorId: 'u1',
    authorName: 'Ada',
    body: 'Needs review',
    status: 'PENDING',
    parentId: null,
    flaggedCount: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

const page = (items: CommentDTO[]): CommentPage => ({
  total: items.length,
  items,
});

describe('CommentModerationTableCatto', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders the pending queue', async () => {
    render(
      <CommentModerationTableCatto
        fetchPending={vi.fn().mockResolvedValue(page([comment()]))}
        moderate={vi.fn()}
      />,
    );
    expect(await screen.findByText('Needs review')).toBeTruthy();
    expect(screen.getAllByTestId('moderation-row')).toHaveLength(1);
  });

  it('approves a row via the injected callback and drops it from the queue', async () => {
    const moderate = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentModerationTableCatto
        fetchPending={vi.fn().mockResolvedValue(page([comment()]))}
        moderate={moderate}
      />,
    );
    await screen.findByText('Needs review');
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() =>
      expect(moderate).toHaveBeenCalledWith('c1', 'APPROVED'),
    );
    await waitFor(() =>
      expect(screen.queryByTestId('moderation-row')).toBeNull(),
    );
  });

  it('shows the empty state when there is nothing to moderate', async () => {
    render(
      <CommentModerationTableCatto
        fetchPending={vi.fn().mockResolvedValue(page([]))}
        moderate={vi.fn()}
      />,
    );
    expect(await screen.findByText(/nothing to moderate/i)).toBeTruthy();
  });
});

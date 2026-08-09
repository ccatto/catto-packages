// @ccatto/react-account — DeleteAccountCatto
//
// Irreversible account deletion with type-to-confirm. Transport-agnostic — the app
// injects `onDelete` (its self-service deleteAccount mutation) and handles sign-out
// / redirect afterward.
'use client';

import React, { useState } from 'react';
import { DEFAULT_DELETE_LABELS, type DeleteAccountLabels } from '../labels';

export interface DeleteAccountCattoProps {
  onDelete: () => Promise<void> | void;
  /** The word the user must type to enable deletion. Default "DELETE". */
  confirmWord?: string;
  labels?: Partial<DeleteAccountLabels>;
  className?: string;
  'data-testid'?: string;
}

export const DeleteAccountCatto: React.FC<DeleteAccountCattoProps> = ({
  onDelete,
  confirmWord = 'DELETE',
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_DELETE_LABELS, ...labels };
  const [value, setValue] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = value.trim() === confirmWord;

  const handleDelete = async () => {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : L.genericError);
      setDeleting(false);
    }
  };

  return (
    <section
      className={[
        'w-full space-y-3 rounded-xl border border-red-200 p-4 dark:border-red-900/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
    >
      <h3 className="text-base font-semibold text-red-600 dark:text-red-400">
        {L.heading}
      </h3>
      <p className="text-sm text-theme-text-muted">{L.warning}</p>

      <label className="block space-y-1.5">
        <span className="text-sm text-theme-text">
          {L.confirmInstruction.replace('{word}', confirmWord)}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={L.placeholder}
          aria-label={L.confirmInstruction.replace('{word}', confirmWord)}
          className="w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </label>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={!confirmed || deleting}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
      >
        {deleting ? L.deleting : L.deleteButton}
      </button>
    </section>
  );
};

export default DeleteAccountCatto;

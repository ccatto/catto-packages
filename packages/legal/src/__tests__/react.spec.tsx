import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LegalAcceptanceGate } from '../react/LegalAcceptanceGate';
import { useLegalAcceptance } from '../react/useLegalAcceptance';
import type { LegalDocumentVersion } from '../index';

const documents: LegalDocumentVersion[] = [
  { kind: 'TERMS', version: '2026-08-14', url: '/legal/terms' },
  { kind: 'EULA', version: '2026-08-14', url: '/legal/eula' },
];

describe('useLegalAcceptance', () => {
  it('is unchecked by default with empty acceptedVersions', () => {
    const { result } = renderHook(() => useLegalAcceptance(documents));
    expect(result.current.accepted).toBe(false);
    expect(result.current.acceptedVersions).toEqual([]);
  });

  it('toggles and populates acceptedVersions', () => {
    const { result } = renderHook(() => useLegalAcceptance(documents));
    act(() => result.current.toggle());
    expect(result.current.accepted).toBe(true);
    expect(result.current.acceptedVersions).toEqual([
      { kind: 'TERMS', version: '2026-08-14' },
      { kind: 'EULA', version: '2026-08-14' },
    ]);
  });
});

describe('LegalAcceptanceGate', () => {
  const renderGate = (onChange = vi.fn()) => {
    render(
      <LegalAcceptanceGate
        documents={documents}
        onChange={onChange}
        renderLink={(doc) => <a href={doc.url}>{doc.kind}</a>}
        labels={{ agreePrefix: 'I agree to the', separator: 'and' }}
        data-testid="legal-gate"
      />,
    );
    return onChange;
  };

  it('renders UNCHECKED by default and fires no onChange on mount', () => {
    const onChange = renderGate();
    const box = screen.getByTestId('legal-gate') as HTMLInputElement;
    expect(box.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange(true, versions) only after an explicit toggle', () => {
    const onChange = renderGate();
    fireEvent.click(screen.getByTestId('legal-gate'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true, [
      { kind: 'TERMS', version: '2026-08-14' },
      { kind: 'EULA', version: '2026-08-14' },
    ]);
    // Unchecking reports false + empty.
    fireEvent.click(screen.getByTestId('legal-gate'));
    expect(onChange).toHaveBeenLastCalledWith(false, []);
  });

  it('renders the app-supplied links + prefix (no hardcoded copy)', () => {
    // This package's test setup does not load jest-dom — use vanilla matchers.
    renderGate();
    expect(screen.getByText('I agree to the')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'TERMS' }).getAttribute('href'),
    ).toBe('/legal/terms');
    expect(screen.getByRole('link', { name: 'EULA' })).toBeTruthy();
  });
});

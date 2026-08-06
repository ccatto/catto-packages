import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactFormCatto } from '../components/ContactFormCatto';

// This package's test setup does not load @testing-library/jest-dom, so these
// specs use vanilla matchers (truthiness + getAttribute) rather than
// toBeInTheDocument / toHaveAttribute.

describe('ContactFormCatto', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the heading, note banner, and required fields', () => {
    render(<ContactFormCatto />);

    expect(screen.getByRole('heading', { name: /contact us/i })).toBeTruthy();
    expect(screen.getByText(/real inbox/i)).toBeTruthy();
    expect(screen.getByLabelText(/your name/i)).toBeTruthy();
    expect(screen.getByLabelText(/your email/i)).toBeTruthy();
    expect(screen.getByLabelText(/your phone/i)).toBeTruthy();
    expect(screen.getByLabelText(/message/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send message/i })).toBeTruthy();
  });

  it('hides the note banner when hideNote is set', () => {
    render(<ContactFormCatto hideNote />);
    expect(screen.queryByText(/real inbox/i)).toBeNull();
  });

  it('calls onSubmit with the friendly wire shape on valid input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ContactFormCatto onSubmit={onSubmit} />);

    fireEvent.input(screen.getByLabelText(/your name/i), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.input(screen.getByLabelText(/your email/i), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.input(screen.getByLabelText(/message/i), {
      target: { value: 'Hello, this is a test message.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello, this is a test message.',
    });
    // Success state is shown after submit resolves.
    await screen.findByRole('status');
  });

  it('POSTs to the default endpoint when no onSubmit is given', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchSpy);

    render(<ContactFormCatto />);

    fireEvent.input(screen.getByLabelText(/your name/i), {
      target: { value: 'Grace Hopper' },
    });
    fireEvent.input(screen.getByLabelText(/your email/i), {
      target: { value: 'grace@example.com' },
    });
    fireEvent.input(screen.getByLabelText(/message/i), {
      target: { value: 'Reporting a bug in the compiler.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/contact');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.name).toBe('Grace Hopper');
    expect(body.email).toBe('grace@example.com');
  });

  it('shows a validation error and does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<ContactFormCatto onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Name is required — it is flagged invalid and onSubmit never runs.
    await waitFor(() =>
      expect(
        screen.getByLabelText(/your name/i).getAttribute('aria-invalid'),
      ).toBe('true'),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendContactMessage } from '../server';

const BASE = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello there, this is a test message.',
};

const TELNYX = {
  apiKey: 'KEY123',
  phoneNumber: '+15550000000',
  messagingProfileId: 'MP1',
  to: '+15551111111',
};

function okTelnyxResponse() {
  return {
    ok: true,
    json: async () => ({ data: { id: 'msg_abc' } }),
  } as unknown as Response;
}

describe('sendContactMessage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('drops honeypot submissions silently (no fetch)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(
      { ...BASE, website: 'http://spam.example' },
      { telnyx: TELNYX },
    );

    expect(result).toEqual({ ok: true, skipped: 'honeypot' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects invalid email', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(
      { ...BASE, email: 'not-an-email' },
      { telnyx: TELNYX },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/email/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('errors when Telnyx is not configured', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(BASE, { telnyx: {} });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not configured/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends via Telnyx and returns the message id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okTelnyxResponse());
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(
      { ...BASE, phone: '555-123-4567' },
      { telnyx: TELNYX, label: 'New PPR contact' },
    );

    expect(result).toEqual({ ok: true, messageId: 'msg_abc' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.telnyx.com/v2/messages');
    expect(init.headers.Authorization).toBe('Bearer KEY123');
    const body = JSON.parse(init.body);
    expect(body.to).toBe(TELNYX.to);
    expect(body.from).toBe(TELNYX.phoneNumber);
    expect(body.messaging_profile_id).toBe(TELNYX.messagingProfileId);
    // Message includes name, email · phone, and the body, prefixed by label.
    expect(body.text).toContain('New PPR contact');
    expect(body.text).toContain('Ada Lovelace');
    expect(body.text).toContain('ada@example.com · 555-123-4567');
  });

  it('surfaces a Telnyx API error', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ errors: [{ detail: 'Invalid to number' }] }),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(BASE, { telnyx: TELNYX });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid to number');
  });

  it('verifies a captcha token before sending (rejects on failure)', async () => {
    const fetchSpy = vi
      .fn()
      // captcha verify -> failure
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      } as unknown as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(
      { ...BASE, token: 'tok' },
      {
        telnyx: TELNYX,
        captcha: { provider: 'turnstile', secret: 'S' },
      },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/captcha/i);
    // Only the captcha call happened; no Telnyx send.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('challenges.cloudflare.com');
  });

  it('sends after a passing captcha check', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as unknown as Response)
      .mockResolvedValueOnce(okTelnyxResponse());
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendContactMessage(
      { ...BASE, token: 'tok' },
      {
        telnyx: TELNYX,
        captcha: { provider: 'turnstile', secret: 'S' },
      },
    );

    expect(result).toEqual({ ok: true, messageId: 'msg_abc' });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

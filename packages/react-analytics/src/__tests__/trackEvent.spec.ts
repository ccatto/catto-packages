import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import { trackEvent } from '../trackEvent';

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

const mockSend = vi.mocked(sendGAEvent);

describe('trackEvent', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards to sendGAEvent as an "event" with name + params', () => {
    trackEvent('contact_submit', { plan: 'pro' });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith('event', 'contact_submit', {
      plan: 'pro',
    });
  });

  it('defaults params to an empty object', () => {
    trackEvent('page_cta_click');
    expect(mockSend).toHaveBeenCalledWith('event', 'page_cta_click', {});
  });

  it('never throws when sendGAEvent throws (GA not loaded)', () => {
    mockSend.mockImplementation(() => {
      throw new Error('gtag is not defined');
    });
    expect(() => trackEvent('x')).not.toThrow();
  });

  it('no-ops on the server (no window)', () => {
    const originalWindow = globalThis.window;
    // Simulate a non-browser environment.
    // @ts-expect-error — deleting window for the test
    delete globalThis.window;
    try {
      trackEvent('server_side');
      expect(mockSend).not.toHaveBeenCalled();
    } finally {
      globalThis.window = originalWindow;
    }
  });
});

import { render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import { getCapacitorPlatform } from '../getCapacitorPlatform';
import { setUserProperties } from '../setUserProperties';
import { useAnalyticsPlatform } from '../useAnalyticsPlatform';
import { AnalyticsPlatformCatto } from '../platform';

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));
const mockSend = vi.mocked(sendGAEvent);

function setCapacitor(platform: string | undefined) {
  if (platform === undefined) {
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  } else {
    (window as unknown as { Capacitor?: unknown }).Capacitor = {
      getPlatform: () => platform,
      isNativePlatform: () => platform !== 'web',
    };
  }
}

describe('getCapacitorPlatform', () => {
  afterEach(() => setCapacitor(undefined));

  it("returns 'web' when Capacitor is absent (plain browser)", () => {
    setCapacitor(undefined);
    expect(getCapacitorPlatform()).toBe('web');
  });

  it("returns 'ios' / 'android' inside a native WebView", () => {
    setCapacitor('ios');
    expect(getCapacitorPlatform()).toBe('ios');
    setCapacitor('android');
    expect(getCapacitorPlatform()).toBe('android');
  });

  it("normalizes Capacitor's 'web' platform to 'web'", () => {
    setCapacitor('web');
    expect(getCapacitorPlatform()).toBe('web');
  });
});

describe('setUserProperties', () => {
  afterEach(() => mockSend.mockReset());

  it("forwards to gtag('set', 'user_properties', …)", () => {
    setUserProperties({ app_platform: 'ios', tier: 'pro' });
    expect(mockSend).toHaveBeenCalledWith('set', 'user_properties', {
      app_platform: 'ios',
      tier: 'pro',
    });
  });

  it('never throws when GA is unavailable', () => {
    mockSend.mockImplementation(() => {
      throw new Error('gtag is not defined');
    });
    expect(() => setUserProperties({ a: 1 })).not.toThrow();
  });
});

describe('useAnalyticsPlatform', () => {
  afterEach(() => {
    mockSend.mockReset();
    setCapacitor(undefined);
  });

  it('sets app_platform to the Capacitor platform on mount', () => {
    setCapacitor('android');
    renderHook(() => useAnalyticsPlatform());
    expect(mockSend).toHaveBeenCalledWith('set', 'user_properties', {
      app_platform: 'android',
    });
  });

  it('honors a custom property name and platform override', () => {
    renderHook(() =>
      useAnalyticsPlatform({ propertyName: 'device', platform: 'kiosk' }),
    );
    expect(mockSend).toHaveBeenCalledWith('set', 'user_properties', {
      device: 'kiosk',
    });
  });
});

describe('AnalyticsPlatformCatto', () => {
  afterEach(() => {
    mockSend.mockReset();
    setCapacitor(undefined);
  });

  it('renders nothing but fires the platform user property', () => {
    setCapacitor('ios');
    const { container } = render(<AnalyticsPlatformCatto />);
    expect(container.firstChild).toBeNull();
    expect(mockSend).toHaveBeenCalledWith('set', 'user_properties', {
      app_platform: 'ios',
    });
  });
});

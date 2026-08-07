import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleAnalyticsCatto } from '../GoogleAnalyticsCatto';

// Mock @next/third-parties so we can assert what GoogleAnalyticsCatto renders
// without pulling in the real (client-only) Script component.
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga" data-ga-id={gaId} />
  ),
}));

describe('GoogleAnalyticsCatto', () => {
  const ENV = 'NEXT_PUBLIC_GA_MEASUREMENT_ID';

  afterEach(() => {
    delete process.env[ENV];
    vi.clearAllMocks();
  });

  it('renders GoogleAnalytics with the gaId prop when passed', () => {
    const { getByTestId } = render(<GoogleAnalyticsCatto gaId="G-PROP123" />);
    expect(getByTestId('ga').getAttribute('data-ga-id')).toBe('G-PROP123');
  });

  it('falls back to NEXT_PUBLIC_GA_MEASUREMENT_ID when no prop', () => {
    process.env[ENV] = 'G-ENV456';
    const { getByTestId } = render(<GoogleAnalyticsCatto />);
    expect(getByTestId('ga').getAttribute('data-ga-id')).toBe('G-ENV456');
  });

  it('prefers the explicit prop over the env var', () => {
    process.env[ENV] = 'G-ENV456';
    const { getByTestId } = render(<GoogleAnalyticsCatto gaId="G-PROP123" />);
    expect(getByTestId('ga').getAttribute('data-ga-id')).toBe('G-PROP123');
  });

  it('renders nothing when no id is available anywhere', () => {
    const { container } = render(<GoogleAnalyticsCatto />);
    expect(container.querySelector('[data-testid="ga"]')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});

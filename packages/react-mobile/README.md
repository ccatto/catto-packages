# @ccatto/react-mobile

React hooks for Capacitor mobile apps. Provides haptic feedback, pull-to-refresh, keyboard management, deep links, network status, sharing, QR scanning, and geolocation. All hooks silently no-op on web to avoid errors.

## Install

```bash
npm install @ccatto/react-mobile
# or
yarn add @ccatto/react-mobile
```

## Quick Start

```tsx
import {
  useHaptics,
  useNetworkStatus,
  usePullToRefresh,
} from '@ccatto/react-mobile';

function App() {
  const { impact, notification } = useHaptics();
  const { isConnected } = useNetworkStatus();
  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => { /* reload data */ },
  });

  return (
    <button onClick={() => { impact('light'); handleTap(); }}>
      Tap me
    </button>
  );
}
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@capacitor/core` | `>=5.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `@capacitor/app` | `*` | No |
| `@capacitor/haptics` | `*` | No |
| `@capacitor/keyboard` | `*` | No |
| `@capacitor/network` | `*` | No |
| `@capacitor/share` | `*` | No |

## License

MIT

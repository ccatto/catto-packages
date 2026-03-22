# @catto/react-push

React hooks for Capacitor push notifications on iOS and Android. Handles registration, permissions, and notification listeners. Silently no-ops on web.

## Install

```bash
npm install @catto/react-push
# or
yarn add @catto/react-push
```

## Quick Start

```tsx
import { usePushNotifications } from '@catto/react-push';

function App() {
  const { token, requestPermission, isRegistered } = usePushNotifications({
    onNotificationReceived: (notification) => {
      console.log('Foreground notification:', notification);
    },
    onNotificationActionPerformed: (action) => {
      console.log('User tapped notification:', action);
    },
  });

  // Request permission (e.g., after sign-in)
  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted && token) {
      // Send token to your backend for push targeting
      await fetch('/api/devices', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    }
  };

  return <button onClick={handleEnable}>Enable Notifications</button>;
}
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@capacitor/core` | `>=5.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `@capacitor/push-notifications` | `*` | No |

## License

MIT

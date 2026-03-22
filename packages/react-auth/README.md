# @ccatto/react-auth

React/Next.js authentication package with Better Auth integration, JWT auth, session management, and mobile (Capacitor) support.

## Install

```bash
npm install @ccatto/react-auth
# or
yarn add @ccatto/react-auth
```

## Quick Start

```tsx
// Client-side
import { useSession, signIn, signOut } from '@ccatto/react-auth';

function Profile() {
  const session = useSession();

  if (!session) return <button onClick={() => signIn()}>Sign In</button>;

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

```typescript
// Server-side
import { createCattoAuth } from '@ccatto/react-auth/server';
```

## Sub-exports

| Entry Point | Description |
| --- | --- |
| `@ccatto/react-auth` | Client-side hooks, providers, types |
| `@ccatto/react-auth/server` | Server-side auth config, session enrichment |

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `better-auth` | `>=1.0.0` | Yes |
| `next` | `>=14.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `zustand` | `>=4.0.0` | Yes |
| `@apollo/client` | `*` | No |
| `@capacitor/core` | `*` | No |
| `@capacitor/preferences` | `*` | No |
| `@simplewebauthn/browser` | `*` | No |
| `graphql` | `*` | No |

## License

MIT

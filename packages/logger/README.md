# @ccatto/logger

Shared logger interface and Pino factories for browser and Node.js environments.

Provides env-aware log levels (debug in development, info in production), pretty-printing in dev, JSON in prod, and smart error extraction.

## Install

```bash
npm install @ccatto/logger
# or
yarn add @ccatto/logger
```

## Quick Start

```typescript
import { createBrowserLogger, createNodeLogger } from '@ccatto/logger';

// Browser (React, Next.js client)
const log = createBrowserLogger({ name: 'my-app' });

// Node.js (API, server)
const serverLog = createNodeLogger({ name: 'api' });

log.info('User signed in', { userId: '123' });
log.error('Payment failed', { error: new Error('Stripe timeout') });
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `pino` | `>=9.0.0` | Yes |
| `pino-http` | `*` | No |
| `pino-pretty` | `*` | No |

## License

MIT

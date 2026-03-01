# Catto Packages

Shared TypeScript packages for the Catto ecosystem. Monorepo managed with Yarn Workspaces and TurboRepo.

## Packages

| Package | Description |
|---------|-------------|
| `@catto/ui` | Component library (ButtonCatto, CardCatto, TableCatto, etc.) |
| `@catto/logger` | Pino-based structured logging for browser and Node.js |
| `@catto/profanity` | Content moderation / profanity filtering |
| `@catto/shared` | Shared utilities (geo, color, profanity re-exports) |
| `@catto/react-auth` | Frontend authentication hooks and services (Better Auth + JWT) |
| `@catto/react-contact` | Contact form hooks with validation and reCAPTCHA |
| `@catto/react-mobile` | Capacitor mobile hooks (haptics, deep links, network, etc.) |
| `@catto/react-push` | Push notification hooks for web and mobile |
| `@catto/nest-auth` | NestJS authentication module (JWT, guards, decorators) |
| `@catto/nest-email` | NestJS email module (SendGrid) |
| `@catto/nest-sms` | NestJS SMS module (Telnyx) |
| `@catto/nest-payments` | NestJS payments module (Stripe) |
| `@catto/nest-recaptcha` | NestJS reCAPTCHA verification module |
| `@catto/nest-push` | NestJS push notifications module (Firebase) |

## Quick Start

```bash
# Install dependencies and build all packages
yarn install

# Build all packages (topological order via Turbo)
yarn build

# Run all tests
yarn test

# Format code
yarn prettier
```

## Package Dependencies

```
@catto/profanity          (leaf)
@catto/logger             (leaf)
@catto/shared             -> @catto/profanity
@catto/react-contact      -> @catto/logger
@catto/react-mobile       -> @catto/logger
@catto/react-push         -> @catto/logger
(all others are leaf packages)
```

## Using in Consuming Apps

Currently these packages are used via local workspace references. CI/CD publishing to npm will be added in a future update.

## License

MIT

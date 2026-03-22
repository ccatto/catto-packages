# Catto Packages

Shared TypeScript packages for the Catto ecosystem. Monorepo managed with Yarn Workspaces and TurboRepo.

## Packages

| Package | Description |
|---------|-------------|
| `@ccatto/ui` | Component library (ButtonCatto, CardCatto, TableCatto, etc.) |
| `@ccatto/logger` | Pino-based structured logging for browser and Node.js |
| `@ccatto/profanity` | Content moderation / profanity filtering |
| `@ccatto/shared` | Shared utilities (geo, color, profanity re-exports) |
| `@ccatto/react-auth` | Frontend authentication hooks and services (Better Auth + JWT) |
| `@ccatto/react-contact` | Contact form hooks with validation and reCAPTCHA |
| `@ccatto/react-mobile` | Capacitor mobile hooks (haptics, deep links, network, etc.) |
| `@ccatto/react-push` | Push notification hooks for web and mobile |
| `@ccatto/nest-auth` | NestJS authentication module (JWT, guards, decorators) |
| `@ccatto/nest-email` | NestJS email module (SendGrid) |
| `@ccatto/nest-sms` | NestJS SMS module (Telnyx) |
| `@ccatto/nest-payments` | NestJS payments module (Stripe) |
| `@ccatto/nest-recaptcha` | NestJS reCAPTCHA verification module |
| `@ccatto/nest-push` | NestJS push notifications module (Firebase) |

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
@ccatto/profanity          (leaf)
@ccatto/logger             (leaf)
@ccatto/shared             -> @ccatto/profanity
@ccatto/react-contact      -> @ccatto/logger
@ccatto/react-mobile       -> @ccatto/logger
@ccatto/react-push         -> @ccatto/logger
(all others are leaf packages)
```

## Using in Consuming Apps

All packages are published to **npmjs.com** under the `@ccatto` scope.

```bash
# NestJS backend packages
npm install @ccatto/nest-auth @ccatto/nest-email @ccatto/nest-push @ccatto/nest-sms

# React frontend packages
npm install @ccatto/ui @ccatto/react-auth
```

### CI/CD

Packages are automatically published on merge to `main` when a package version is bumped. The GitHub Actions workflow detects unpublished versions and publishes them.

To publish, you need an `NPM_TOKEN` secret configured in the GitHub repo settings.

## License

MIT

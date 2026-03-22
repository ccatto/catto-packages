# @ccatto/nest-auth

> Catto Auth - NestJS authentication module with JWT, WebAuthn, guards, and decorators.

## Install

```bash
npm install @ccatto/nest-auth
# or
yarn add @ccatto/nest-auth
```

## Quick Start

```typescript
import { CattoAuthModule, GqlAuthGuard, CurrentUser } from '@ccatto/nest-auth';

@Module({
  imports: [
    CattoAuthModule.forRoot({
      jwt: { secret: process.env.JWT_SECRET },
    }),
  ],
})
export class AppModule {}
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@nestjs/common` | `>=10.0.0` |
| `@nestjs/config` | `>=3.0.0` |
| `@nestjs/core` | `>=10.0.0` |
| `@nestjs/jwt` | `>=10.0.0` |
| `@nestjs/passport` | `>=10.0.0` |
| `bcrypt` | `>=5.0.0` |
| `class-transformer` | `>=0.5.0` |
| `class-validator` | `>=0.14.0` |
| `passport-jwt` | `>=4.0.0` |
| `reflect-metadata` | `>=0.1.0` |

### Optional

| Package | Version |
| --- | --- |
| `@nestjs/graphql` | `>=12.0.0` |
| `@nestjs/throttler` | `*` |
| `@simplewebauthn/server` | `*` |

## License

MIT

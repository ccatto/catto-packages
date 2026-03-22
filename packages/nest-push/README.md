# @catto/nest-push

Catto Push - NestJS Firebase Cloud Messaging (FCM) push notification service.

## Install

```bash
npm install @catto/nest-push
# or
yarn add @catto/nest-push
```

> **Note:** This package has a direct dependency on `firebase-admin`, which is installed automatically.

## Quick Start

```typescript
import { CattoPushModule, CattoPushService } from '@catto/nest-push';

@Module({
  imports: [
    CattoPushModule.forRoot({
      firebaseCredential: JSON.parse(process.env.FIREBASE_CREDENTIALS),
    }),
  ],
})
export class AppModule {}
```

Then inject `CattoPushService`:

```typescript
@Injectable()
export class MyService {
  constructor(private pushService: CattoPushService) {}

  async notify(token: string) {
    await this.pushService.sendToDevice(token, {
      title: 'Hello',
      body: 'World',
    });
  }
}
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@nestjs/common` | `>=10.0.0` |
| `@nestjs/core` | `>=10.0.0` |
| `reflect-metadata` | `>=0.1.0` |

## License

MIT

# @ccatto/nest-sms

Catto SMS - NestJS SMS service with Telnyx integration.

## Install

```bash
npm install @ccatto/nest-sms
# or
yarn add @ccatto/nest-sms
```

## Quick Start

```typescript
import { CattoSmsModule, CattoSmsService } from '@ccatto/nest-sms';

@Module({
  imports: [
    CattoSmsModule.forRoot({
      provider: 'telnyx',
      apiKey: process.env.TELNYX_API_KEY,
      phoneNumber: process.env.TELNYX_PHONE_NUMBER,
      messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID,
    }),
  ],
})
export class AppModule {}
```

Then inject `CattoSmsService`:

```typescript
@Injectable()
export class MyService {
  constructor(private smsService: CattoSmsService) {}

  async notify(phone: string) {
    await this.smsService.sendSms({
      to: phone,
      message: 'Hello from Catto!',
    });
  }
}
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@nestjs/common` | `>=10.0.0` |
| `@nestjs/core` | `>=10.0.0` |
| `class-transformer` | `>=0.5.0` |
| `class-validator` | `>=0.14.0` |
| `reflect-metadata` | `>=0.1.0` |

## License

MIT

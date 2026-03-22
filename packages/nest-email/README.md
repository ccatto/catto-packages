# @ccatto/nest-email

NestJS email service with SendGrid integration.

## Install

```bash
npm install @ccatto/nest-email
# or
yarn add @ccatto/nest-email
```

## Quick Start

```typescript
import { CattoEmailModule, CattoEmailService } from '@ccatto/nest-email';

@Module({
  imports: [
    CattoEmailModule.forRoot({
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: 'noreply@example.com',
    }),
  ],
})
export class AppModule {}
```

Then inject `CattoEmailService`:

```typescript
@Injectable()
export class MyService {
  constructor(private emailService: CattoEmailService) {}

  async notify(to: string) {
    await this.emailService.sendEmail({
      to,
      subject: 'Hello',
      html: '<p>World</p>',
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

# @catto/nest-recaptcha

NestJS dynamic module for Google reCAPTCHA v3 server-side verification.

## Install

```bash
npm install @catto/nest-recaptcha
# or
yarn add @catto/nest-recaptcha
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { CattoRecaptchaModule } from '@catto/nest-recaptcha';

@Module({
  imports: [
    CattoRecaptchaModule.forRoot({
      secretKey: process.env.RECAPTCHA_SECRET_KEY,
      scoreThreshold: 0.5,
    }),
  ],
})
export class AppModule {}
```

Inject the service to verify tokens:

```typescript
import { CattoRecaptchaService } from '@catto/nest-recaptcha';

@Injectable()
export class ContactService {
  constructor(private readonly recaptcha: CattoRecaptchaService) {}

  async handleSubmit(token: string) {
    const result = await this.recaptcha.verify(token);
    if (!result.success) throw new BadRequestException('reCAPTCHA failed');
  }
}
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@nestjs/common` | `>=10.0.0` | Yes |
| `@nestjs/core` | `>=10.0.0` | Yes |
| `reflect-metadata` | `>=0.1.0` | Yes |

## License

MIT

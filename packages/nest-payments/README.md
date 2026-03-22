# @catto/nest-payments

NestJS dynamic module wrapping the Stripe SDK. Provides services for PaymentIntent creation, Checkout Sessions, and webhook verification.

## Install

```bash
npm install @catto/nest-payments
# or
yarn add @catto/nest-payments
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { CattoPaymentsModule } from '@catto/nest-payments';

@Module({
  imports: [
    CattoPaymentsModule.forRoot({
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    }),
  ],
})
export class AppModule {}
```

Inject the service in your controllers or providers:

```typescript
import { CattoPaymentsService } from '@catto/nest-payments';

@Injectable()
export class OrderService {
  constructor(private readonly payments: CattoPaymentsService) {}

  async createPayment(amount: number, currency: string) {
    return this.payments.createPaymentIntent({ amount, currency });
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

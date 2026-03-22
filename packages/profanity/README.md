# @catto/profanity

Multi-language profanity filter with Zod and NestJS support. Covers 12 languages (Arabic, Chinese, English, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish) with built-in false-positive whitelisting.

## Install

```bash
npm install @catto/profanity
# or
yarn add @catto/profanity
```

## Quick Start

```typescript
// Core usage
import { isProfane, censorText } from '@catto/profanity';

isProfane('hello');       // false
isProfane('badword');     // true
censorText('some text');  // censors profane words with asterisks

// Zod integration
import { noProfanityCheck, noProfanityMessage } from '@catto/profanity/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).refine(noProfanityCheck, noProfanityMessage('Name')),
});

// NestJS class-validator decorator
import { NoProfanity } from '@catto/profanity/nest';

class CreateUserDto {
  @NoProfanity()
  displayName: string;
}
```

## Sub-exports

| Entry Point | Description |
| --- | --- |
| `@catto/profanity` | Core filter + Zod + NestJS (all-in-one) |
| `@catto/profanity/zod` | Zod helpers only |
| `@catto/profanity/nest` | NestJS decorator only |

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `class-validator` | `>=0.14.0` | No |

## License

MIT

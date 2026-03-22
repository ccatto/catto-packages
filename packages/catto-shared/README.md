# @ccatto/shared

Reusable TypeScript utilities for profanity filtering, geolocation, and color manipulation.

## Install

```bash
npm install @ccatto/shared
# or
yarn add @ccatto/shared
```

## Quick Start

```typescript
import {
  isProfane,
  censorText,
  getDistanceKm,
  formatDistance,
  deriveThemeColors,
  hexToRgb,
} from '@ccatto/shared';

// Profanity filter (re-exported from @ccatto/profanity)
isProfane('hello');  // false

// Geo utilities
const km = getDistanceKm(40.7128, -74.006, 34.0522, -118.2437);
formatDistance(km);  // "2,451 mi"

// Color utilities for org branding
const theme = deriveThemeColors('#3B82F6');
// { base: '#3B82F6', hover: '...', active: '...', subtle: '...', onColor: '#ffffff' }

const rgb = hexToRgb('#FF5733');
// { r: 255, g: 87, b: 51 }
```

## Peer Dependencies

None.

## License

MIT

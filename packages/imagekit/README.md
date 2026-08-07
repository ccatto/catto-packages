# @ccatto/imagekit

Reusable [ImageKit](https://imagekit.io) helpers for React/Next.js apps: a
client uploader, URL transforms, ready-made React components, and a server-only
auth signer. **No keys are embedded** — the consuming app injects its public key
(client) and private key (server), so this package is safe to share across apps.

- **Client:** `uploadToImageKit`, `buildImageKitUrl`, `<ImageUploadCatto>`, `<ImageGalleryCatto>`
- **Server (`@ccatto/imagekit/server`):** `createImageKitAuthParams` — HMAC-SHA1
  upload-auth signer. Ships from a separate subpath so Node `crypto` and your
  private key never reach the client bundle.

## Install

```bash
yarn add @ccatto/imagekit
```

Peer deps: `react` / `react-dom` (>=18). No other runtime deps.

## Plug-n-play setup (3 steps)

### 1. Add the server auth route

The browser needs short-lived signed params to upload directly to ImageKit. Sign
them server-side with your **private** key (never shipped to the client):

```ts
// app/api/imagekit-auth/route.ts  (Next.js App Router)
import { NextResponse } from 'next/server';
import { createImageKitAuthParams } from '@ccatto/imagekit/server';

export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }
  return NextResponse.json(createImageKitAuthParams(privateKey));
}
```

`createImageKitAuthParams(privateKey, expireSeconds = 1800)` returns
`{ token, expire, signature }` — only those three values go to the browser.

### 2. Drop in the uploader

```tsx
import { ImageUploadCatto } from '@ccatto/imagekit';

<ImageUploadCatto
  publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
  folder="/pickle-paddle-reviews"
  value={imageUrl}
  onUploaded={(url) => setImageUrl(url)}
  onError={(err) => console.error(err)}
/>;
```

Or upload imperatively:

```ts
import { uploadToImageKit } from '@ccatto/imagekit';

const result = await uploadToImageKit(file, {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  folder: '/pickle-paddle-reviews',
  authUrl: '/api/imagekit-auth', // default
});
// result.url is the CDN URL
```

### 3. Set env vars

```bash
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxx   # safe in the client
IMAGEKIT_PRIVATE_KEY=private_xxx             # server only — never expose
```

## Displaying images

```tsx
import { ImageGalleryCatto, buildImageKitUrl } from '@ccatto/imagekit';

// Multi-image viewer with thumbnails (auto-applies ImageKit transforms).
<ImageGalleryCatto images={urls} alt="Paddle" mainWidth={800} thumbWidth={120} />;

// Or build a transformed URL directly.
const thumb = buildImageKitUrl(url, { width: 200, quality: 80, format: 'auto' });
```

`ImageKitTransform`: `{ width?, height?, quality?, format?: 'auto'|'webp'|'jpg'|'png'|'avif', crop? }`.
`buildImageKitUrl` returns non-ImageKit URLs unchanged, so it's safe to call on any `src`.

## Exports

| Import | From | Kind |
| --- | --- | --- |
| `uploadToImageKit`, `buildImageKitUrl` | `@ccatto/imagekit` | client helpers |
| `ImageUploadCatto`, `ImageGalleryCatto` | `@ccatto/imagekit` | React components |
| `createImageKitAuthParams` | `@ccatto/imagekit/server` | server-only signer |

## License

MIT

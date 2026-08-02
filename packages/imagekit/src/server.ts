// @ccatto/imagekit/server
//
// Server-only ImageKit upload-auth signer. The consuming app passes its OWN
// private key (from its server env) — this package embeds NO keys. Use inside a
// server route (e.g. a Next.js `app/api/imagekit-auth/route.ts`):
//
//   import { createImageKitAuthParams } from '@ccatto/imagekit/server';
//   export async function GET() {
//     const pk = process.env.IMAGEKIT_PRIVATE_KEY;
//     if (!pk) return NextResponse.json({ error: 'not configured' }, { status: 500 });
//     return NextResponse.json(createImageKitAuthParams(pk));
//   }

import crypto from 'crypto';

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

/**
 * Generate ImageKit client-upload auth params. Signs `token + expire` with the
 * caller-supplied private key (HMAC-SHA1). The private key never leaves the
 * server; only these three values go to the browser.
 */
export function createImageKitAuthParams(
  privateKey: string,
  expireSeconds = 1800,
): ImageKitAuthParams {
  if (!privateKey) {
    throw new Error('@ccatto/imagekit: privateKey is required');
  }
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + expireSeconds;
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');
  return { token, expire, signature };
}

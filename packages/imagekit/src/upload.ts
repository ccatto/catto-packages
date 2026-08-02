// @ccatto/imagekit — client upload (no secrets)
//
// Uploads a file to ImageKit from the browser. Gets short-lived auth from the
// app's own auth endpoint (which holds the private key server-side), then POSTs
// straight to ImageKit. The publicKey is public by design.

const DEFAULT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const DEFAULT_AUTH_URL = '/api/imagekit-auth';

export interface UploadImageOptions {
  /** ImageKit public key (safe in the client; e.g. NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY). */
  publicKey: string;
  /** Destination folder, e.g. '/pickle-paddle-reviews'. */
  folder?: string;
  /** Override the uploaded file name (defaults to the file's own name). */
  fileName?: string;
  /** App auth endpoint returning { token, expire, signature }. Default '/api/imagekit-auth'. */
  authUrl?: string;
  /** ImageKit upload endpoint (rarely overridden). */
  uploadUrl?: string;
}

export interface UploadImageResult {
  url: string;
  fileId: string;
  filePath: string;
  name: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size?: number;
}

/** Upload a file to ImageKit and return its CDN result (incl. `url`). */
export async function uploadToImageKit(
  file: File,
  options: UploadImageOptions,
): Promise<UploadImageResult> {
  if (!options.publicKey) {
    throw new Error('@ccatto/imagekit: publicKey is required');
  }

  const authRes = await fetch(options.authUrl ?? DEFAULT_AUTH_URL);
  if (!authRes.ok) {
    throw new Error('@ccatto/imagekit: could not get upload auth');
  }
  const { token, expire, signature } = await authRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('publicKey', options.publicKey);
  form.append('signature', signature);
  form.append('token', token);
  form.append('expire', String(expire));
  form.append('fileName', options.fileName ?? file.name);
  if (options.folder) form.append('folder', options.folder);

  const res = await fetch(options.uploadUrl ?? DEFAULT_UPLOAD_URL, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error(`@ccatto/imagekit: upload failed (${res.status})`);
  }
  return (await res.json()) as UploadImageResult;
}

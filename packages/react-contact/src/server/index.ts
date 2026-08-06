// @ccatto/react-contact/server
// Framework-agnostic contact-notification sender. Runs SERVER-SIDE ONLY — it
// holds the Telnyx secret and the captcha secret, so it must never be imported
// into client code. Ships from the `./server` subpath WITHOUT a "use client"
// directive (see tsup.config.ts). Zero framework deps — just `fetch` — so it
// works from Next.js route handlers, server actions, NestJS, Express, etc.

import type { ContactMessageInput } from '../types';

export type { ContactMessageInput } from '../types';

/** Telnyx SMS transport config. Falls back to env vars when omitted. */
export interface TelnyxSmsConfig {
  /** Telnyx API key (env: `TELNYX_API_KEY`). */
  apiKey?: string;
  /** Sender number in E.164 (env: `TELNYX_PHONE_NUMBER`). */
  phoneNumber?: string;
  /** Telnyx messaging profile ID (env: `TELNYX_MESSAGING_PROFILE_ID`). */
  messagingProfileId?: string;
  /** Owner/destination number in E.164 (env: `CONTACT_SMS_TO`). */
  to?: string;
}

/** Optional server-side captcha verification. */
export interface CaptchaConfig {
  /** Which provider issued the token. */
  provider: 'recaptcha' | 'turnstile';
  /** Provider secret key. */
  secret: string;
  /** reCAPTCHA v3 minimum score to accept (default 0.5). Ignored for Turnstile. */
  minScore?: number;
  /** Optional caller IP, forwarded to the verifier. */
  remoteIp?: string;
}

export interface SendContactMessageConfig {
  /** Telnyx transport config (defaults to env vars). */
  telnyx?: TelnyxSmsConfig;
  /**
   * Captcha verification. Pass explicitly, or omit to auto-detect from env:
   * `TURNSTILE_SECRET_KEY` -> turnstile, else `RECAPTCHA_SECRET_KEY` -> recaptcha.
   * If neither is provided, captcha verification is skipped.
   */
  captcha?: CaptchaConfig;
  /** Label prefixing the SMS body (default: "New contact"). */
  label?: string;
  /** Hard cap on SMS length (default 600). */
  maxLength?: number;
  /** Optional logger hook. */
  onLog?: (
    level: 'info' | 'warn' | 'error',
    message: string,
    meta?: unknown,
  ) => void;
}

export interface SendContactMessageResult {
  /** True when the message was accepted (sent, or silently skipped as spam). */
  ok: boolean;
  /** Present when the submission was dropped as spam via the honeypot. */
  skipped?: 'honeypot';
  /** Telnyx message id on success. */
  messageId?: string;
  /** Human-readable error when `ok` is false. */
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function telnyxFromEnv(): TelnyxSmsConfig {
  const env = (typeof process !== 'undefined' && process.env) || {};
  return {
    apiKey: env.TELNYX_API_KEY,
    phoneNumber: env.TELNYX_PHONE_NUMBER,
    messagingProfileId: env.TELNYX_MESSAGING_PROFILE_ID,
    to: env.CONTACT_SMS_TO,
  };
}

function captchaFromEnv(): CaptchaConfig | undefined {
  const env = (typeof process !== 'undefined' && process.env) || {};
  if (env.TURNSTILE_SECRET_KEY) {
    return { provider: 'turnstile', secret: env.TURNSTILE_SECRET_KEY };
  }
  if (env.RECAPTCHA_SECRET_KEY) {
    return { provider: 'recaptcha', secret: env.RECAPTCHA_SECRET_KEY };
  }
  return undefined;
}

/** Verify a captcha token. Returns true when the token is valid/absent-of-config. */
async function verifyCaptcha(
  token: string | undefined,
  captcha: CaptchaConfig,
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams();
  body.set('secret', captcha.secret);
  body.set('response', token);
  if (captcha.remoteIp) body.set('remoteip', captcha.remoteIp);

  const url =
    captcha.provider === 'turnstile'
      ? 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
      : 'https://www.google.com/recaptcha/api/siteverify';

  const res = await fetch(url, { method: 'POST', body });
  const data = (await res.json()) as { success?: boolean; score?: number };

  if (!data.success) return false;
  if (captcha.provider === 'recaptcha') {
    const min = captcha.minScore ?? 0.5;
    if (typeof data.score === 'number' && data.score < min) return false;
  }
  return true;
}

/**
 * Send a contact-form submission as an SMS to the site owner (via Telnyx),
 * with built-in honeypot spam filtering and optional captcha verification.
 *
 * Provide config explicitly or rely on the standard env vars:
 * `TELNYX_API_KEY`, `TELNYX_PHONE_NUMBER`, `TELNYX_MESSAGING_PROFILE_ID`,
 * `CONTACT_SMS_TO`, and optionally `TURNSTILE_SECRET_KEY` / `RECAPTCHA_SECRET_KEY`.
 *
 * @example
 * // Next.js app/api/contact/route.ts
 * export async function POST(req: Request) {
 *   const result = await sendContactMessage(await req.json());
 *   return Response.json({ ok: result.ok }, { status: result.ok ? 200 : 400 });
 * }
 */
export async function sendContactMessage(
  input: ContactMessageInput,
  config: SendContactMessageConfig = {},
): Promise<SendContactMessageResult> {
  const log = config.onLog ?? (() => {});

  // 1. Honeypot — a filled hidden field means a bot. Silently accept & drop.
  if (input.website && input.website.trim() !== '') {
    log('warn', 'Contact submission dropped by honeypot');
    return { ok: true, skipped: 'honeypot' };
  }

  // 2. Basic validation (defensive — the client already validates).
  const name = (input.name ?? '').trim();
  const email = (input.email ?? '').trim();
  const message = (input.message ?? '').trim();
  const phone = (input.phone ?? '').trim();

  if (!name || name.length > 100) return { ok: false, error: 'Invalid name' };
  if (!email || email.length > 200 || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: 'Invalid email' };
  }
  if (!message || message.length > 4000) {
    return { ok: false, error: 'Invalid message' };
  }
  if (phone.length > 40) return { ok: false, error: 'Invalid phone' };

  // 3. Captcha verification (explicit config, else auto-detect from env).
  const captcha = config.captcha ?? captchaFromEnv();
  if (captcha) {
    let passed = false;
    try {
      passed = await verifyCaptcha(input.token, captcha);
    } catch (err) {
      log('error', 'Captcha verification threw', { error: String(err) });
      return { ok: false, error: 'Captcha verification failed' };
    }
    if (!passed) {
      log('warn', 'Captcha verification rejected submission');
      return { ok: false, error: 'Captcha verification failed' };
    }
  }

  // 4. Send SMS via Telnyx.
  const telnyx = config.telnyx ?? telnyxFromEnv();
  const { apiKey, phoneNumber, messagingProfileId, to } = telnyx;

  if (!apiKey || !to) {
    log('error', 'Contact SMS not configured (missing apiKey or to)');
    return { ok: false, error: 'Contact SMS is not configured on this server' };
  }

  const label = config.label ?? 'New contact';
  const contact = phone ? `${email} · ${phone}` : email;
  const text = `${label}\nFrom: ${name} (${contact})\n${message}`.slice(
    0,
    config.maxLength ?? 600,
  );

  try {
    const res = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: phoneNumber,
        to,
        text,
        ...(messagingProfileId
          ? { messaging_profile_id: messagingProfileId }
          : {}),
      }),
    });

    const data = (await res.json()) as {
      data?: { id?: string };
      errors?: Array<{ detail?: string }>;
    };

    if (!res.ok) {
      const detail = data.errors?.[0]?.detail || 'Failed to send SMS via Telnyx';
      log('error', 'Telnyx API error', { status: res.status, detail });
      return { ok: false, error: detail };
    }

    log('info', 'Contact SMS sent', { messageId: data.data?.id });
    return { ok: true, messageId: data.data?.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send SMS';
    log('error', 'Telnyx send threw', { error: errorMsg });
    return { ok: false, error: errorMsg };
  }
}

/**
 * @ccatto/sms — runtime-agnostic SMS sender.
 *
 * Plain `fetch` against the Telnyx Messages API; works in any Node/Edge runtime
 * (Next.js route handlers, Better Auth `sendOtp`, serverless functions). No
 * NestJS dependency (use `@ccatto/nest-sms` inside a Nest app instead).
 *
 * SECRETS: this package never reads `process.env`. The caller passes `apiKey`
 * (and the sending identity) as arguments, so credentials stay in the consuming
 * app's environment and never live in this public package.
 */

const TELNYX_MESSAGES_URL = 'https://api.telnyx.com/v2/messages';

export interface SendSmsArgs {
  /** Telnyx v2 API key (read from the caller's env — never hard-coded here). */
  apiKey: string;
  /** Destination phone number in E.164 (e.g. `+15551234567`). */
  to: string;
  /** Message body. */
  text: string;
  /**
   * Sending number in E.164 (e.g. `+18335291569`). Provide this and/or
   * `messagingProfileId`; when both are set they are sent together so Telnyx
   * pins the sender to `from` and routes via the profile. Passing only
   * `messagingProfileId` makes Telnyx auto-pick a number from the profile pool,
   * which 422s when that selection fails (e.g. a lone toll-free number).
   */
  from?: string;
  /** Telnyx messaging profile ID. See `from` for why you usually pass both. */
  messagingProfileId?: string;
}

export interface SendSmsResult {
  /** Telnyx message id, when the API returns one. */
  id?: string;
}

export async function sendSms({
  apiKey,
  to,
  text,
  from,
  messagingProfileId,
}: SendSmsArgs): Promise<SendSmsResult> {
  if (!apiKey) {
    throw new Error('@ccatto/sms: `apiKey` is required.');
  }
  if (!from && !messagingProfileId) {
    throw new Error(
      '@ccatto/sms: provide `from` and/or `messagingProfileId` to send SMS.',
    );
  }

  const payload: Record<string, string> = { to, text };
  if (from) {
    payload.from = from;
  }
  if (messagingProfileId) {
    payload.messaging_profile_id = messagingProfileId;
  }

  const res = await fetch(TELNYX_MESSAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`@ccatto/sms: Telnyx send failed (${res.status}): ${body}`);
  }

  const data = (await res.json().catch(() => null)) as
    | { data?: { id?: string } }
    | null;
  return { id: data?.data?.id };
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendSms } from '../index';

const TELNYX_URL = 'https://api.telnyx.com/v2/messages';

function mockFetchOk(id = 'msg_123') {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ data: { id } }),
  });
}

describe('sendSms', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchOk());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('throws when apiKey is missing', async () => {
    await expect(
      sendSms({ apiKey: '', to: '+15551234567', text: 'hi', from: '+18335291569' }),
    ).rejects.toThrow(/apiKey/);
  });

  it('throws when neither from nor messagingProfileId is provided', async () => {
    await expect(
      sendSms({ apiKey: 'KEY', to: '+15551234567', text: 'hi' }),
    ).rejects.toThrow(/from.*messagingProfileId/);
  });

  it('sends both from and messaging_profile_id when both are set', async () => {
    const fetchMock = mockFetchOk();
    vi.stubGlobal('fetch', fetchMock);

    await sendSms({
      apiKey: 'KEY',
      to: '+15551234567',
      text: 'code 999',
      from: '+18335291569',
      messagingProfileId: 'profile-abc',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      TELNYX_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer KEY' }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      to: '+15551234567',
      text: 'code 999',
      from: '+18335291569',
      messaging_profile_id: 'profile-abc',
    });
  });

  it('omits from when only messagingProfileId is set', async () => {
    const fetchMock = mockFetchOk();
    vi.stubGlobal('fetch', fetchMock);

    await sendSms({
      apiKey: 'KEY',
      to: '+15551234567',
      text: 'hi',
      messagingProfileId: 'profile-abc',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messaging_profile_id).toBe('profile-abc');
    expect(body.from).toBeUndefined();
  });

  it('returns the Telnyx message id on success', async () => {
    vi.stubGlobal('fetch', mockFetchOk('msg_xyz'));
    const result = await sendSms({
      apiKey: 'KEY',
      to: '+15551234567',
      text: 'hi',
      from: '+18335291569',
    });
    expect(result).toEqual({ id: 'msg_xyz' });
  });

  it('throws with status and body on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => '{"errors":[{"detail":"no number on profile"}]}',
      }),
    );

    await expect(
      sendSms({
        apiKey: 'KEY',
        to: '+15551234567',
        text: 'hi',
        messagingProfileId: 'profile-abc',
      }),
    ).rejects.toThrow(/422.*no number on profile/);
  });
});

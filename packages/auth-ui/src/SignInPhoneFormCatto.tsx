'use client';

import { useEffect, useState } from 'react';
import {
  ButtonCatto,
  InputCatto,
  OtpInputCatto,
  PhoneInputCatto,
  getDialCode,
} from '@ccatto/ui';
import { useTranslations } from 'next-intl';

export interface SignInPhoneFormCattoProps {
  /**
   * Send an OTP to the given E.164 phone number. The caller owns the auth
   * client (e.g. `authClient.phoneNumber.sendOtp({ phoneNumber })`). Throw to
   * surface an error.
   */
  onSendOtp: (phoneNumber: string) => Promise<void>;
  /**
   * Verify the code for the phone number. Return `{ isNewUser }` so the form
   * can optionally collect a display name for brand-new accounts.
   */
  onVerifyOtp: (
    phoneNumber: string,
    code: string,
  ) => Promise<{ isNewUser?: boolean } | void>;
  /**
   * Optional: persist a display name for a newly-created phone user. When
   * omitted, the name step is skipped entirely.
   */
  onSaveName?: (name: string) => Promise<void>;
  /** Default country for the phone input (ISO code, default 'US'). */
  defaultCountry?: string;
  /** Seconds before "resend" is allowed again (default 30). */
  resendSeconds?: number;
  /**
   * next-intl namespace for labels (default `auth`). Keys used:
   * `phone.{phoneLabel,sendCode,sending,enterCode,sentTo,changeNumber,
   * resendCode,resendIn,verifying,errorGeneric}` and
   * `newUser.{welcome,yourName,enterName,saveName,saving,skipForNow}`.
   */
  i18nNamespace?: string;
}

type Step = 'phone' | 'otp' | 'name';

const SignInPhoneFormCatto = ({
  onSendOtp,
  onVerifyOtp,
  onSaveName,
  defaultCountry = 'US',
  resendSeconds = 30,
  i18nNamespace = 'auth',
}: SignInPhoneFormCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const [step, setStep] = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [rawDigits, setRawDigits] = useState('');
  const [formatted, setFormatted] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // E.164 number assembled from the selected country's dial code + digits.
  const e164 = `${getDialCode(countryCode)}${rawDigits.replace(/\D/g, '')}`;
  const canSend = rawDigits.replace(/\D/g, '').length >= 7;

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const sendOtp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onSendOtp(e164);
      setStep('otp');
      setCountdown(resendSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('phone.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await onVerifyOtp(e164, code);
      if (result?.isNewUser && onSaveName) {
        setStep('name');
      }
      // On success (existing user, or new user without a name step) the caller
      // redirects; we leave the form as-is.
    } catch (err) {
      setError(err instanceof Error ? err.message : t('phone.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveName = async (skip: boolean) => {
    if (!onSaveName) return;
    setError(null);
    setSubmitting(true);
    try {
      if (!skip && name.trim()) await onSaveName(name.trim());
      // Caller-side redirect handles navigation after this resolves.
    } catch (err) {
      setError(err instanceof Error ? err.message : t('phone.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {step === 'phone' && (
        <>
          <PhoneInputCatto
            label={t('phone.phoneLabel')}
            value={formatted}
            onChange={(raw, fmt) => {
              setRawDigits(raw);
              setFormatted(fmt);
            }}
            showCountryCode
            countryCode={countryCode}
            onCountryChange={(code) => setCountryCode(code)}
            error={error ?? undefined}
            autoFocus
          />
          <ButtonCatto
            variant="primary"
            width="full"
            onClick={sendOtp}
            disabled={submitting || !canSend}
            isLoading={submitting}
          >
            {submitting ? t('phone.sending') : t('phone.sendCode')}
          </ButtonCatto>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {t('phone.enterCode')}
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-50">
              {getDialCode(countryCode)} {formatted}
            </p>
          </div>
          <div className="flex justify-center py-2">
            <OtpInputCatto
              onComplete={verifyOtp}
              disabled={submitting}
              error={error ?? undefined}
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between">
            <ButtonCatto
              variant="ghost"
              width="auto"
              onClick={() => {
                setStep('phone');
                setError(null);
              }}
              disabled={submitting}
            >
              {t('phone.changeNumber')}
            </ButtonCatto>
            <ButtonCatto
              variant="ghost"
              width="auto"
              onClick={sendOtp}
              disabled={submitting || countdown > 0}
            >
              {countdown > 0
                ? t('phone.resendIn', { seconds: countdown })
                : t('phone.resendCode')}
            </ButtonCatto>
          </div>
        </>
      )}

      {step === 'name' && onSaveName && (
        <>
          <p className="text-center text-lg font-semibold text-gray-900 dark:text-gray-50">
            {t('newUser.welcome')}
          </p>
          <InputCatto
            label={t('newUser.yourName')}
            value={name}
            onChange={(value) => setName(value)}
            placeholder={t('newUser.enterName')}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex flex-row-reverse gap-3">
            <ButtonCatto
              variant="primary"
              width="full"
              onClick={() => saveName(false)}
              disabled={submitting || !name.trim()}
              isLoading={submitting}
            >
              {submitting ? t('newUser.saving') : t('newUser.saveName')}
            </ButtonCatto>
            <ButtonCatto
              variant="secondary"
              width="full"
              onClick={() => saveName(true)}
              disabled={submitting}
            >
              {t('newUser.skipForNow')}
            </ButtonCatto>
          </div>
        </>
      )}
    </div>
  );
};

export default SignInPhoneFormCatto;

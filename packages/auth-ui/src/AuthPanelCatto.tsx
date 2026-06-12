'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SocialButtonsCatto, {
  type SocialProvider,
} from './SocialButtonsCatto';
import SignInEmailPassFormCatto, {
  type SignInValues,
} from './SignInEmailPassFormCatto';
import SignInPhoneFormCatto from './SignInPhoneFormCatto';

export interface AuthPanelCattoProps {
  /** Social providers to offer. Omit/empty to hide the social section. */
  social?: SocialProvider[];
  /** Offer phone-number + OTP sign-in. */
  phone?: boolean;
  /** Offer email + password sign-in (default true). */
  emailPassword?: boolean;

  /** Social: called with the chosen provider (caller owns the auth client). */
  onProvider?: (provider: SocialProvider) => Promise<void> | void;
  /** Email/password: called on submit. */
  onEmailSubmit?: (values: SignInValues) => Promise<void> | void;
  /** Phone: send OTP to the E.164 number. */
  onSendOtp?: (phoneNumber: string) => Promise<void>;
  /** Phone: verify the code; return `{ isNewUser }` to trigger the name step. */
  onVerifyOtp?: (
    phoneNumber: string,
    code: string,
  ) => Promise<{ isNewUser?: boolean } | void>;
  /** Phone: optionally persist a display name for a brand-new user. */
  onSaveName?: (name: string) => Promise<void>;

  /** Default country for the phone input (ISO code, default 'US'). */
  defaultCountry?: string;
  /**
   * next-intl namespace (default `auth`). See SocialButtonsCatto /
   * SignInEmailPassFormCatto / SignInPhoneFormCatto for the keys each section
   * reads; this panel additionally uses `signIn.{or,phone,email}`.
   */
  i18nNamespace?: string;
}

const AuthPanelCatto = ({
  social = [],
  phone = false,
  emailPassword = true,
  onProvider,
  onEmailSubmit,
  onSendOtp,
  onVerifyOtp,
  onSaveName,
  defaultCountry = 'US',
  i18nNamespace = 'auth',
}: AuthPanelCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const showSocial = social.length > 0 && !!onProvider;
  const showEmail = emailPassword && !!onEmailSubmit;
  const showPhone = phone && !!onSendOtp && !!onVerifyOtp;
  const showTabs = showEmail && showPhone;
  const [method, setMethod] = useState<'email' | 'phone'>(
    showEmail ? 'email' : 'phone',
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {showSocial && (
        <SocialButtonsCatto
          providers={social}
          onProvider={onProvider!}
          i18nNamespace={i18nNamespace}
        />
      )}

      {showSocial && (showEmail || showPhone) && (
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('signIn.or')}
          </span>
          <span className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {showTabs && (
        <div
          className="flex border-b border-gray-300 dark:border-gray-700"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={method === 'email'}
            onClick={() => setMethod('email')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              method === 'email'
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {t('signIn.email')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === 'phone'}
            onClick={() => setMethod('phone')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              method === 'phone'
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {t('signIn.phone')}
          </button>
        </div>
      )}

      {showEmail && (!showTabs || method === 'email') && (
        <SignInEmailPassFormCatto
          onSubmit={onEmailSubmit!}
          i18nNamespace={i18nNamespace}
        />
      )}

      {showPhone && (!showTabs || method === 'phone') && (
        <SignInPhoneFormCatto
          onSendOtp={onSendOtp!}
          onVerifyOtp={onVerifyOtp!}
          onSaveName={onSaveName}
          defaultCountry={defaultCountry}
          i18nNamespace={i18nNamespace}
        />
      )}
    </div>
  );
};

export default AuthPanelCatto;

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type SocialProvider = 'google' | 'facebook' | 'apple' | 'github';

export interface SocialButtonsCattoProps {
  /**
   * Which provider buttons to render, in order. Only the providers listed here
   * appear — this is how a consuming app opts in to specific socials.
   */
  providers: SocialProvider[];
  /**
   * Called with the chosen provider when a button is clicked. The caller owns
   * the auth client (e.g. `authClient.signIn.social({ provider })`) and any
   * navigation. Throw/reject to surface an error under the buttons.
   */
  onProvider: (provider: SocialProvider) => Promise<void> | void;
  /**
   * next-intl namespace for labels. Expects the key `social.continueWith`
   * with a `{provider}` ICU argument (e.g. "Continue with {provider}").
   * Defaults to `auth`.
   */
  i18nNamespace?: string;
  /** Wrapper className override. */
  className?: string;
}

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  github: 'GitHub',
};

// Per-provider button styling (light + dark). Kept close to the rleaguez look:
// rounded-full, branded fill, subtle hover scale.
const PROVIDER_CLASS: Record<SocialProvider, string> = {
  google:
    'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white',
  facebook:
    'border-[#1877F2] bg-[#1877F2] text-white hover:bg-[#166fe0] dark:border-[#1877F2] dark:bg-[#1877F2] dark:hover:bg-[#3b8bf5]',
  apple:
    'border-black bg-black text-white hover:bg-gray-900 dark:border-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200',
  github:
    'border-gray-700 bg-gray-800 text-white hover:bg-gray-700 dark:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600',
};

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  const common = 'h-5 w-5 shrink-0';
  switch (provider) {
    case 'google':
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
        </svg>
      );
    case 'apple':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.37 1.43c0 1.14-.42 2.22-1.16 3.04-.79.88-2.09 1.56-3.18 1.47-.13-1.09.43-2.25 1.13-3.02.79-.86 2.18-1.5 3.21-1.49zM20.4 17.2c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.12 3.54-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.01-3.05-1.78-4.04-3.35-2.77-4.4-3.06-9.56-1.35-12.3 1.21-1.95 3.13-3.09 4.93-3.09 1.84 0 2.99 1 4.51 1 1.47 0 2.37-1 4.5-1 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.21 9.3z" />
        </svg>
      );
    case 'github':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
        </svg>
      );
  }
}

const SocialButtonsCatto = ({
  providers,
  onProvider,
  i18nNamespace = 'auth',
  className,
}: SocialButtonsCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (provider: SocialProvider) => {
    setError(null);
    setPending(provider);
    try {
      await onProvider(provider);
      // On success the caller typically redirects, so we leave the button
      // in its pending state rather than flickering back.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(null);
    }
  };

  return (
    <div className={className ?? 'flex w-full flex-col gap-3'}>
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => handleClick(provider)}
          disabled={pending !== null}
          aria-label={t('social.continueWith', {
            provider: PROVIDER_LABEL[provider],
          })}
          className={`flex w-full items-center justify-center gap-3 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60 ${PROVIDER_CLASS[provider]}`}
        >
          {pending === provider ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <ProviderIcon provider={provider} />
          )}
          <span>
            {t('social.continueWith', { provider: PROVIDER_LABEL[provider] })}
          </span>
        </button>
      ))}
      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default SocialButtonsCatto;

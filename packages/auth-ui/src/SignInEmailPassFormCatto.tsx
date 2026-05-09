'use client';

import { useState } from 'react';
import { ButtonCatto, InputCatto } from '@ccatto/ui';
import { useTranslations } from 'next-intl';

export interface SignInValues {
  email: string;
  password: string;
}

export interface SignInEmailPassFormCattoProps {
  /**
   * Called with `{ email, password }` when the user submits the form. Throw
   * (or reject) to surface an error message in the form. The component owns
   * its own loading + error UI; the caller owns the auth client and any
   * navigation that should happen on success.
   */
  onSubmit: (values: SignInValues) => Promise<void> | void;
  /**
   * next-intl namespace this form's labels are read from. The keys it expects
   * inside the namespace are `signIn.cardTitle`, `signIn.emailLabel`,
   * `signIn.passwordLabel`, `signIn.submit`, `signIn.submitting`,
   * `signIn.errorGeneric`. Defaults to `auth`.
   */
  i18nNamespace?: string;
}

const SignInEmailPassFormCatto = ({
  onSubmit,
  i18nNamespace = 'auth',
}: SignInEmailPassFormCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signIn.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <InputCatto
        type="email"
        label={t('signIn.emailLabel')}
        value={email}
        onChange={(value) => setEmail(value)}
        required
        autoComplete="email"
      />
      <InputCatto
        type="password"
        label={t('signIn.passwordLabel')}
        value={password}
        onChange={(value) => setPassword(value)}
        required
        autoComplete="current-password"
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <ButtonCatto type="submit" variant="primary" disabled={submitting}>
        {submitting ? t('signIn.submitting') : t('signIn.submit')}
      </ButtonCatto>
    </form>
  );
};

export default SignInEmailPassFormCatto;

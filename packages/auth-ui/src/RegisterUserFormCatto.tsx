'use client';

import { useState } from 'react';
import { ButtonCatto, InputCatto } from '@ccatto/ui';
import { useTranslations } from 'next-intl';

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserFormCattoProps {
  /**
   * Called with `{ name, email, password }` when the user submits the form.
   * Throw (or reject) to surface an error message. The component owns its
   * own loading + error UI; the caller owns the auth client and any
   * post-register navigation.
   */
  onSubmit: (values: RegisterValues) => Promise<void> | void;
  /**
   * next-intl namespace this form's labels are read from. The keys it expects
   * inside the namespace are `register.nameLabel`, `register.emailLabel`,
   * `register.passwordLabel`, `register.submit`, `register.submitting`,
   * `register.errorGeneric`. Defaults to `auth`.
   */
  i18nNamespace?: string;
}

const RegisterUserFormCatto = ({
  onSubmit,
  i18nNamespace = 'auth',
}: RegisterUserFormCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('register.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <InputCatto
        type="text"
        label={t('register.nameLabel')}
        value={name}
        onChange={(value) => setName(value)}
        required
        autoComplete="name"
      />
      <InputCatto
        type="email"
        label={t('register.emailLabel')}
        value={email}
        onChange={(value) => setEmail(value)}
        required
        autoComplete="email"
      />
      <InputCatto
        type="password"
        label={t('register.passwordLabel')}
        value={password}
        onChange={(value) => setPassword(value)}
        required
        autoComplete="new-password"
        minLength={8}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <ButtonCatto type="submit" variant="primary" disabled={submitting}>
        {submitting ? t('register.submitting') : t('register.submit')}
      </ButtonCatto>
    </form>
  );
};

export default RegisterUserFormCatto;

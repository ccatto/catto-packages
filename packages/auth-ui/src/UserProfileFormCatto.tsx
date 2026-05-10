'use client';

import { useEffect, useState } from 'react';
import { ButtonCatto, InputCatto } from '@ccatto/ui';
import { useTranslations } from 'next-intl';

export interface ProfileValues {
  name: string;
  email: string;
}

export interface UserProfileFormCattoProps {
  /** Pre-fills the form. The component re-syncs if `initialValues` changes. */
  initialValues: ProfileValues;
  /**
   * Called with the edited `{ name, email }` when the user saves. Throw (or
   * reject) to surface an error in the form's red-text region. The form
   * shows a transient "Saved" confirmation on success and stays in place —
   * navigation, if any, is the caller's responsibility.
   */
  onSubmit: (values: ProfileValues) => Promise<void> | void;
  /**
   * next-intl namespace this form's labels are read from. The keys it expects
   * inside the namespace are `profile.cardTitle`, `profile.nameLabel`,
   * `profile.emailLabel`, `profile.submit`, `profile.submitting`,
   * `profile.errorGeneric`, `profile.successMessage`. Defaults to `auth`.
   */
  i18nNamespace?: string;
}

const UserProfileFormCatto = ({
  initialValues,
  onSubmit,
  i18nNamespace = 'auth',
}: UserProfileFormCattoProps) => {
  const t = useTranslations(i18nNamespace);
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Re-sync if the parent provides a different initialValues (e.g. session
  // refetched after a save).
  useEffect(() => {
    setName(initialValues.name);
    setEmail(initialValues.email);
  }, [initialValues.name, initialValues.email]);

  const dirty =
    name.trim() !== initialValues.name.trim() ||
    email.trim() !== initialValues.email.trim();

  const canSubmit =
    dirty && name.trim().length > 0 && email.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <InputCatto
        type="text"
        label={t('profile.nameLabel')}
        value={name}
        onChange={(value) => setName(value)}
        required
        autoComplete="name"
      />
      <InputCatto
        type="email"
        label={t('profile.emailLabel')}
        value={email}
        onChange={(value) => setEmail(value)}
        required
        autoComplete="email"
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && !error && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {t('profile.successMessage')}
        </p>
      )}
      <ButtonCatto type="submit" variant="primary" disabled={!canSubmit}>
        {submitting ? t('profile.submitting') : t('profile.submit')}
      </ButtonCatto>
    </form>
  );
};

export default UserProfileFormCatto;

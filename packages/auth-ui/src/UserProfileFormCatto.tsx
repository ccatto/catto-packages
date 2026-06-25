'use client';

import { useEffect, useState } from 'react';
import { ButtonCatto, InputCatto, PhoneDisplayCatto } from '@ccatto/ui';
import { useTranslations } from 'next-intl';

export interface ProfileValues {
  name: string;
  email: string;
}

export interface UserProfileFormCattoProps {
  /** Pre-fills the form. The component re-syncs if `initialValues` changes. */
  initialValues: ProfileValues;
  /**
   * Whether to render the email field at all. Set false for phone-first
   * accounts that have no real email (so the synthetic placeholder address is
   * never shown and email isn't required to save). Defaults to true.
   */
  showEmail?: boolean;
  /**
   * Verified phone number (E.164). When provided, renders a read-only
   * "Phone" row above the email field. Phone changes happen via re-verifying,
   * not this form, so it's display-only.
   */
  phoneNumber?: string;
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
  showEmail = true,
  phoneNumber,
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
    (showEmail && email.trim() !== initialValues.email.trim());

  const canSubmit =
    dirty &&
    name.trim().length > 0 &&
    (!showEmail || email.trim().length > 0) &&
    !submitting;

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
        placeholder={t('profile.namePlaceholder')}
        required
        autoComplete="name"
      />
      {phoneNumber && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('profile.phoneLabel')}
          </span>
          <PhoneDisplayCatto
            value={phoneNumber}
            format="international"
            className="text-sm text-gray-900 dark:text-gray-50"
          />
        </div>
      )}
      {showEmail && (
        <InputCatto
          type="email"
          label={t('profile.emailLabel')}
          value={email}
          onChange={(value) => setEmail(value)}
          required
          autoComplete="email"
        />
      )}
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

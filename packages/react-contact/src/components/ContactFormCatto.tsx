// @ccatto/react-contact — ContactFormCatto
// Drop-in "Contact us" form. Renders name / email / phone / message, validates
// with the built-in Zod schema + React Hook Form (via useContactForm), and
// POSTs a friendly JSON body to your endpoint (default `/api/contact`) — or a
// custom onSubmit. Includes a honeypot field and optional reCAPTCHA v3.
// Transport-agnostic: it never imports Apollo/GraphQL/fetch clients.
'use client';

import React, { useRef } from 'react';
import { useContactForm } from '../hooks/useContactForm';
import type { ContactFormData, ContactMessageInput } from '../types';

export interface ContactFormCattoProps {
  /**
   * Endpoint to POST the JSON body to. Default `/api/contact`. Ignored when
   * `onSubmit` is provided. Pair with the `sendContactMessage()` helper from
   * `@ccatto/react-contact/server` in your route handler.
   */
  action?: string;
  /**
   * Custom submit handler (e.g. a GraphQL mutation). Receives the friendly wire
   * shape including the honeypot value and captcha token. Overrides `action`.
   */
  onSubmit?: (data: ContactMessageInput) => Promise<void>;
  /** reCAPTCHA v3 site key. Omit to disable reCAPTCHA. */
  recaptchaSiteKey?: string;

  // ---- Copy (all optional, defaults shown) ----
  title?: string;
  description?: string;
  /** The blue "real inbox" note banner. Set `hideNote` to remove it. */
  note?: string;
  hideNote?: boolean;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  sendingLabel?: string;
  successMessage?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  messagePlaceholder?: string;

  /** Require the message field (default true). */
  requireMessage?: boolean;
  /** Extra classes for the outer wrapper. */
  className?: string;
  'data-testid'?: string;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-50 dark:placeholder-gray-500';
const labelCls =
  'block text-sm font-medium text-gray-700 dark:text-gray-200';

const Asterisk = () => <span className="text-red-500"> *</span>;

/**
 * ContactFormCatto — plug-n-play "Contact us" form.
 *
 * @example
 * <ContactFormCatto />                       // POSTs to /api/contact
 * <ContactFormCatto action="/api/support" /> // custom endpoint
 * <ContactFormCatto onSubmit={submitViaGraphQL} recaptchaSiteKey={KEY} />
 */
export const ContactFormCatto: React.FC<ContactFormCattoProps> = ({
  action = '/api/contact',
  onSubmit,
  recaptchaSiteKey,
  title = 'Contact us',
  description = 'Fill out the form and we will reply to the email you provide.',
  note = '📱 This is a real inbox — a text hits my phone the moment you send this, and I read every message.',
  hideNote = false,
  nameLabel = 'Your name',
  emailLabel = 'Your email',
  phoneLabel = 'Your phone (optional)',
  messageLabel = 'Message',
  submitLabel = 'Send message',
  sendingLabel = 'Sending…',
  successMessage = "Thanks! Your message is on its way — I'll be in touch soon.",
  namePlaceholder = '',
  emailPlaceholder = 'you@example.com',
  phonePlaceholder = '(555) 123-4567',
  messagePlaceholder = '',
  requireMessage = true,
  className,
  'data-testid': testId,
}) => {
  // Honeypot: a hidden field real users never fill. Read at submit time.
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isSuccess,
    formError,
  } = useContactForm({
    // The visual form has no "subject" field and requires email; message
    // requiredness is configurable.
    schema: {
      fields: {
        subject: { enabled: false },
        senderEmail: { required: true },
        message: {
          required: requireMessage,
          minLength: requireMessage ? 1 : 0,
        },
      },
    },
    recaptchaSiteKey,
    onSubmit: async (data: ContactFormData, token?: string) => {
      const payload: ContactMessageInput = {
        name: data.senderName,
        email: data.senderEmail ?? '',
        phone: data.senderPhone,
        message: data.message,
        website: honeypotRef.current?.value || undefined,
        token,
      };

      if (onSubmit) {
        await onSubmit(payload);
        return;
      }

      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {
          /* non-JSON error response — keep the default message */
        }
        throw new Error(message);
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit}
      className={['w-full space-y-5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {!hideNote && note && (
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          {note}
        </p>
      )}

      {isSuccess ? (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300"
        >
          {successMessage}
        </p>
      ) : (
        <>
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="ccatto-contact-name" className={labelCls}>
              {nameLabel}
              <Asterisk />
            </label>
            <input
              id="ccatto-contact-name"
              type="text"
              placeholder={namePlaceholder}
              className={inputCls}
              aria-invalid={!!errors.senderName}
              {...register('senderName')}
            />
            {errors.senderName?.message && (
              <p className="text-xs text-red-500">{errors.senderName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="ccatto-contact-email" className={labelCls}>
              {emailLabel}
              <Asterisk />
            </label>
            <input
              id="ccatto-contact-email"
              type="email"
              placeholder={emailPlaceholder}
              className={inputCls}
              aria-invalid={!!errors.senderEmail}
              {...register('senderEmail')}
            />
            {errors.senderEmail?.message && (
              <p className="text-xs text-red-500">
                {errors.senderEmail.message}
              </p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="ccatto-contact-phone" className={labelCls}>
              {phoneLabel}
            </label>
            <input
              id="ccatto-contact-phone"
              type="tel"
              placeholder={phonePlaceholder}
              className={inputCls}
              aria-invalid={!!errors.senderPhone}
              {...register('senderPhone')}
            />
            {errors.senderPhone?.message && (
              <p className="text-xs text-red-500">
                {errors.senderPhone.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="ccatto-contact-message" className={labelCls}>
              {messageLabel}
              {requireMessage && <Asterisk />}
            </label>
            <textarea
              id="ccatto-contact-message"
              rows={5}
              maxLength={4000}
              placeholder={messagePlaceholder}
              className={`${inputCls} resize-y`}
              aria-invalid={!!errors.message}
              {...register('message')}
            />
            {errors.message?.message && (
              <p className="text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Honeypot — visually hidden, off the a11y tree, not autofilled. */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900"
          >
            {isSubmitting ? sendingLabel : submitLabel}
          </button>
        </>
      )}
    </form>
  );
};

export default ContactFormCatto;

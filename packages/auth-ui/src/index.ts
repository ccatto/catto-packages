/**
 * @ccatto/auth-ui
 *
 * Presentational React forms for authentication flows. Bring your own auth
 * client — the components don't import Better Auth, JWT, or any other backend.
 * Pass an `onSubmit` callback that does the auth call (and any navigation),
 * and the form handles the loading + error UI.
 *
 * @example
 *   // app/[locale]/(public)/signin/page.tsx
 *   'use client';
 *   import { LoginCatto } from '@ccatto/auth-ui';
 *   import { signIn } from '@/lib/auth-client-better';
 *   import { useRouter } from '@/navigation';
 *
 *   export default function Page() {
 *     const router = useRouter();
 *     return (
 *       <LoginCatto
 *         onSubmit={async ({ email, password }) => {
 *           const result = await signIn.email({ email, password });
 *           if (result?.error) throw new Error(result.error.message);
 *           router.push('/dashboard');
 *         }}
 *       />
 *     );
 *   }
 *
 * Translation keys (default namespace `auth`):
 * - `signIn.{cardTitle, emailLabel, passwordLabel, submit, submitting, errorGeneric}`
 * - `register.{nameLabel, emailLabel, passwordLabel, submit, submitting, errorGeneric}`
 *
 * Social + phone + panel (added in 0.3.0):
 * - `social.continueWith` — ICU string with a `{provider}` arg, e.g. "Continue with {provider}"
 * - `signIn.{or, email, phone}` — AuthPanelCatto divider + tab labels
 * - `phone.{phoneLabel, sendCode, sending, enterCode, changeNumber, resendCode, resendIn, verifying, errorGeneric}`
 * - `newUser.{welcome, yourName, enterName, saveName, saving, skipForNow}`
 */

export { default as LoginCatto } from './LoginCatto';
export type { LoginCattoProps } from './LoginCatto';
export { default as SignInEmailPassFormCatto } from './SignInEmailPassFormCatto';
export type {
  SignInEmailPassFormCattoProps,
  SignInValues,
} from './SignInEmailPassFormCatto';
export { default as SocialButtonsCatto } from './SocialButtonsCatto';
export type {
  SocialButtonsCattoProps,
  SocialProvider,
} from './SocialButtonsCatto';
export { default as SignInPhoneFormCatto } from './SignInPhoneFormCatto';
export type { SignInPhoneFormCattoProps } from './SignInPhoneFormCatto';
export { default as AuthPanelCatto } from './AuthPanelCatto';
export type { AuthPanelCattoProps } from './AuthPanelCatto';
export { default as RegisterUserFormCatto } from './RegisterUserFormCatto';
export type {
  RegisterUserFormCattoProps,
  RegisterValues,
} from './RegisterUserFormCatto';
export { default as UserProfileFormCatto } from './UserProfileFormCatto';
export type {
  UserProfileFormCattoProps,
  ProfileValues,
} from './UserProfileFormCatto';

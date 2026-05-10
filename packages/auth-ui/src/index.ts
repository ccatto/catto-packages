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
 */

export { default as LoginCatto } from './LoginCatto';
export type { LoginCattoProps } from './LoginCatto';
export { default as SignInEmailPassFormCatto } from './SignInEmailPassFormCatto';
export type {
  SignInEmailPassFormCattoProps,
  SignInValues,
} from './SignInEmailPassFormCatto';
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

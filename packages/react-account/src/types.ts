// @ccatto/react-account — shared types
//
// Dual-auth aware: the app populates this unified shape whether the user signed in
// via Better Auth (OAuth) or JWT (phone/email). Transport-agnostic — the app
// injects async callbacks; this package ships no data client and no secrets.

export interface AccountUser {
  id: string;
  name?: string | null;
  email?: string | null;
  /** E.164 phone number, or null/undefined if none on file. */
  phone?: string | null;
  /** Avatar URL. */
  image?: string | null;
  /** Whether the user has a password credential. */
  hasPassword?: boolean;
  /** Whether the user has at least one OAuth/social account. */
  hasOAuth?: boolean;
  /** Whether the user has at least one passkey/WebAuthn credential. */
  hasPasskey?: boolean;
}

/** A blocked user, as returned by your query. */
export interface BlockedUser {
  id: string;
  name?: string | null;
  username?: string | null;
}

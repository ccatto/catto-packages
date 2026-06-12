/**
 * @ccatto/react-auth - Configuration Types
 *
 * Interfaces for configuring the auth system.
 * Consumer apps pass these configs to factory functions.
 */

// =============================================================================
// Server-Side Config (createCattoAuth)
// =============================================================================

export interface CattoAuthSocialProvider {
  clientId: string;
  clientSecret: string;
  scope?: string[];
}

/** Phone-number + OTP auth config (Better Auth `phoneNumber` plugin). */
export interface CattoAuthPhoneConfig {
  /** Master switch — when false/undefined the plugin is not registered. */
  enabled?: boolean;
  /**
   * Deliver the OTP code via SMS. The app owns the transport (Telnyx, Twilio, etc.).
   * Throw/reject to surface a send failure to the caller.
   */
  sendOtp: (args: { phoneNumber: string; code: string }) => Promise<void>;
  /**
   * Domain used to mint a synthetic email for phone-only users on first verify
   * (Better Auth requires an email). Default: 'phone.catto.local'.
   */
  tempEmailDomain?: string;
  /** Require phone verification before the number is trusted. Default: true. */
  requireVerification?: boolean;
  /** OTP lifetime in seconds. Default: Better Auth's default (300). */
  otpExpiresInSeconds?: number;
}

/** Minimal database client interface — compatible with PrismaClient without version coupling */
export interface CattoAuthDatabaseClient {
  user: {
    findUnique(args: Record<string, unknown>): Promise<unknown>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
  [key: string]: unknown;
}

export interface CattoAuthServerConfig {
  /** Prisma client instance (or any compatible ORM client) */
  database: CattoAuthDatabaseClient;
  /** Database provider type */
  databaseProvider: 'postgresql' | 'mysql' | 'sqlite';
  /** Secret for signing tokens (BETTER_AUTH_SECRET) */
  secret: string;
  /** Base URL for auth callbacks (BETTER_AUTH_URL) */
  baseURL: string;

  /** OAuth social providers */
  socialProviders?: {
    google?: CattoAuthSocialProvider;
    facebook?: CattoAuthSocialProvider;
    github?: CattoAuthSocialProvider;
    apple?: CattoAuthSocialProvider;
  };

  /**
   * Phone-number + OTP authentication (Better Auth `phoneNumber` plugin).
   * Optional — only enabled when `enabled` is true and a `sendOtp` transport
   * is provided. The app owns the SMS transport (Telnyx, Twilio, etc.).
   */
  phoneAuth?: CattoAuthPhoneConfig;

  /** Session configuration */
  session?: {
    /** Session expiry in seconds (default: 69 days = 5961600) */
    expiresInSeconds?: number;
  };

  /** Email/password authentication */
  emailAndPassword?: {
    enabled: boolean;
    requireEmailVerification?: boolean;
  };

  /** Advanced options */
  advanced?: {
    useSecureCookies?: boolean;
  };

  /** Pluggable hooks for domain-specific logic */
  hooks?: {
    /**
     * Called to enrich the session with custom fields (e.g., playerID, organizations).
     * Return an object that gets merged into session.user.
     */
    enrichSession?: (
      userId: string,
      db: unknown,
    ) => Promise<Record<string, unknown>>;

    /**
     * Called after a new user is created (e.g., create domain-specific records).
     */
    onUserCreated?: (
      user: { id: string; email: string; name?: string | null },
      db: unknown,
    ) => Promise<void>;
  };

  /** Optional logger for auth events (hook errors, warnings) */
  logger?: {
    warn: (message: string, data?: Record<string, unknown>) => void;
  };
}

// =============================================================================
// Client-Side Config (createCattoAuthClient)
// =============================================================================

export interface CattoAuthClientConfig {
  /** Base URL for auth API calls (default: NEXT_PUBLIC_BASE_URL or http://localhost:3000) */
  baseURL?: string;
  /** Endpoint for enriched session data (default: '/api/auth/session/enriched') */
  enrichedSessionEndpoint?: string;
}

// =============================================================================
// Session Provider Config
// =============================================================================

export interface CattoSessionProviderConfig {
  /** Seconds between session refetches (default: 300 = 5 min) */
  refetchInterval?: number;
  /** Endpoint for enriched session data (default: '/api/auth/session/enriched') */
  enrichedSessionEndpoint?: string;
}

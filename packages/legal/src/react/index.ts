// @ccatto/legal/react
//
// Presentational, headless legal-acceptance gate. It does NOT fetch, does NOT know
// about GraphQL, and has NO hardcoded copy — every visible string is injected via
// `labels`, and links are app-supplied via `renderLink` so the app can route
// IN-APP (critical for Capacitor: bouncing to Safari mid-signup breaks the flow).
'use client';

export { useLegalAcceptance } from './useLegalAcceptance';
export type {
  AcceptedVersion,
  UseLegalAcceptanceReturn,
} from './useLegalAcceptance';

export { LegalAcceptanceGate } from './LegalAcceptanceGate';
export type {
  LegalAcceptanceGateProps,
  LegalAcceptanceLabels,
} from './LegalAcceptanceGate';

export interface InAppAuthStartOptions {
  /** The URL to load in the system auth browser (the provider authorization URL). */
  url: string;
  /** The custom URL scheme that signals completion (e.g. "myapp"). */
  callbackScheme: string;
}

export interface InAppAuthStartResult {
  /** The full callback URL the web flow redirected to, e.g. "myapp://auth-callback?code=…". */
  url: string;
}

export interface InAppAuthPlugin {
  /**
   * Presents ASWebAuthenticationSession for `url` and resolves with the callback
   * URL once the web flow redirects to a URL using `callbackScheme`. Rejects with
   * code "CANCELED" if the user dismisses the sheet.
   */
  start(options: InAppAuthStartOptions): Promise<InAppAuthStartResult>;
}

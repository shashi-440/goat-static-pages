/**
 * Stub of amber-user-website's utils/webviewEvents.
 *
 * The real module bridges to the native app shell over a webview postMessage
 * channel. CustomLink only calls it when `openInExternalBrowserOfApp` is set,
 * which the ported v2 page never does — so this is a no-op that keeps the
 * verbatim CustomLink compiling.
 */
export const sendWebViewEvent = (_event: string, _payload?: Record<string, unknown>): void => {
  /* no-op outside the native app shell */
};

export default sendWebViewEvent;

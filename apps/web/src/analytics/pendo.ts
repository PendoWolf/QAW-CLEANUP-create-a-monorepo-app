// Pendo Track Events for outcomes a Feature click or Page load can't show (an API call succeeding, what changed,
// how long a reply took). The Pendo agent attaches the visitor and account to each event itself.
export type TrackEventProperties = Record<string, string | number | boolean | string[]>;

interface PendoAgent {
  track: (event: string, properties?: TrackEventProperties) => void;
}

declare global {
  interface Window {
    /** The Pendo agent, present once the Pendo install snippet has loaded. */
    pendo?: PendoAgent;
  }
}

/** Sends a Pendo Track Event. Does nothing when the Pendo agent isn't loaded, and never throws. */
export function trackEvent(event: string, properties: TrackEventProperties): void {
  const pendo = window.pendo;
  if (!pendo) return;
  try {
    pendo.track(event, properties);
  } catch {
    // Analytics must never break the app.
  }
}

/** Shortens free text (such as an error message) so the event's properties stay within Pendo's size limit. */
export function truncateForTracking(text: string, maxLength = 100): string {
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

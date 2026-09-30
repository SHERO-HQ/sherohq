"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_EVENT, readConsent, saveConsent } from "@/lib/analytics";

const configured = Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_CLARITY_ID);

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

/** Lets visitors change their analytics choice at any time (Cookies page). */
export function ConsentSettings() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => undefined);

  if (!configured) {
    return <p className="text-ink-secondary">Analytics isn&rsquo;t switched on, so no analytics cookies are set.</p>;
  }
  if (consent === undefined) return null;

  const status =
    consent === "granted" ? "You've allowed analytics." : consent === "denied" ? "You've declined analytics." : "You haven't chosen yet.";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <p role="status" className="font-medium text-ink">
        {status}
      </p>
      <div className="flex gap-2">
        {consent !== "denied" && (
          <button
            type="button"
            onClick={() => {
              saveConsent("denied");
              // Scripts already running stop only on a fresh page load.
              if (consent === "granted") location.reload();
            }}
            className="h-9 rounded-sm border border-border-strong px-4 text-label text-primary hover:border-primary"
          >
            Decline analytics
          </button>
        )}
        {consent !== "granted" && (
          <button
            type="button"
            onClick={() => saveConsent("granted")}
            className="h-9 rounded-sm bg-primary-fill px-4 text-label text-on-primary-fill hover:bg-primary-fill-hover"
          >
            Allow analytics
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, saveConsent, type Consent } from "@/lib/analytics";
import { routes } from "@/lib/site";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/** Cookie notice plus the analytics scripts it gates. */
export function Analytics() {
  // undefined until the cookie has been read, so the notice never flashes.
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    // Reading the cookie has to wait until the page is in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readConsent());
    const onChange = (event: Event) => setConsent((event as CustomEvent<Consent>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Nothing to ask about when no analytics are configured.
  if (!GA_ID && !CLARITY_ID) return null;

  return (
    <>
      {consent === null && <CookieNotice />}

      {consent === "granted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {consent === "granted" && CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      )}
    </>
  );
}

function CookieNotice() {
  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-measure flex-col gap-4 rounded-md border border-border bg-surface-raised p-4 shadow-float sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-center sm:p-5"
    >
      <p className="text-body-sm text-ink-secondary">
        We&rsquo;d like to use Google Analytics and Microsoft Clarity to see how the site is used. They only run if
        you agree.{" "}
        <Link href={routes.cookies} className="font-medium text-primary underline-offset-3 hover:underline">
          Cookie policy
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => saveConsent("denied")}
          className="h-9 flex-1 rounded-sm border border-border-strong px-4 text-label text-primary transition-colors duration-150 hover:border-primary sm:flex-none"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => saveConsent("granted")}
          className="h-9 flex-1 rounded-sm bg-primary-fill px-4 text-label text-on-primary-fill transition-colors duration-150 hover:bg-primary-fill-hover sm:flex-none"
        >
          Allow analytics
        </button>
      </div>
    </div>
  );
}

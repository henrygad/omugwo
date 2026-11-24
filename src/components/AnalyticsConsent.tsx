"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { captureAttribution } from "@/lib/analytics";

type Consent = "accepted" | "declined" | null;
const consentKey = "omugwo_analytics_consent";
const consentEvent = "omugwo-analytics-consent-change";

function readConsent(): Consent {
  try {
    const stored = localStorage.getItem(consentKey);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(consentEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(consentEvent, onChange);
  };
}

export function AnalyticsConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);

  useEffect(() => {
    captureAttribution();
  }, []);

  function choose(next: Exclude<Consent, null>) {
    try {
      localStorage.setItem(consentKey, next);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(consentEvent));
  }

  return (
    <>
      {measurementId && consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="omugwo-google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {measurementId && consent === null && (
        <aside className="analytics-consent" aria-label="Analytics preference">
          <p>
            We use privacy-conscious analytics to understand which book pages and
            campaigns help readers. No card details are collected.
          </p>
          <div>
            <button className="button button--primary" onClick={() => choose("accepted")}>
              Allow analytics
            </button>
            <button className="button button--secondary" onClick={() => choose("declined")}>
              Not now
            </button>
          </div>
        </aside>
      )}
    </>
  );
}


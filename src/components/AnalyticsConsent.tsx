"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics";

type ConsentChoice = "accepted" | "declined";
type Consent = ConsentChoice | null | "unknown";
const consentKey = "omugwo_analytics_consent";
const consentEvent = "omugwo-analytics-consent-change";
const consentMaxAge = 365 * 24 * 60 * 60;

function readConsentCookie(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${consentKey}=`))
    ?.split("=")[1];
  return value === "accepted" || value === "declined" ? value : null;
}

function writeConsentCookie(value: ConsentChoice) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentKey}=${value}; Max-Age=${consentMaxAge}; Path=/; SameSite=Lax${secure}`;
}

function readConsent(): Consent {
  const cookieConsent = readConsentCookie();
  if (cookieConsent) return cookieConsent;
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
  const consent = useSyncExternalStore(subscribe, readConsent, () => "unknown");
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if ((consent === "accepted" || consent === "declined") && !readConsentCookie()) {
      writeConsentCookie(consent);
    }
  }, [consent]);

  useEffect(() => {
    if (consent === "accepted") {
      trackEvent("page_view", { page_path: pathname });
    }
  }, [consent, pathname]);

  function choose(next: ConsentChoice) {
    writeConsentCookie(next);
    try {
      localStorage.setItem(consentKey, next);
    } catch {}
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
        <aside className="analytics-consent" aria-label="Cookie preferences">
          <div className="analytics-consent__heading">
            <span>Privacy &amp; cookies</span>
            <h2>Your privacy, your choice.</h2>
          </div>
          <p>
            We use optional analytics cookies and similar browser storage to
            understand how visitors use this website and which campaigns lead to
            book sales. They are activated only if you accept.
          </p>
          <p className="analytics-consent__details">
            Essential storage for website security, checkout, and affiliate
            pricing remains active because these services cannot work correctly
            without it.
          </p>
          <Link className="analytics-consent__link" href="/policies/privacy">
            Read our Cookie &amp; Privacy Policy
          </Link>
          <div className="analytics-consent__actions">
            <button className="button button--primary" onClick={() => choose("accepted")}>
              Accept analytics
            </button>
            <button className="button analytics-consent__reject" onClick={() => choose("declined")}>
              Reject optional cookies
            </button>
          </div>
        </aside>
      )}
    </>
  );
}


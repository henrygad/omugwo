"use client";

import type { OrderAttribution } from "@/types/commerce";
import { getAppCheckToken } from "@/lib/firebase/client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const attributionKey = "omugwo_first_touch";
const visitorKey = "omugwo_visitor_id";
const sessionKey = "omugwo_session_id";

export function trackEvent(
  name: string,
  parameters: Record<string, unknown> = {},
) {
  window.gtag?.("event", name, parameters);
  if (readAnalyticsConsent() === "accepted") {
    void sendFirstPartyEvent(name, parameters);
  }
}

export async function trackEventAndWait(
  name: string,
  parameters: Record<string, unknown> = {},
) {
  window.gtag?.("event", name, parameters);
  if (readAnalyticsConsent() === "accepted") {
    await sendFirstPartyEvent(name, parameters);
  }
}

function readAnalyticsConsent() {
  const cookieConsent = document.cookie
    .split("; ")
    .find((item) => item.startsWith("omugwo_analytics_consent="))
    ?.split("=")[1];
  if (cookieConsent === "accepted" || cookieConsent === "declined") {
    return cookieConsent;
  }
  try {
    return localStorage.getItem("omugwo_analytics_consent");
  } catch {
    return null;
  }
}

function getOrCreateId(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  storage.setItem(key, created);
  return created;
}

function deviceCategory(): "mobile" | "tablet" | "desktop" {
  if (window.innerWidth < 700) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

async function sendFirstPartyEvent(
  name: string,
  parameters: Record<string, unknown>,
) {
  const allowed = new Set([
    "page_view",
    "select_item",
    "begin_checkout",
    "add_payment_info",
    "purchase",
    "share",
  ]);
  if (!allowed.has(name)) return;

  try {
    const attribution = readAttribution();
    const appCheckToken = await getAppCheckToken();
    await fetch("/api/analytics", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
      },
      body: JSON.stringify({
        visitorId: getOrCreateId(localStorage, visitorKey),
        sessionId: getOrCreateId(sessionStorage, sessionKey),
        event: name,
        path: window.location.pathname,
        source: attribution?.source,
        medium: attribution?.medium,
        campaign: attribution?.campaign,
        device: deviceCategory(),
        edition:
          typeof parameters.item_name === "string"
            ? parameters.item_name
            : undefined,
        method:
          typeof parameters.method === "string" ? parameters.method : undefined,
        value:
          typeof parameters.value === "number" ? parameters.value : undefined,
        orderId:
          typeof parameters.order_id === "string"
            ? parameters.order_id
            : undefined,
      }),
    });
  } catch {
    // Analytics must never interrupt browsing or checkout.
  }
}

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(attributionKey)) return;
    const query = new URLSearchParams(window.location.search);
    let referrer: string | undefined;
    try {
      referrer = document.referrer ? new URL(document.referrer).origin : undefined;
    } catch {
      referrer = undefined;
    }
    const attribution: OrderAttribution = {
      source: query.get("utm_source") ?? undefined,
      medium: query.get("utm_medium") ?? undefined,
      campaign: query.get("utm_campaign") ?? undefined,
      content: query.get("utm_content") ?? undefined,
      term: query.get("utm_term") ?? undefined,
      referrer,
      landingPage: window.location.pathname,
    };
    sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
  } catch {
    // Checkout remains available when browser storage is disabled.
  }
}

export function readAttribution(): OrderAttribution | undefined {
  try {
    const stored = sessionStorage.getItem(attributionKey);
    return stored ? (JSON.parse(stored) as OrderAttribution) : undefined;
  } catch {
    return undefined;
  }
}


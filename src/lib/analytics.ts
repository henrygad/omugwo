"use client";

import type { OrderAttribution } from "@/types/commerce";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const attributionKey = "omugwo_first_touch";

export function trackEvent(
  name: string,
  parameters: Record<string, unknown> = {},
) {
  window.gtag?.("event", name, parameters);
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


import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { connection } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { AnalyticsEventView, VisitorView } from "@/types/commerce";

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

export async function getVisitorAnalytics() {
  await connection();
  const db = getAdminDb();
  const [visitorSnapshot, eventSnapshot] = await Promise.all([
    db.collection("analyticsVisitors").orderBy("lastSeenAt", "desc").limit(500).get(),
    db.collection("analyticsEvents").orderBy("createdAt", "desc").limit(2500).get(),
  ]);
  const visitors: VisitorView[] = visitorSnapshot.docs.map((document) => {
    const value = document.data();
    return {
      id: document.id,
      sessionCount: Number(value.sessionCount ?? 0),
      pageViews: Number(value.pageViews ?? 0),
      eventCount: Number(value.eventCount ?? 0),
      source: String(value.source ?? "Direct / unknown"),
      ...(value.medium ? { medium: String(value.medium) } : {}),
      ...(value.campaign ? { campaign: String(value.campaign) } : {}),
      device: ["mobile", "tablet", "desktop"].includes(String(value.device))
        ? (value.device as VisitorView["device"])
        : "desktop",
      lastPath: String(value.lastPath ?? "/"),
      ...(value.linkedOrderId
        ? { linkedOrderId: String(value.linkedOrderId) }
        : {}),
      ...(value.convertedOrderId
        ? { convertedOrderId: String(value.convertedOrderId) }
        : {}),
      firstSeenAt: isoDate(value.firstSeenAt),
      lastSeenAt: isoDate(value.lastSeenAt),
    };
  });
  const events: AnalyticsEventView[] = eventSnapshot.docs.map((document) => {
    const value = document.data();
    return {
      id: document.id,
      visitorId: String(value.visitorId ?? ""),
      event: String(value.event ?? ""),
      path: String(value.path ?? "/"),
      source: String(value.source ?? "Direct / unknown"),
      device: String(value.device ?? "unknown"),
      ...(value.edition ? { edition: String(value.edition) } : {}),
      ...(value.method ? { method: String(value.method) } : {}),
      ...(typeof value.value === "number" ? { value: value.value } : {}),
      ...(value.orderId ? { orderId: String(value.orderId) } : {}),
      createdAt: isoDate(value.createdAt),
    };
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const within = (date: string, days: number) =>
    Boolean(date) && now - new Date(date).getTime() <= days * day;
  const recentEvents = events.filter((event) => within(event.createdAt, 30));
  const topSources = new Map<string, number>();
  for (const visitor of visitors.filter((item) => within(item.lastSeenAt, 30))) {
    topSources.set(visitor.source, (topSources.get(visitor.source) ?? 0) + 1);
  }
  const topPaths = new Map<string, number>();
  for (const event of recentEvents.filter((item) => item.event === "page_view")) {
    topPaths.set(event.path, (topPaths.get(event.path) ?? 0) + 1);
  }
  const byCount = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8);

  return {
    visitorsToday: visitors.filter((item) => within(item.lastSeenAt, 1)).length,
    visitorsSevenDays: visitors.filter((item) => within(item.lastSeenAt, 7)).length,
    visitorsThirtyDays: visitors.filter((item) => within(item.lastSeenAt, 30)).length,
    pageViewsThirtyDays: recentEvents.filter((item) => item.event === "page_view").length,
    checkoutStartsThirtyDays: recentEvents.filter((item) => item.event === "begin_checkout").length,
    purchasesThirtyDays: recentEvents.filter((item) => item.event === "purchase").length,
    sharesThirtyDays: recentEvents.filter((item) => item.event === "share").length,
    topSources: byCount(topSources),
    topPaths: byCount(topPaths),
    recentVisitors: visitors.slice(0, 50),
    recentEvents: events.slice(0, 100),
    capped: visitorSnapshot.size === 500 || eventSnapshot.size === 2500,
  };
}


import {
  AggregateField,
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import { connection } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type {
  FulfillmentStatus,
  OrderView,
  PaymentStatus,
  ReviewStatus,
  ReviewView,
} from "@/types/commerce";
import type { EditionId } from "@/config/site";
import { sendPreorderUpdateEmail } from "@/lib/email/preorder-update";
import type { OrderAttribution, OrderCustomer } from "@/types/commerce";

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function orderFromDocument(document: DocumentSnapshot): OrderView {
  const value = document.data() ?? {};
  const customer = value.customer as Record<string, unknown>;
  return {
    id: document.id,
    customer: {
      email: String(customer.email ?? ""),
      ...(customer.name ? { name: String(customer.name) } : {}),
      ...(customer.phone ? { phone: String(customer.phone) } : {}),
      ...(customer.country ? { country: String(customer.country) } : {}),
      ...(customer.state ? { state: String(customer.state) } : {}),
      ...(customer.city ? { city: String(customer.city) } : {}),
      ...(customer.address ? { address: String(customer.address) } : {}),
    },
    edition: value.edition as EditionId,
    editionName: String(value.editionName),
    quantity: 1,
    amount: Number(value.amount),
    currency: "NGN",
    paystackReference: String(value.paystackReference),
    paymentStatus: value.paymentStatus as PaymentStatus,
    fulfillmentStatus: value.fulfillmentStatus as FulfillmentStatus,
    ...(value.paystackTransactionId
      ? { paystackTransactionId: String(value.paystackTransactionId) }
      : {}),
    ...(value.paymentChannel
      ? { paymentChannel: String(value.paymentChannel) }
      : {}),
    marketingConsent: Boolean(value.marketingConsent),
    ...(value.attribution
      ? { attribution: value.attribution as OrderAttribution }
      : {}),
    ...(value.trackingNumber
      ? { trackingNumber: String(value.trackingNumber) }
      : {}),
    ...(value.fulfillmentNote
      ? { fulfillmentNote: String(value.fulfillmentNote) }
      : {}),
    createdAt: isoDate(value.createdAt),
    updatedAt: isoDate(value.updatedAt),
    ...(value.paidAt ? { paidAt: isoDate(value.paidAt) } : {}),
    ...(value.fulfilledAt ? { fulfilledAt: isoDate(value.fulfilledAt) } : {}),
    ...(value.recoveryEmailSentAt
      ? { recoveryEmailSentAt: isoDate(value.recoveryEmailSentAt) }
      : {}),
    ...(value.reviewRequestSentAt
      ? { reviewRequestSentAt: isoDate(value.reviewRequestSentAt) }
      : {}),
  };
}

function reviewFromDocument(document: DocumentSnapshot): ReviewView {
  const value = document.data() ?? {};
  return {
    id: document.id,
    name: String(value.name),
    email: String(value.email),
    rating: Number(value.rating),
    comment: String(value.comment),
    status: value.status as ReviewStatus,
    createdAt: isoDate(value.createdAt),
    updatedAt: isoDate(value.updatedAt),
  };
}

function isMissingIndexError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const code = "code" in error ? String(error.code) : "";
  return code === "9" || code === "failed-precondition" || error.message.includes("FAILED_PRECONDITION");
}

async function getPaidSalesTotal(orders: CollectionReference) {
  try {
    const result = await orders
      .where("paymentStatus", "==", "paid")
      .aggregate({ total: AggregateField.sum("amount") })
      .get();
    return Number(result.data().total ?? 0);
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    const paidOrders = await orders
      .where("paymentStatus", "==", "paid")
      .select("amount")
      .get();
    return paidOrders.docs.reduce(
      (total, document) => total + Number(document.get("amount") ?? 0),
      0,
    );
  }
}

export async function getDashboardOverview() {
  await connection();
  const db = getAdminDb();
  const orders = db.collection("orders");
  const reviews = db.collection("reviews");
  const [total, paid, pending, pendingReviews, sales, recentOrders, paidOrderData, awaitingDeliveries] =
    await Promise.all([
      orders.count().get(),
      orders.where("paymentStatus", "==", "paid").count().get(),
      orders.where("paymentStatus", "==", "pending").count().get(),
      reviews.where("status", "==", "pending").count().get(),
      getPaidSalesTotal(orders),
      orders.orderBy("createdAt", "desc").limit(6).get(),
      orders.where("paymentStatus", "==", "paid").limit(500).get(),
      db
        .collection("digitalDeliveries")
        .where("deliveryStatus", "==", "awaiting_approval")
        .count()
        .get(),
    ]);

  const paidOrders = paidOrderData.docs.map(orderFromDocument);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const lagosDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayKey = lagosDate.format(new Date(now));
  const salesToday = paidOrders
    .filter(
      (order) =>
        order.paidAt && lagosDate.format(new Date(order.paidAt)) === todayKey,
    )
    .reduce((sum, order) => sum + order.amount, 0);
  const revenueSince = (days: number) =>
    paidOrders
      .filter((order) => order.paidAt && now - new Date(order.paidAt).getTime() <= days * day)
      .reduce((sum, order) => sum + order.amount, 0);
  const sourceMap = new Map<string, number>();
  for (const order of paidOrders) {
    let source = order.attribution?.source || "Direct / unknown";
    if (!order.attribution?.source && order.attribution?.referrer) {
      try {
        source = new URL(order.attribution.referrer).hostname;
      } catch {
        source = "Referral";
      }
    }
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
  }
  const sources = [...sourceMap.entries()]
    .map(([source, orderCount]) => ({ source, orders: orderCount }))
    .sort((left, right) => right.orders - left.orders)
    .slice(0, 5);
  const paperbackPipeline = paidOrders
    .filter((order) => order.edition === "paperback")
    .reduce<Record<string, number>>((result, order) => {
      result[order.fulfillmentStatus] = (result[order.fulfillmentStatus] ?? 0) + 1;
      return result;
    }, {});

  return {
    totalOrders: total.data().count,
    paidOrders: paid.data().count,
    pendingPayments: pending.data().count,
    pendingReviews: pendingReviews.data().count,
    totalSales: sales,
    salesToday,
    salesSevenDays: revenueSince(7),
    salesThirtyDays: revenueSince(30),
    conversionRate: total.data().count
      ? Math.round((paid.data().count / total.data().count) * 1000) / 10
      : 0,
    digitalSales: paidOrders.filter((order) => order.edition === "digital").length,
    paperbackSales: paidOrders.filter((order) => order.edition === "paperback").length,
    marketingSubscribers: paidOrders.filter((order) => order.marketingConsent).length,
    awaitingDeliveries: awaitingDeliveries.data().count,
    sources,
    paperbackPipeline,
    recentOrders: recentOrders.docs.map(orderFromDocument),
  };
}

export async function listOrders(input: {
  search?: string;
  payment?: string;
  fulfillment?: string;
  edition?: string;
  page: number;
}) {
  await connection();
  const snapshot = await getAdminDb()
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(250)
    .get();
  const search = input.search?.toLowerCase().trim();
  const filtered = snapshot.docs.map(orderFromDocument).filter((order) => {
    const searchable = [
      order.id,
      order.paystackReference,
      order.customer.name ?? "",
      order.customer.email,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!search || searchable.includes(search)) &&
      (!input.payment || order.paymentStatus === input.payment) &&
      (!input.fulfillment || order.fulfillmentStatus === input.fulfillment) &&
      (!input.edition || order.edition === input.edition)
    );
  });
  const pageSize = 20;
  const page = Math.max(1, input.page);

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    page,
    pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    total: filtered.length,
    capped: snapshot.size === 250,
  };
}

export async function listReviews(status?: string) {
  await connection();
  const snapshot = await getAdminDb()
    .collection("reviews")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  const reviews = snapshot.docs.map(reviewFromDocument);
  return status ? reviews.filter((review) => review.status === status) : reviews;
}

export async function getOrder(orderId: string) {
  await connection();
  const document = await getAdminDb().collection("orders").doc(orderId).get();
  return document.exists ? orderFromDocument(document) : null;
}

export async function updateFulfillment(
  orderId: string,
  status: FulfillmentStatus,
  administratorId: string,
  details: { trackingNumber?: string; note?: string } = {},
) {
  const db = getAdminDb();
  const emailInput = await db.runTransaction(async (transaction) => {
    const order = db.collection("orders").doc(orderId);
    const snapshot = await transaction.get(order);
    if (!snapshot.exists) throw new Error("Order not found.");
    const value = snapshot.data() ?? {};
    transaction.update(order, {
      fulfillmentStatus: status,
      trackingNumber: details.trackingNumber ?? "",
      fulfillmentNote: details.note ?? "",
      ...(["fulfilled", "delivered"].includes(status)
        ? { fulfilledAt: FieldValue.serverTimestamp() }
        : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: "order.fulfillment_updated",
      orderId,
      status,
      administratorId,
      createdAt: FieldValue.serverTimestamp(),
    });
    if (value.edition !== "paperback" || value.fulfillmentStatus === status) {
      return null;
    }
    return {
      customer: value.customer as OrderCustomer,
      reference: String(value.paystackReference),
    };
  });

  if (emailInput) {
    try {
      const messageId = await sendPreorderUpdateEmail({
        orderId,
        name: emailInput.customer.name ?? "Reader",
        email: emailInput.customer.email,
        reference: emailInput.reference,
        status,
        trackingNumber: details.trackingNumber,
        note: details.note,
      });
      if (messageId) {
        await db.collection("orders").doc(orderId).update({
          preorderUpdateEmailStatus: "sent",
          preorderUpdateEmailMessageId: messageId,
          preorderUpdateEmailSentAt: FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      await db.collection("orders").doc(orderId).update({
        preorderUpdateEmailStatus: "failed",
        preorderUpdateEmailError:
          error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
      });
    }
  }
}

export async function moderateReview(
  reviewId: string,
  status: "approved" | "rejected",
  administratorId: string,
) {
  const db = getAdminDb();
  await db.runTransaction(async (transaction) => {
    const review = db.collection("reviews").doc(reviewId);
    const snapshot = await transaction.get(review);
    if (!snapshot.exists) throw new Error("Review not found.");
    transaction.update(review, {
      status,
      updatedAt: FieldValue.serverTimestamp(),
      moderatedBy: administratorId,
      moderatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: `review.${status}`,
      reviewId,
      administratorId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

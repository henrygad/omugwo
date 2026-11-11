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
    createdAt: isoDate(value.createdAt),
    updatedAt: isoDate(value.updatedAt),
    ...(value.paidAt ? { paidAt: isoDate(value.paidAt) } : {}),
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
  const [total, paid, pending, pendingReviews, sales, recentOrders] =
    await Promise.all([
      orders.count().get(),
      orders.where("paymentStatus", "==", "paid").count().get(),
      orders.where("paymentStatus", "==", "pending").count().get(),
      reviews.where("status", "==", "pending").count().get(),
      getPaidSalesTotal(orders),
      orders.orderBy("createdAt", "desc").limit(6).get(),
    ]);

  return {
    totalOrders: total.data().count,
    paidOrders: paid.data().count,
    pendingPayments: pending.data().count,
    pendingReviews: pendingReviews.data().count,
    totalSales: sales,
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
) {
  const db = getAdminDb();
  await db.runTransaction(async (transaction) => {
    const order = db.collection("orders").doc(orderId);
    const snapshot = await transaction.get(order);
    if (!snapshot.exists) throw new Error("Order not found.");
    transaction.update(order, {
      fulfillmentStatus: status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection("auditLogs").doc(), {
      action: "order.fulfillment_updated",
      orderId,
      status,
      administratorId,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
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

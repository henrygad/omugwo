import { FieldValue } from "firebase-admin/firestore";
import { editions, type EditionId } from "@/config/site";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack/client";
import type { OrderCustomer, PaymentStatus } from "@/types/commerce";
import type { OrderView } from "@/types/commerce";

export async function createPendingOrder(input: {
  edition: EditionId;
  customer: OrderCustomer;
  callbackUrl: string;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured.");
  }

  const db = getAdminDb();
  const orderRef = db.collection("orders").doc();
  const edition = editions[input.edition];
  const reference = `OMG-${orderRef.id}`;
  const now = FieldValue.serverTimestamp();

  await orderRef.create({
    customer: input.customer,
    edition: edition.format,
    editionName: edition.name,
    quantity: 1,
    amount: edition.price,
    currency: edition.currency,
    paystackReference: reference,
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    termsVersion: "2026-11-11",
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  try {
    const transaction = await initializePaystackTransaction({
      email: input.customer.email,
      amount: edition.price * 100,
      reference,
      callbackUrl: input.callbackUrl,
      orderId: orderRef.id,
    });
    return {
      orderId: orderRef.id,
      reference,
      authorizationUrl: transaction.authorization_url,
    };
  } catch (error) {
    await orderRef.update({
      paymentStatus: "failed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw error;
  }
}

export async function verifyAndApplyPayment(reference: string) {
  const db = getAdminDb();
  const match = await db
    .collection("orders")
    .where("paystackReference", "==", reference)
    .limit(1)
    .get();
  const orderDocument = match.docs[0];
  if (!orderDocument) throw new Error("Order not found.");

  const order = orderDocument.data();
  const transaction = await verifyPaystackTransaction(reference);
  const validPayment =
    transaction.status === "success" &&
    transaction.reference === reference &&
    transaction.amount === order.amount * 100 &&
    transaction.currency === order.currency;

  const unsuccessfulStatus: PaymentStatus =
    transaction.status === "abandoned" ? "abandoned" : "failed";

  await db.runTransaction(async (firestoreTransaction) => {
    const fresh = await firestoreTransaction.get(orderDocument.ref);
    if (!fresh.exists || fresh.data()?.paymentStatus === "paid") return;

    if (!validPayment) {
      firestoreTransaction.update(orderDocument.ref, {
        paymentStatus: unsuccessfulStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    firestoreTransaction.update(orderDocument.ref, {
      paymentStatus: "paid",
      paystackTransactionId: String(transaction.id),
      paymentChannel: transaction.channel ?? "unknown",
      paidAt: transaction.paid_at
        ? new Date(transaction.paid_at)
        : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    firestoreTransaction.create(db.collection("auditLogs").doc(), {
      action: "payment.verified",
      orderId: orderDocument.id,
      reference,
      source: "paystack",
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  const updated = await orderDocument.ref.get();
  const value = updated.data() ?? {};
  return {
    id: updated.id,
    customer: value.customer as OrderCustomer,
    edition: value.edition as EditionId,
    editionName: String(value.editionName),
    quantity: 1,
    amount: Number(value.amount),
    currency: "NGN",
    paystackReference: String(value.paystackReference),
    paymentStatus: value.paymentStatus as PaymentStatus,
    fulfillmentStatus: value.fulfillmentStatus as OrderView["fulfillmentStatus"],
    createdAt: value.createdAt?.toDate?.().toISOString?.() ?? "",
    updatedAt: value.updatedAt?.toDate?.().toISOString?.() ?? "",
    ...(value.paidAt
      ? { paidAt: value.paidAt?.toDate?.().toISOString?.() ?? "" }
      : {}),
  } satisfies OrderView;
}
